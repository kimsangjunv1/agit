import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { updatePostLikeCaches } from "./updatePostLikeCaches";

const response = (result: unknown) => ({ result, resultCode: "SUCCESS", resultMessage: "ok", pagination: null });

describe("Cheer Up confirmed cache counts", () => {
    it("updates detail and all list shapes without changing other viewers or posts", () => {
        const client = new QueryClient();
        const detail = ["post", "detail", 1, "reader"];
        const list = ["post", "list", "all", "reader"];
        const latest = ["post", "latest", "all", "reader"];
        const infinite = ["post", "infinite", "all", "reader"];
        const other = ["post", "detail", 1, "other"];
        const items = [{ idx: 1, likes: 10, title: "글" }, { idx: 2, likes: 3, title: "다른 글" }];
        client.setQueryData(detail, response(items[0]));
        client.setQueryData(list, response(items));
        client.setQueryData(latest, response(items));
        client.setQueryData(infinite, { pages: [response(items)], pageParams: [1] });
        client.setQueryData(other, response(items[0]));
        updatePostLikeCaches(client, 1, "reader", 310);
        expect(client.getQueryData(detail)).toEqual(response({ ...items[0], likes: 310 }));
        expect(client.getQueryData(list)).toEqual(response([{ ...items[0], likes: 310 }, items[1]]));
        expect(client.getQueryData(latest)).toEqual(client.getQueryData(list));
        expect(client.getQueryData(infinite)).toEqual({ pages: [client.getQueryData(list)], pageParams: [1] });
        expect(client.getQueryData(other)).toEqual(response(items[0]));
        client.clear();
    });

    it("updates a signed-out viewer's cache when the viewer key is null", () => {
        const client = new QueryClient();
        const detail = ["post", "detail", 1, null];
        const list = ["post", "list", "all", null];
        client.setQueryData(detail, response({ idx: 1, likes: 10 }));
        client.setQueryData(list, response([{ idx: 1, likes: 10 }]));
        updatePostLikeCaches(client, 1, null, 11);
        expect(client.getQueryData(detail)).toEqual(response({ idx: 1, likes: 11 }));
        expect(client.getQueryData(list)).toEqual(response([{ idx: 1, likes: 11 }]));
        client.clear();
    });

    it("keeps a newer cached total when an older request finishes later", () => {
        const client = new QueryClient();
        const key = ["post", "detail", 1, "reader"];
        client.setQueryData(key, response({ idx: 1, likes: 320 }));
        updatePostLikeCaches(client, 1, "reader", 310);
        expect(client.getQueryData(key)).toEqual(response({ idx: 1, likes: 320 }));
        client.clear();
    });
});
