import { NextResponse } from "next/server";

import type { ApiPaginationResponse, ApiResponse } from "@/shared/model/common.type";

export function buildPagination(params: { page: number; pageSize: number; totalCount: number }): ApiPaginationResponse {
    const { page, pageSize, totalCount } = params;
    const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;

    return {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
    };
}

export function getPageParams(searchParams: URLSearchParams, defaultPageSize = 10) {
    const page = parseInt(searchParams.get("page") || searchParams.get("pageNum") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || String(defaultPageSize), 10);

    return { page, pageSize };
}

export function buildPaginationFromQuery(searchParams: URLSearchParams, totalCount: number, defaultPageSize = 10): ApiPaginationResponse {
    const { page, pageSize } = getPageParams(searchParams, defaultPageSize);
    return buildPagination({ page, pageSize, totalCount });
}

export function singleItemPagination(): ApiPaginationResponse {
    return buildPagination({ page: 1, pageSize: 1, totalCount: 1 });
}

export function apiSuccess<T>(
    result: T,
    options?: {
        resultMessage?: string;
        pagination?: ApiPaginationResponse | null;
        status?: number;
    },
) {
    const body: ApiResponse<T> = {
        pagination: options?.pagination ?? null,
        result,
        resultCode: "SUCCESS",
        resultMessage: options?.resultMessage ?? "조회성공",
    };

    return NextResponse.json(body, { status: options?.status ?? 200 });
}

export function apiError(
    resultMessage: string,
    options?: {
        resultCode?: string;
        status?: number;
        result?: unknown;
        pagination?: ApiPaginationResponse | null;
    },
) {
    const body: ApiResponse<unknown> = {
        pagination: options?.pagination ?? null,
        result: options?.result ?? null,
        resultCode: options?.resultCode ?? "ERROR",
        resultMessage,
    };

    return NextResponse.json(body, { status: options?.status ?? 500 });
}

export function resolveRouteError(error: unknown, fallback = "문제가 생겼습니다") {
    const message = error instanceof Error ? error.message : fallback;
    const status = typeof error === "object" && error !== null && "status" in error && typeof (error as { status: unknown }).status === "number" ? (error as { status: number }).status : 500;

    return { message, status };
}
