import type { ApiResponse } from "@/shared/model/common.type";

export interface PostTypeItem {
    code: string;
    title: string;
    sort_no: number;
    created_at: string;
}

export type PostTypePayload = Pick<PostTypeItem, "code" | "title" | "sort_no">;
export type GetPostTypesResponse = ApiResponse<PostTypeItem[]>;
