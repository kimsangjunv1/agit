import { serverApi } from "@/shared/lib/api/server";
import { GetPostDetailResponse, GetPostLatestListResponse } from "@/entities/post/model/post.type";
import { getServerSession } from "next-auth";
import { cache } from "react";
import { authOptions } from "@/shared/lib/authOptions";
import type { PostTypeFilter } from "@/entities/post/model/postSettings";

/**
 * 포스트 - 상세 ISR/SSR 조회 (조회수 증가 없음)
 */
export const getPostDetailServerFetch = cache(async (idx: number): Promise<GetPostDetailResponse> => {
    const session = await getServerSession(authOptions);
    const data = await serverApi.get<GetPostDetailResponse>(`/api/v1/get/post/${idx}`, {
        headers: { "x-internal-fetch": "isr" },
        throwOnError: false,
        cache: "no-store",
    });
    return { ...data, viewerId: session?.user?.id ?? null };
});

/**
 * 포스트 - 최근 목록 SSR 조회
 */
export const getPostLatestListServerFetch = async (type: PostTypeFilter = "all"): Promise<GetPostLatestListResponse> => {
    const session = await getServerSession(authOptions);
    const data = await serverApi.get<GetPostLatestListResponse>(`/api/v1/get/post/latest${type === "all" ? "" : `?type=${type}`}`, {
        cache: "no-store",
    });
    return { ...data, postTypeFilter: type, viewerId: session?.user?.id ?? null };
};
