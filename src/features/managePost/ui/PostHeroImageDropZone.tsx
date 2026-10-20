"use client";

import { useId, useRef } from "react";

import { usePostDraftImageStore } from "@/shared/stores/usePostDraftImageStore";
import { useToastStore } from "@/shared/stores/useToastStore";

type PostHeroImageDropZoneProps = {
    onImageSelected: (previewUrl: string) => void;
    isDragging?: boolean;
};

export const useHeroThumbnailFileHandler = (onImageSelected: (previewUrl: string) => void) => {
    const { setToast } = useToastStore();
    const addFromFile = usePostDraftImageStore((state) => state.addFromFile);

    return (file: File) => {
        if (!file.type.startsWith("image/")) {
            setToast({ msg: "이미지 파일만 추가할 수 있어요", time: 2 });
            return;
        }

        const id = addFromFile(file);
        if (!id) return;

        const previewUrl = usePostDraftImageStore.getState().images.find((image) => image.id === id)?.previewUrl;

        if (previewUrl) {
            onImageSelected(previewUrl);
            setToast({ msg: "썸네일 이미지를 추가했어요", time: 2 });
        }
    };
};

const PostHeroImageDropZone = ({ onImageSelected, isDragging = false }: PostHeroImageDropZoneProps) => {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const handleFile = useHeroThumbnailFileHandler(onImageSelected);

    return (
        <>
            {isDragging ? (
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[5] rounded-[2.4rem] bg-[#00000040] ring-2 ring-white/60"
                />
            ) : null}

            <label
                htmlFor={inputId}
                className="absolute top-[2.4rem] right-[2.4rem] z-[6] cursor-pointer px-[1.2rem] py-[0.8rem] bg-[#00000060] hover:bg-[var(--color-brand-500)] backdrop-blur-sm rounded-[1.6rem] text-[var(--color-text-primary)] text-[1.2rem] font-semibold transition-colors"
            >
                클릭 또는 드래그로 썸네일 추가
            </label>

            <input
                id={inputId}
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = "";
                }}
            />
        </>
    );
};

export default PostHeroImageDropZone;
