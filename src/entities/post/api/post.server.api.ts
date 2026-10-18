import { serverApi } from "@/shared/lib/api/server";
import { GetPostDetailResponse, GetPostLatestListResponse } from "@/entities/post/model/post.type";

/**
 * 포스트 - 상세 ISR/SSR 조회 (조회수 증가 없음)
 */
export const getPostDetailServerFetch = (idx: number) =>
    serverApi.get<GetPostDetailResponse>(`/api/v1/get/post/${idx}`, {
        headers: { "x-internal-fetch": "isr" },
        throwOnError: false,
        skipAuth: true,
    });

/**
 * 포스트 - 최근 목록 SSR 조회
 */
export const getPostLatestListServerFetch = () =>
    serverApi.get<GetPostLatestListResponse>("/api/v1/get/post/latest", {
        skipAuth: true,
    });
