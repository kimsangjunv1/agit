"use client";

import { useCreatePostStore } from "@/shared/stores/useCreatePostStore";
import { usePostDraftImageStore } from "@/shared/stores/usePostDraftImageStore";
import { setDraftImageDragData } from "@/shared/lib/richText/draftImageDrag";

const PostAttachedImageList = () => {
    const { images } = usePostDraftImageStore();
    const { thumbnail, setThumbnail } = useCreatePostStore();

    if (images.length === 0) return null;

    return (
        <section className="flex flex-col gap-[1.2rem] w-full pt-[2.4rem] border-t border-[var(--color-gray-200)]">
            <div className="flex items-center justify-between gap-[1.2rem]">
                <p className="text-[1.6rem] font-semibold text-[var(--color-gray-1000)]">첨부 이미지</p>
                <p className="text-[1.2rem] text-[var(--color-gray-500)]">클릭: 썸네일 · 드래그: 본문 삽입 · 저장 시 업로드</p>
            </div>

            <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <section className="flex flex-nowrap items-center gap-[1.2rem] pb-[0.4rem]">
                    {images.map((image) => {
                        const isThumbnail = thumbnail === image.previewUrl;

                        return (
                            <div
                                key={image.id}
                                role="button"
                                tabIndex={0}
                                title={isThumbnail ? "현재 썸네일 · 드래그하여 본문에 삽입" : "썸네일로 지정 · 드래그하여 본문에 삽입"}
                                draggable
                                onClick={() => setThumbnail(image.previewUrl)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        setThumbnail(image.previewUrl);
                                    }
                                }}
                                onDragStart={(event) => {
                                    event.stopPropagation();
                                    setDraftImageDragData(event.dataTransfer, image.previewUrl);
                                }}
                                className={`relative shrink-0 w-[10rem] h-[10rem] rounded-[1.6rem] overflow-hidden border-2 transition-colors cursor-grab active:cursor-grabbing ${
                                    isThumbnail ? "border-[var(--color-blue-500)] shadow-[var(--shadow-normal)]" : "border-[var(--color-gray-200)] hover:border-[var(--color-brand-500)]"
                                }`}
                            >
                                <img
                                    src={image.previewUrl}
                                    alt={image.name}
                                    draggable={false}
                                    className="object-cover w-full h-full pointer-events-none"
                                />
                                {isThumbnail ? (
                                    <span className="absolute bottom-[0.8rem] left-[0.8rem] px-[0.8rem] py-[0.4rem] rounded-full bg-[var(--color-blue-500)] text-white text-[1.2rem] font-semibold">
                                        썸네일
                                    </span>
                                ) : null}
                            </div>
                        );
                    })}
                </section>
            </div>
        </section>
    );
};

export default PostAttachedImageList;
