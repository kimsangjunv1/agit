import { create } from "zustand";
import type { PostType, PostVisibility } from "@/shared/model/post.type";

// ✅ 1️⃣ 타입 정의
interface CreatePostState {
    post_type: PostType;
    visibility: PostVisibility;
    title: string;
    thumbnail: string;
    summary: string;
    category_idx: number;
    post_idx: number;
    draft_id: string | null;
    contents: any[]; // 필요하면 구체적인 타입으로 변경
}

interface CreatePostActions {
    setPostType: (post_type: PostType) => void;
    setVisibility: (visibility: PostVisibility) => void;
    setTitle: (title: string) => void;
    setThumbnail: (thumbnail: string) => void;
    setSummary: (summary: string) => void;
    setCategoryIdx: (idx: number) => void;
    setPostIdx: (post_idx: number) => void;
    setDraftId: (draft_id: string | null) => void;
    setContents: (contents: any[]) => void;
    setPost: (post: Partial<CreatePostState>) => void; // 한꺼번에 업데이트
    reset: () => void;
}

// ✅ 2️⃣ Zustand store 생성
export const useCreatePostStore = create<CreatePostState & CreatePostActions>((set) => ({
    post_type: "article",
    visibility: "public",
    title: "",
    thumbnail: "",
    summary: "",
    category_idx: 0,
    post_idx: 0,
    draft_id: null,
    contents: [],

    setPostType: (post_type) => set({ post_type }),
    setVisibility: (visibility) => set({ visibility }),
    setTitle: (title) => set({ title }),
    setThumbnail: (thumbnail) => set({ thumbnail }),
    setSummary: (summary) => set({ summary }),
    setCategoryIdx: (category_idx) => set({ category_idx }),
    setPostIdx: (post_idx) => set({ post_idx }),
    setDraftId: (draft_id) => set({ draft_id }),
    setContents: (contents) => set({ contents }),

    // ✅ 전체 업데이트
    setPost: (post) => set((state) => ({ ...state, ...post })),

    reset: () =>
        set({
            post_type: "article",
            visibility: "public",
            title: "",
            thumbnail: "",
            summary: "",
            category_idx: 0,
            post_idx: 0,
            draft_id: null,
            contents: [],
        }),
}));
