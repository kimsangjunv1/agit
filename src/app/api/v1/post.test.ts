import { beforeEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { supabaseAdmin, supabaseServer } from "@/shared/lib/supabase/supabaseServer";
import { assertPostImagesReadable } from "@/entities/post/api/postAccess.server";
import { GET as getList } from "./get/post/route";
import { GET as getDetail } from "./get/post/[idx]/route";
import { GET as getLatest } from "./get/post/latest/route";
import { GET as search } from "./get/search/route";
import { GET as getImage } from "./post/image/[...path]/route";
import { POST as createPost } from "./set/post/create/route";
import { PATCH as updatePost } from "./patch/post/[idx]/route";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/shared/lib/authOptions", () => ({ authOptions: {} }));
vi.mock("@/shared/lib/supabase/supabaseServer", () => ({ supabaseAdmin: vi.fn(), supabaseServer: vi.fn() }));
vi.mock("@/shared/lib/revalidatePost", () => ({ revalidatePostPages: vi.fn() }));

const ownerId = "11111111-1111-4111-8111-111111111111";
const otherId = "22222222-2222-4222-8222-222222222222";
const posts = [
    { idx: 1, title: "공개 기록", post_type: "article", visibility: "public", user_id: null },
    { idx: 2, title: "나의 비공개 기록", post_type: "diary", visibility: "private", user_id: ownerId },
    { idx: 3, title: "다른 사람의 비공개 기록", post_type: "diary", visibility: "private", user_id: otherId },
    { idx: 4, title: "TIL 기록", post_type: "til", visibility: "public", user_id: ownerId },
    { idx: 5, title: "공개 일기 기록", post_type: "diary", visibility: "public", user_id: ownerId },
];

// 쿼리에 접근 조건을 빠뜨리면 모든 fixture가 반환되므로 비공개 글 유출을 잡는다.
const createQuery = (table: string) => {
    let rows = table === "posts" ? [...posts] : [];
    let single = false;
    const query: any = {
        select: () => query,
        insert: (payload: unknown) => {
            database.inserted.push(payload);
            return query;
        },
        update: (payload: unknown) => {
            database.updated.push(payload);
            return query;
        },
        eq: (field: string, value: unknown) => {
            rows = rows.filter((row) => String(row[field as keyof typeof row]) === String(value));
            return query;
        },
        or: (filter: string) => {
            if (table === "posts" && filter.includes("visibility.eq.public")) {
                const viewer = filter.match(/user_id\.eq\.([a-f0-9-]+)/)?.[1];
                rows = rows.filter((row) => row.visibility === "public" || (row.visibility === "private" && row.user_id === viewer));
            }
            return query;
        },
        lt: (_field: string, value: number) => {
            rows = rows.filter((row) => row.idx < Number(value));
            return query;
        },
        gt: (_field: string, value: number) => {
            rows = rows.filter((row) => row.idx > Number(value));
            return query;
        },
        order: (_field: string, options: { ascending: boolean }) => {
            rows.sort((a, b) => (options.ascending ? a.idx - b.idx : b.idx - a.idx));
            return query;
        },
        limit: (limit: number) => {
            rows = rows.slice(0, limit);
            return query;
        },
        range: (from: number, to: number) => {
            rows = rows.slice(from, to + 1);
            return query;
        },
        single: () => {
            single = true;
            return query;
        },
        maybeSingle: () => {
            single = true;
            return query;
        },
        then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: single ? (rows[0] ?? null) : rows, count: rows.length, error: null }).then(resolve),
    };
    return query;
};

const database = {
    from: vi.fn(createQuery),
    inserted: [] as unknown[],
    updated: [] as unknown[],
    rpc: vi.fn(),
    storage: { from: vi.fn(() => ({ download })) },
};
const download = vi.fn();

const login = (id: string, role: "admin" | "user" = "user") =>
    vi.mocked(getServerSession).mockResolvedValue({
        user: { id, name: "작성자", email: "test@example.com", role },
        expires: "2099-01-01",
    });
const request = (path: string, headers?: HeadersInit) => new Request(`http://localhost/api/v1/${path}`, { headers });

beforeEach(() => {
    vi.clearAllMocks();
    database.inserted = [];
    database.updated = [];
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(supabaseAdmin).mockReturnValue(database as unknown as ReturnType<typeof supabaseAdmin>);
    vi.mocked(supabaseServer).mockResolvedValue(database as unknown as Awaited<ReturnType<typeof supabaseServer>>);
    database.rpc.mockResolvedValue({ data: false, error: null });
    download.mockResolvedValue({ data: new Blob(["image"], { type: "image/webp" }), error: null });
});

