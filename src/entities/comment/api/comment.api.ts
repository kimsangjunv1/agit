import { clientApi } from "@/shared/lib/api/client";
import type {
    DeleteCommentManagerResponse,
    GetCommentDetailResponse,
    GetCommentLatestListResponse,
    GetCommentManagerListResponse,
    SetCommentPayload,
    SetCommentResponse,
} from "@/entities/comment/model/comment.type";

/**
 * 댓글 - 게시물에 해당하는 댓글 목록 불러오기
 */
export const getCommentListFetch = (idx: number, page: number) => {
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    const url = `/api/v1/get/comment/detail/${idx}?${params}`;
    return clientApi.get<GetCommentDetailResponse>(url);
};

/**
 * 댓글 - 모든 게시물에서 최신 댓글 10개 불러오기
 */
export const getCommentLatestListFetch = () => {
    const url = `/api/v1/get/comment/latest`;
    return clientApi.get<GetCommentLatestListResponse>(url);
};

/**
 * 댓글 - 생성
 */
export const setCommentFetch = (data: SetCommentPayload) => clientApi.post<SetCommentResponse>("/api/v1/set/comment/create", data);

export const getCommentManagerListFetch = () => clientApi.get<GetCommentManagerListResponse>("/api/v1/get/comment/manager");

export const deleteCommentManagerFetch = (data: { idx: number }) => clientApi.delete<DeleteCommentManagerResponse>("/api/v1/delete/comment/manager", { body: data });
