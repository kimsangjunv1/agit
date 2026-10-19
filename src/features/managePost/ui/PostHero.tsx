"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import UI from "@/shared/ui/common/UIComponent";
import TextShimmer from "@/shared/ui/common/TextShimmerComponent";
import PostHeroImageDropZone, { useHeroThumbnailFileHandler } from "@/features/managePost/ui/PostHeroImageDropZone";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";

import { util } from "@/shared/lib/util";
import { useGetCategoryListQuery } from "@/entities/category/api/category.query";
import usePageTransitionReady from "@/shared/hooks/usePageTransitionReady";
import PostThumbnailPlaceholder from "@/shared/ui/common/PostThumbnailPlaceholder";

type PostHeroSharedProps = {
    placeholderSeed?: string | number;
};

type PostHeroViewProps = PostHeroSharedProps & {
    mode: "view";
    imageUrl: string;
    title: string;
    summary: string;
    createDate: string;
    viewCount: number;
    likeCount: number;
    thumbnailAlt?: string;
};

type PostHeroEditProps = PostHeroSharedProps & {
    mode: "edit";
    imageUrl: string;
    title: string;
    summary: string;
    categoryIdx: number;
    editLabel?: string;
    onTitleChange: (value: string) => void;
    onSummaryChange: (value: string) => void;
    onThumbnailChange: (value: string) => void;
    onCategoryChange: (value: number) => void;
};

type PostHeroProps = PostHeroViewProps | PostHeroEditProps;

const isOptimizableImageSrc = (src: string) => src.startsWith("/") || src.startsWith("https://");

const PostHero = (props: PostHeroProps) => {
    const reducedMotion = useReducedMotion();
    const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
    const dragDepthRef = useRef(0);
    const heroImageSrc = props.imageUrl || undefined;
    const heroImageAlt = props.mode === "view" ? props.thumbnailAlt || props.title : "";
    const canOptimizeImage = heroImageSrc ? isOptimizableImageSrc(heroImageSrc) : false;
    const [isHeroImageReady, setIsHeroImageReady] = useState(!heroImageSrc);
    const handleThumbnailFile = useHeroThumbnailFileHandler(props.mode === "edit" ? props.onThumbnailChange : () => {});

    useEffect(() => {
        setIsHeroImageReady(!heroImageSrc);
    }, [heroImageSrc]);

    usePageTransitionReady("post-hero-image", isHeroImageReady);

    const handleThumbnailDragEnter = (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        dragDepthRef.current += 1;

        if (dragDepthRef.current === 1) {
            setIsDraggingThumbnail(true);
        }
    };

    const handleThumbnailDragLeave = () => {
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

        if (dragDepthRef.current === 0) {
            setIsDraggingThumbnail(false);
        }
    };

    const handleThumbnailDragOver = (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
    };

    const handleThumbnailDrop = (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        dragDepthRef.current = 0;
        setIsDraggingThumbnail(false);

        const file = event.dataTransfer.files?.[0];
        if (file) handleThumbnailFile(file);
    };

    return (
        <motion.article
            // className="relative flex flex-col items-end justify-end gap-[1.6rem] w-full h-full rounded-[calc(1.6rem*3)] overflow-hidden"
            className="relative flex flex-col gap-[1.6rem] max-w-[var(--size-tablet)] px-[2.0rem] w-full"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: reducedMotion ? 0 : 0.45,
                ease: [0.25, 0.8, 0.25, 1],
            }}
            onDragEnter={props.mode === "edit" ? handleThumbnailDragEnter : undefined}
            onDragLeave={props.mode === "edit" ? handleThumbnailDragLeave : undefined}
            onDragOver={props.mode === "edit" ? handleThumbnailDragOver : undefined}
            onDrop={props.mode === "edit" ? handleThumbnailDrop : undefined}
        >
            {/* <div className="z-0 relative w-[25.6rem] h-[25.6rem]">
                {heroImageSrc ? (
                    canOptimizeImage ? (
                        <Image
                            src={heroImageSrc}
                            alt={heroImageAlt}
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover object-center pointer-events-none"
                            onLoadingComplete={() => setIsHeroImageReady(true)}
                        />
                    ) : (
                        <img
                            src={heroImageSrc}
                            alt={heroImageAlt}
                            className="object-cover object-center w-full h-full aspect-auto pointer-events-none"
                            onLoad={() => setIsHeroImageReady(true)}
                            onError={() => setIsHeroImageReady(true)}
                        />
                    )
                ) : (
                    <PostThumbnailPlaceholder
                        seed={props.placeholderSeed ?? (props.title || "post-hero")}
                        className="pointer-events-none"
                        fill
                        readinessKey="post-hero-image"
                    />
                )}
            </div> */}

            <section className="flex flex-col items-start justify-center gap-[1.6rem]">{props.mode === "edit" ? <PostHeroEditContent {...props} /> : <PostHeroViewContent {...props} />}</section>

            {props.mode === "edit" ? (
                <PostHeroImageDropZone
                    onImageSelected={props.onThumbnailChange}
                    isDragging={isDraggingThumbnail}
                />
            ) : null}
        </motion.article>
    );
};

