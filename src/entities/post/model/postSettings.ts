import type { PostType, PostVisibility, PostTypeFilter } from "@/shared/model/post.type";
export type { PostType, PostVisibility, PostTypeFilter } from "@/shared/model/post.type";

export const POST_TYPE_OPTIONS = [
    { value: "article", title: "일반 글" },
    { value: "til", title: "TIL" },
    { value: "diary", title: "Diary" },
] as const;

export const POST_VISIBILITY_OPTIONS = [
    { value: "public", title: "전체공개" },
    { value: "private", title: "비공개" },
] as const;

export const isPostType = (value: unknown): value is PostType => POST_TYPE_OPTIONS.some((option) => option.value === value);
export const isPostVisibility = (value: unknown): value is PostVisibility => POST_VISIBILITY_OPTIONS.some((option) => option.value === value);
export const getPostTypeFilter = (value: unknown): PostTypeFilter => (isPostType(value) ? value : "all");

export const postVisibilityFilter = (userId: string | null) => (userId ? `visibility.eq.public,and(visibility.eq.private,user_id.eq.${userId})` : "visibility.eq.public");
