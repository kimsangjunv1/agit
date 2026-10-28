export const POST_NAV_ACTIONS = [
    {
        title: "공유하기",
        icon: "outlined-copy",
        action: "share" as const,
    },
    {
        title: "게시물 삭제하기",
        icon: "outlined-cross",
        action: "delete" as const,
    },
    {
        title: "수정하기",
        icon: "outlined-edit",
        action: "edit" as const,
    },
    {
        title: "댓글",
        icon: "outlined-comment",
        action: "comments" as const,
    },
    {
        title: "목차",
        icon: "outlined-toc",
        action: "toc" as const,
    },
    {
        title: "읽기 설정",
        icon: "outlined-reading",
        action: "reading" as const,
    },
] as const;

export type PostNavAction = (typeof POST_NAV_ACTIONS)[number]["action"];
