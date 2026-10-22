import { ApiResponse } from "@/shared/model/common.type";

export interface GetCommentDetailData {
    idx: number;
    id: string;
    post_id: number;
    profile: number;
    author: string;
    msg: string;
    is_admin: boolean;
    is_modified: boolean;
    created_at: string;
    updated_at: string;
    parent_id?: number | null;
    reply_to_id?: number | null;
    reply_to_author?: string | null;
    emoji_id?: string | null;
    deleted_at?: string | null;
    can_manage?: boolean;
    is_guest?: boolean;
    reply_count?: number;
}

export type GetCommentDetailResponse = ApiResponse<GetCommentDetailData[]>;

export interface SetCommentPayload {
    post_id: number;
    author: string;
    msg: string;
    request_id: string;
    password?: string;
    profile?: number;
    emoji_id?: string;
    parent_id?: number;
    reply_to_id?: number;
}

export interface UpdateCommentPayload {
    idx: number;
    msg: string;
    password?: string;
}

export interface DeleteCommentPayload {
    idx: number;
    password?: string;
}

export type SetCommentResponse = ApiResponse<null>;

export interface GetCommentLatestListItem {
    idx: number;
    author: string;
    msg: string;
    created_at: string;
}

export type GetCommentLatestListResponse = ApiResponse<GetCommentLatestListItem[]>;

export interface CommentManagerItem {
    idx: number;
    post_id: number;
    author: string;
    msg: string;
    is_admin: boolean;
    created_at: string;
    posts?: {
        title: string;
    };
}

export interface DeleteCommentManagerPayload {
    idx: number;
}

export type GetCommentManagerListResponse = ApiResponse<CommentManagerItem[]>;
export type DeleteCommentManagerResponse = ApiResponse<unknown>;
