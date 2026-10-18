import { describe, expect, it } from "vitest";

import { apiError, apiSuccess, buildPagination, getPageParams, resolveRouteError, singleItemPagination } from "@/shared/lib/utils/apiResponse";

describe("buildPagination", () => {
    it("페이지 메타를 계산한다", () => {
        const result = buildPagination({ page: 2, pageSize: 10, totalCount: 25 });

        expect(result).toEqual({
            page: 2,
            pageSize: 10,
            totalCount: 25,
            totalPages: 3,
            hasNext: true,
            hasPrevious: true,
        });
    });

    it("pageSize가 0이면 totalPages는 0이다", () => {
        const result = buildPagination({ page: 1, pageSize: 0, totalCount: 10 });

        expect(result.totalPages).toBe(0);
        expect(result.hasNext).toBe(false);
    });
});

describe("getPageParams", () => {
    it("pageNum 별칭과 기본 pageSize를 지원한다", () => {
        const params = getPageParams(new URLSearchParams("pageNum=3&pageSize=20"));

        expect(params).toEqual({ page: 3, pageSize: 20 });
    });
});

describe("singleItemPagination", () => {
    it("단일 항목 페이지네이션을 반환한다", () => {
        expect(singleItemPagination()).toEqual({
            page: 1,
            pageSize: 1,
            totalCount: 1,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
        });
    });
});

describe("apiSuccess / apiError", () => {
    it("SUCCESS 응답 본문을 만든다", async () => {
        const response = apiSuccess({ id: 1 }, { resultMessage: "ok" });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({
            pagination: null,
            result: { id: 1 },
            resultCode: "SUCCESS",
            resultMessage: "ok",
        });
    });

    it("ERROR 응답 본문과 상태 코드를 만든다", async () => {
        const response = apiError("실패", {
            status: 400,
            resultCode: "BAD_REQUEST",
        });
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.resultCode).toBe("BAD_REQUEST");
        expect(body.resultMessage).toBe("실패");
    });
});

describe("resolveRouteError", () => {
    it("Error 메시지를 추출한다", () => {
        const result = resolveRouteError(new Error("db down"));

        expect(result).toEqual({ message: "db down", status: 500 });
    });

    it("status가 있는 객체를 처리한다", () => {
        const result = resolveRouteError({ status: 404, message: "missing" });

        expect(result.status).toBe(404);
    });

    it("알 수 없는 값에는 fallback을 사용한다", () => {
        const result = resolveRouteError(null, "custom fallback");

        expect(result.message).toBe("custom fallback");
    });
});