describe("게시글 공개 범위", () => {
    it("비회원 목록에 비공개 글이 섞이지 않고 공용 캐시를 막는다", async () => {
        const response = await getList(request("get/post"));
        expect((await response.json()).result.map((post: { idx: number }) => post.idx)).toEqual([1, 4, 5]);
        expect(response.headers.get("Cache-Control")).toContain("private, no-store");
        expect(response.headers.get("Vary")).toContain("Cookie");
    });

    it("x-user-id를 위조해도 비공개 글을 읽을 수 없다", async () => {
        const response = await getDetail(request("get/post/2", { "x-user-id": ownerId }));
        expect(response.status).toBe(404);
        expect(await response.text()).not.toContain("나의 비공개 기록");
    });

    it("작성자는 비공개 글을 읽고 이전·다음 글에는 다른 작성자의 비공개 글이 제외된다", async () => {
        login(ownerId);
        const response = await getDetail(request("get/post/2", { "x-skip-tracking": "true" }));
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.result.title).toBe("나의 비공개 기록");
        expect(body.result.prev).toBeNull();
        expect(body.result.next.idx).toBe(5);
    });

    it("관리자도 다른 작성자의 비공개 글은 읽을 수 없다", async () => {
        login(otherId, "admin");
        const response = await getDetail(request("get/post/2"));
        expect(response.status).toBe(404);
    });

    it("글 종류 필터는 조회 결과에 적용된다", async () => {
        login(ownerId);
        const response = await getLatest(request("get/post/latest?type=til"));
        expect((await response.json()).result.map((post: { idx: number }) => post.idx)).toEqual([4]);
    });

    it("지원하지 않는 글 종류를 거부한다", async () => {
        expect((await getLatest(request("get/post/latest?type=unknown"))).status).toBe(400);
    });

    it("작성자 검색 후 비회원 검색에 이전 사용자의 비공개 결과가 재사용되지 않는다", async () => {
        login(ownerId);
        const own = await search(request("get/search?keyword=기록"));
        expect((await own.json()).result.some((post: { id: string }) => post.id === "post-2")).toBe(true);
        vi.mocked(getServerSession).mockResolvedValue(null);
        const anonymous = await search(request("get/search?keyword=기록"));
        expect((await anonymous.json()).result.map((post: { id: string }) => post.id)).not.toContain("post-2");
    });
});

describe("이미지 공개 범위", () => {
    const params = { params: Promise.resolve({ path: ["posts", ownerId, "private.webp"] }) };

    it("권한이 없으면 이미지 파일을 다운로드하지 않는다", async () => {
        const response = await getImage(request("post/image/posts/private.webp", { "x-user-id": ownerId }), params);
        expect(response.status).toBe(404);
        expect(download).not.toHaveBeenCalled();
        expect(database.rpc).toHaveBeenCalledWith("can_read_post_image", { p_path: `posts/${ownerId}/private.webp`, p_user_id: null });
    });

    it("허용된 이미지도 공용 캐시에 저장하지 않는다", async () => {
        login(ownerId);
        database.rpc.mockResolvedValue({ data: true, error: null });
        const response = await getImage(request("post/image/posts/private.webp"), params);
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("image/webp");
        expect(response.headers.get("Cache-Control")).toContain("no-store");
    });

    it("다른 사람의 비공개 이미지를 새 글에 붙여 넣는 요청도 거부한다", async () => {
        await expect(assertPostImagesReadable({ thumbnail: `/api/v1/post/image/posts/${otherId}/private.webp`, contents: [] }, ownerId)).rejects.toMatchObject({ status: 403 });
    });
});

describe("게시글 설정 저장", () => {
    const payload = { title: "새 일기", summary: "요약", thumbnail: "/images/picture/post-profile.png", category_idx: 1, contents: [], post_type: "diary", visibility: "private" };
    const save = (body: unknown) => createPost(new Request("http://localhost/api/v1/set/post/create", { method: "POST", body: JSON.stringify(body) }));

    it("글 종류와 공개 범위를 저장하고 작성자·식별자 위조는 무시한다", async () => {
        login(ownerId);
        const response = await save({ ...payload, user_id: otherId, idx: 999, id: "forged" });
        expect(response.status).toBe(200);
        expect(database.inserted).toEqual([{ ...payload, user_id: ownerId }]);
    });

    it("설정이 없는 이전 수정 요청이 비공개 글을 전체공개로 바꾸지 않는다", async () => {
        login(ownerId);
        const { post_type: _type, visibility: _visibility, ...legacyPayload } = payload;
        const response = await updatePost(new Request("http://localhost/api/v1/patch/post/2", { method: "PATCH", body: JSON.stringify(legacyPayload) }));
        expect(response.status).toBe(200);
        expect(database.updated[0]).not.toHaveProperty("visibility");
        expect(database.updated[0]).not.toHaveProperty("post_type");
    });

    it("작성자가 없는 기존 글을 관리자가 비공개로 저장하면 작성자를 지정한다", async () => {
        login(ownerId, "admin");
        const response = await updatePost(new Request("http://localhost/api/v1/patch/post/1", { method: "PATCH", body: JSON.stringify(payload) }));
        expect(response.status).toBe(200);
        expect(database.updated[0]).toMatchObject({ visibility: "private", user_id: ownerId });
    });

    it.each([
        { ...payload, visibility: true },
        { ...payload, visibility: "members" },
        { ...payload, post_type: "unknown" },
    ])("잘못된 설정이 DB에 저장되지 않는다", async (body) => {
        login(ownerId);
        expect((await save(body)).status).toBe(400);
        expect(database.inserted).toHaveLength(0);
    });
});
