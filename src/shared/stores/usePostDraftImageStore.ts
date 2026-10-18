import { create } from "zustand";

import { useToastStore } from "@/shared/stores/useToastStore";

export type PostDraftImage = {
    id: string;
    previewUrl: string;
    name: string;
    file?: File;
};

type PostDraftImageStore = {
    images: PostDraftImage[];
    addFromFile: (file: File) => string | null;
    addFromUrl: (url: string, name?: string) => string | null;
    remove: (id: string) => void;
    reset: () => void;
};

const DUPLICATE_IMAGE_MESSAGE = "이미 등록된 이미지 입니다";

const createId = () => `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getFileFingerprint = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

const isDuplicateFile = (file: File, images: PostDraftImage[]) => images.some((image) => image.file && getFileFingerprint(image.file) === getFileFingerprint(file));

const revokeIfBlob = (url: string) => {
    if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
    }
};

export const usePostDraftImageStore = create<PostDraftImageStore>((set, get) => ({
    images: [],

    addFromFile: (file) => {
        if (isDuplicateFile(file, get().images)) {
            useToastStore.getState().setToast({ msg: DUPLICATE_IMAGE_MESSAGE, time: 2 });
            return null;
        }

        const id = createId();
        const previewUrl = URL.createObjectURL(file);

        set((state) => ({
            images: [
                ...state.images,
                {
                    id,
                    previewUrl,
                    name: file.name,
                    file,
                },
            ],
        }));

        return id;
    },

    addFromUrl: (url, name = "image") => {
        if (!url || url === "/") return null;

        const exists = get().images.some((image) => image.previewUrl === url);
        if (exists) return get().images.find((image) => image.previewUrl === url)?.id ?? null;

        const id = createId();

        set((state) => ({
            images: [
                ...state.images,
                {
                    id,
                    previewUrl: url,
                    name,
                },
            ],
        }));

        return id;
    },

    remove: (id) => {
        const target = get().images.find((image) => image.id === id);
        if (target) revokeIfBlob(target.previewUrl);

        set((state) => ({
            images: state.images.filter((image) => image.id !== id),
        }));
    },

    reset: () => {
        get().images.forEach((image) => revokeIfBlob(image.previewUrl));
        set({ images: [] });
    },
}));
