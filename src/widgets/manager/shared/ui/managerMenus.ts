export type ManagerMenuItem = {
    title: string;
    description: string;
    url: string;
};

export const MANAGER_MENUS: ManagerMenuItem[] = [
    {
        title: "카테고리",
        description: "게시판 카테고리 생성·수정·활성화",
        url: "/manager/category",
    },
    {
        title: "초대코드",
        description: "회원가입 초대코드 발급·만료 설정",
        url: "/manager/invitation",
    },
    {
        title: "게시물",
        description: "게시글 조회·수정·삭제",
        url: "/manager/post",
    },
    {
        title: "유저",
        description: "회원 목록 조회",
        url: "/manager/user",
    },
    {
        title: "댓글",
        description: "댓글 조회·삭제",
        url: "/manager/comment",
    },
    {
        title: "이미지",
        description: "업로드 이미지 사용 현황·용량·정리",
        url: "/manager/images",
    },
];
