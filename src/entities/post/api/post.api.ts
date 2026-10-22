import { clientApi } from "@/shared/lib/api/client";
import {
    DeletePostManagerResponse,
    GetPostDetailResponse,
    GetPostLatestListResponse,
    GetPostListResponse,
    GetPostManagerListResponse,
    PatchPostResponse,
    SetIncrementPostViewResponse,
    SetPostResponse,
    PostDraftPayload,
    PostDraftListItem,
    PostDraftDetail,
} from "@/entities/post/model/post.type";
import type { ApiResponse } from "@/shared/model/common.type";
import type { PostTypeFilter } from "@/entities/post/model/postSettings";

/**
 * 포스트 - 목록 조회
 */
export const getPostListFetch = (type: PostTypeFilter = "all", page?: number) => {
    const params = new URLSearchParams({ pageSize: page === undefined ? "0" : "10" });
    if (page !== undefined) params.set("page", String(page));
    if (type !== "all") params.set("type", type);
    const url = `/api/v1/get/post?${params}`;
    return clientApi.get<GetPostListResponse>(url);
};

/**
 * 포스트 - 상세 조회
 */
export const getPostDetailFetch = (idx: number) => {
    const url = `/api/v1/get/post/${idx}`;
    return clientApi.get<GetPostDetailResponse>(url, {
        headers: { "x-skip-tracking": "true" },
    });
};

/**
 * 포스트 - 최근 생성한 목록 조회 (10개)
 */
export const getPostLatestListFetch = (type: PostTypeFilter = "all") => {
    const url = `/api/v1/get/post/latest${type === "all" ? "" : `?type=${type}`}`;
    return clientApi.get<GetPostLatestListResponse>(url);
};

/**
 * 포스트 - 생성
 */
export const setPostFetch = (data: unknown) => clientApi.post<SetPostResponse>("/api/v1/set/post/create", data);

export const getPostDraftListFetch = () => clientApi.get<ApiResponse<PostDraftListItem[]>>("/api/v1/post/drafts");

export const getPostDraftDetailFetch = (id: string) => clientApi.get<ApiResponse<PostDraftDetail>>(`/api/v1/post/drafts/${encodeURIComponent(id)}`);

export const setPostDraftFetch = (payload: PostDraftPayload & { id?: string }) => clientApi.post<ApiResponse<{ id: string }>>("/api/v1/post/drafts", payload);

/**
 * 포스트 - 수정
 */
export const patchPostFetch = ({ data, idx }: { data: unknown; idx: number }) => clientApi.patch<PatchPostResponse>(`/api/v1/patch/post/${idx}`, data);

export const getPostManagerListFetch = () => clientApi.get<GetPostManagerListResponse>("/api/v1/get/post/manager");

export const deletePostManagerFetch = (data: { idx: number }) =>
    clientApi.delete<DeletePostManagerResponse>("/api/v1/delete/post/manager", {
        body: data,
    });

/**
 * 포스트 - 조회수 증가(사용안함)
 */
export const setPostViewIncrementFetch = (data: { postId: number; userId?: string }) => clientApi.post<SetIncrementPostViewResponse>(`/api/v1/set/view/increment`, data);
