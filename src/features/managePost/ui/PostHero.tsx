"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import UI from "@/shared/ui/common/UIComponent";
import TextShimmer from "@/shared/ui/common/TextShimmerComponent";
import PostHeroImageDropZone, { useHeroThumbnailFileHandler } from "@/features/managePost/ui/PostHeroImageDropZone";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";

import { util } from "@/shared/lib/util";
import { useGetCategoryListQuery } from "@/entities/category/api/category.query";
import PostThumbnailPlaceholder from "@/shared/ui/common/PostThumbnailPlaceholder";
import PostPublicationSettings from "./PostPublicationSettings";
import { POST_CONTENT_WIDTH_CLASS, POST_HERO_META_CLASS, POST_HERO_SUMMARY_CLASS, POST_HERO_TITLE_CLASS } from "@/shared/lib/richText/styles";

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
    const handleThumbnailFile = useHeroThumbnailFileHandler(props.mode === "edit" ? props.onThumbnailChange : () => {});

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
            className={`relative flex flex-col gap-[1.6rem] ${POST_CONTENT_WIDTH_CLASS}`}
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
            <p className={POST_HERO_META_CLASS}>
                {util.string.getCurrentTime(createDate, 4)} ・ {viewCount} view ・ {likeCount} Cheer Up
            </p>
            <p className={POST_HERO_TITLE_CLASS}>{title}</p>
            <PostHeroSummary>{summary}</PostHeroSummary>
        </section>

        <PostHeroAuthor />
    </>
);

const PostHeroSummary = ({ children }: { children: ReactNode }) => <h2 className={POST_HERO_SUMMARY_CLASS}>&quot;{children}&quot;</h2>;

const PostHeroAuthor = () => (
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
);

const PostHeroEditableField = ({
    value,
    placeholder,
    className,
    as: Tag = "p",
    onChange,
}: {
    value: string;
    placeholder: string;
    className: string;
    as?: "p" | "span";
    onChange: (value: string) => void;
}) => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        if (ref.current && document.activeElement !== ref.current && ref.current.textContent !== value) {
            ref.current.textContent = value;
        }
    }, [value]);

    return (
        <Tag
            ref={ref as never}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-label={placeholder}
            data-placeholder={placeholder}
            className={`${className} outline-none focus:ring-2 focus:ring-[var(--color-border-strong)] rounded-[0.8rem] empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--color-text-muted)] empty:before:pointer-events-none`}
            onInput={(e) => {
                const text = e.currentTarget.textContent ?? "";
                onChange(text);
            }}
        />
    );
};

const PostHeroEditContent = ({ title, summary, categoryIdx, onTitleChange, onSummaryChange, onCategoryChange }: PostHeroEditProps) => {
    const { data: getCategoryListData } = useGetCategoryListQuery();
    const enabledCategories = getCategoryListData?.result?.filter((e) => e.is_enabled) ?? [];
    const selectedCategory = enabledCategories.find((e) => e.idx === categoryIdx);

    return (
        <>
            <section className="flex flex-col items-start w-full pointer-events-auto">
                <PostPublicationSettings />
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
                        button: `${POST_HERO_META_CLASS} h-[1.5em] gap-[0.8rem]`,
                    }}
                />

                <PostHeroEditableField
                    value={title}
                    placeholder="제목을 입력해주세요"
                    className={POST_HERO_TITLE_CLASS}
                    onChange={onTitleChange}
                />

                <PostHeroSummary>
                    <PostHeroEditableField
                        as="span"
                        value={summary}
                        placeholder="요약을 입력해주세요"
                        className=""
                        onChange={onSummaryChange}
                    />
                </PostHeroSummary>
            </section>

            <PostHeroAuthor />
        </>
    );
};

export default PostHero;
