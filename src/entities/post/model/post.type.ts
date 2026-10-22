import { ApiResponse } from "@/shared/model/common.type";
import type { PostType, PostTypeFilter, PostVisibility } from "./postSettings";

export interface TextStyle {
    lineHeight: number;
    fontSize: number;
    fontWeight: number;
    color: string;
    textAlign: string;
    backgroundColor: string;
}

export interface TextChild {
    value: string;
    style: TextStyle;
}

export interface Block {
    type: number;
    order: number;
    children: TextChild[];
    style: TextStyle;
}

export type BlockMode = "main" | "sub" | "code";

export interface NormalSectionContent {
    id: string;
    type: number;
    title: string;
    summary: string;
    subtitle: string;
    content: string | Block[];
    imageUrl: string;
    blockMode?: BlockMode;
}

export interface CodeSectionContent {
    id: string;
    type: number;
    title: string;
    summary: string;
    subtitle: string;
    content: string | Block[];
    imageUrl: string;
    blockMode?: BlockMode;
}

export type SectionContent = NormalSectionContent | CodeSectionContent;

export interface PostResponse {
    title: string;
    thumbnail: string;
    summary: string;
    contents: SectionContent[][];
    create_at: string;
}

export interface PostPrevNextInfo {
    idx: number;
    title: string;
    summary: string;
    thumbnail: string;
}

export interface PostItem {
    post_type: PostType;
    visibility: PostVisibility;
    id: string;
    idx: number;
    user_id: string | null;
    title: string;
    thumbnail: string;
    contents: SectionContent[][];
    category_idx: number | null;
    created_at: string;
    summary: string;
    views: number;
    likes: number;
    category?: {
        title: string;
        description: string;
        is_enabled: boolean;
    };
    prev?: PostPrevNextInfo;
    next?: PostPrevNextInfo;
    alreadyLiked?: boolean;
}

export interface PostLatestItem {
    post_type: PostType;
    visibility: PostVisibility;
    idx: number;
    title: string;
    thumbnail: string;
    summary: string;
    created_at: string;
    views: number;
    likes: number;
    category: {
        title: string;
    };
}

export interface PostViewItem {
    success: boolean;
    viewsIncremented: boolean;
    alreadyViewed: boolean;
}

export type SetIncrementPostViewResponse = ApiResponse<PostViewItem>;
export type GetPostLatestListResponse = ApiResponse<PostLatestItem[]> & { postTypeFilter?: PostTypeFilter; viewerId?: string | null };
export type GetPostListResponse = ApiResponse<PostItem[]>;
export type GetPostDetailResponse = ApiResponse<PostItem> & { viewerId?: string | null };

export type PatchPostResponse = ApiResponse<{
    statusCode: number;
    postIdx: number;
}>;

export type SetPostResponse = ApiResponse<{
    statusCode: number;
    postIdx?: number;
}>;

export interface PostDraftPayload {
    post_type: PostType;
    visibility: PostVisibility;
    title: string;
    summary: string;
    thumbnail: string;
    category_idx: number | null;
    contents: SectionContent[][];
}

export interface PostDraftListItem {
    id: string;
    title: string;
    updated_at: string;
}

export interface PostDraftDetail extends PostDraftListItem {
    payload: PostDraftPayload;
}

export interface PostManagerItem {
    post_type: PostType;
    visibility: PostVisibility;
    idx: number;
    title: string;
    thumbnail: string;
    summary: string;
    created_at: string;
    category_idx: number | null;
    views: number;
    category?: {
        title: string;
    };
}

export interface DeletePostManagerPayload {
    idx: number;
}

export type GetPostManagerListResponse = ApiResponse<PostManagerItem[]>;
export type DeletePostManagerResponse = ApiResponse<unknown>;