const PostHeroViewContent = ({ title, summary, createDate, viewCount, likeCount }: PostHeroViewProps) => (
    <>
        <section className="flex flex-col items-start pointer-events-none">
            <p className="mobile:text-[1.6rem] tablet:text-[1.4rem] text-[#00000090] leading-[1.5]">
                {util.string.getCurrentTime(createDate, 4)} ・ {viewCount} view ・ {likeCount} likes
            </p>
            <p className="mobile:text-[1.6rem] tablet:text-[2.0rem] text-[#000000] leading-[1.5]">{title}</p>
            <h2 className="font-semibold mobile:text-[1.8rem] tablet:text-[2.4rem] leading-[1.5] whitespace-break-spaces">&quot;{summary}&quot;</h2>
        </section>

        <section className="flex justify-start items-end gap-[1.6rem] pointer-events-none">
            <div className="relative">
                <img
                    src="/images/picture/post-profile.png"
                    alt="프로필"
                    className="object-cover w-[7.2rem] h-[9.2rem]"
                />
            </div>

            <section className="flex flex-col justify-center items-start gap-[0.4rem]">
                <p className="text-[1.8rem] font-semibold">김상준</p>
                <p className="text-[1.4rem]">FRONT END DEVELOPER</p>
            </section>
        </section>
    </>
);

const PostHeroEditableField = ({ value, placeholder, className, onChange }: { value: string; placeholder: string; className: string; onChange: (value: string) => void }) => {
    const ref = useRef<HTMLHeadingElement>(null);
    const lastExternalValue = useRef(value);

    useEffect(() => {
        if (value === lastExternalValue.current) return;

        lastExternalValue.current = value;

        if (ref.current && document.activeElement !== ref.current) {
            ref.current.textContent = value;
        }
    }, [value]);

    return (
        <h2
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            data-placeholder={placeholder}
            className={`${className} empty:before:content-[attr(data-placeholder)] empty:before:text-[#ffffff60] empty:before:pointer-events-none`}
            onInput={(e) => {
                const text = e.currentTarget.textContent ?? "";
                lastExternalValue.current = text;
                onChange(text);
            }}
        />
    );
};

const PostHeroEditContent = ({ title, summary, categoryIdx, editLabel = "작성 중", onTitleChange, onSummaryChange, onCategoryChange }: PostHeroEditProps) => {
    const { data: getCategoryListData } = useGetCategoryListQuery();
    const enabledCategories = getCategoryListData?.result?.filter((e) => e.is_enabled) ?? [];
    const selectedCategory = enabledCategories.find((e) => e.idx === categoryIdx);

    return (
        <>
            <section className="flex flex-col items-start gap-[1.2rem] w-full pointer-events-auto">
                <UI.Select
                    trackingData={selectedCategory?.title ?? ""}
                    defaultValue={selectedCategory?.idx}
                    list={enabledCategories.map((e) => ({
                        title: e.title,
                        value: e.idx,
                    }))}
                    onChange={onCategoryChange}
                    className={{
                        container: "px-0 w-fit",
                        button: "bg-[#ffffff20] backdrop-blur-sm px-[1.2rem] min-w-[5.2rem] text-white border border-[#ffffff30]",
                    }}
                />

                <PostHeroEditableField
                    value={title}
                    placeholder="제목을 입력해주세요"
                    className="h-auto p-0 font-bold tablet:text-[2rem] mobile:text-[1.6rem] text-white leading-[1.5] outline-none focus:ring-2 focus:ring-[#ffffff40] rounded-[0.8rem]"
                    onChange={onTitleChange}
                />

                <PostHeroEditableField
                    value={summary}
                    placeholder="요약을 입력해주세요"
                    className="h-auto p-0 font-extrabold text-left tablet:text-[3.2rem] mobile:text-[2rem] text-white leading-[1.5] whitespace-break-spaces outline-none focus:ring-2 focus:ring-[#ffffff40] rounded-[0.8rem]"
                    onChange={onSummaryChange}
                />
            </section>

            <section className="flex flex-col items-center flex-wrap gap-[1.6rem] pointer-events-none">
                <div className="relative rounded-[2.4rem] w-[9.2rem] h-[9.2rem] shadow-[var(--shadow-normal)]">
                    <img
                        src="/images/picture/profile.png"
                        alt="프로필"
                        className="object-cover rounded-[2.4rem] w-[9.2rem] h-[9.2rem] shadow-[var(--shadow-normal)]"
                    />
                </div>

                <section className="flex flex-col items-start gap-[1.2rem]">
                    <section className="flex flex-col items-center gap-[0.8rem] flex-wrap">
                        <p className="font-extrabold text-[2rem] text-white">김상준</p>
                        <p className="text-[2rem] font-semibold text-[#ffffff90]">FRONT END DEVELOPER</p>
                    </section>
                    {/* <p className="font-semibold text-[2.0rem] text-[#ffffff90]">{editLabel}</p> */}
                </section>
            </section>
        </>
    );
};

export default PostHero;
