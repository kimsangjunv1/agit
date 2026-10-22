"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type RefObject } from "react";

import { useGetPostLatestListQuery } from "@/entities/post/api/post.query";
import { GetPostLatestListResponse, PostLatestItem } from "@/entities/post/model/post.type";
import usePageTransitionReady from "@/shared/hooks/usePageTransitionReady";

import { FeedEmpty, FeedError, FeedLoading } from "./FeedStatus";
import useNavigate from "@/shared/hooks/useNavigate";
import Marquee from "@/shared/ui/layout/Marquee";
import PostThumbnail from "@/shared/ui/common/PostThumbnail";
import { util } from "@/shared/lib/util";
import Scrollbar from "@/shared/ui/common/Scrollbar";

const MotionLink = motion.create(Link);

type ArchiveSliderHorizontalProps = {
    initialData: GetPostLatestListResponse;
};

type ArchiveSliderHorizontalContentProps = {
    posts: PostLatestItem[];
};

type ArchiveSliderHorizontalCardProps = {
    post: PostLatestItem;
    index: number;
    containerRef: RefObject<HTMLDivElement | null>;
    shouldBlockClickRef: RefObject<boolean>;
};

const ArchiveSliderHorizontalCard = ({ post, index, containerRef, shouldBlockClickRef }: ArchiveSliderHorizontalCardProps) => {
    const { pushToUrl } = useNavigate();
    const cardRef = useRef<HTMLButtonElement | null>(null);
    const postHref = `/post/${post.idx}`;
    const { scrollXProgress } = useScroll({
        container: containerRef,
        target: cardRef,
        axis: "x",
        offset: ["start end", "center center", "end start"],
    });
    const height = useTransform(scrollXProgress, [0, 0.5, 1], ["30svh", "50svh", "30svh"]);

    return (
        <motion.button
            ref={cardRef}
            data-idx={post.idx}
            aria-label={post.title}
            draggable={false}
            className="block w-[36rem] shrink-0 will-change-[height,transform]"
            initial={{
                opacity: 0,
                y: "100svh",
            }}
            animate={{
                opacity: 1,
                y: Math.sin(index * 0.8 + 6 * 0.5) * 90,
            }}
            transition={{
                delay: 0.1 * (index + 1),
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1], // cubic bezier
            }}
            onClick={(event) => {
                if (shouldBlockClickRef.current) return;

                event.preventDefault();

                pushToUrl(postHref);
            }}
            style={{ height }}
        >
            <PostThumbnail
                readinessKey={`archive-slider-thumbnail-${post.idx}`}
                seed={post.idx}
                src={post.thumbnail}
                alt={post.title}
                className="object-cover h-full w-full pointer-events-none"
            />

            <div className="absolute top-0 left-0 w-full flex flex-col justify-start items-start">
                <p className="bg-[var(--color-background-light)] p-[0.4rem] text-[var(--color-text-primary)]">{util.string.getCurrentFullTime(post.created_at)}</p>

                <Marquee
                    content="NEW"
                    className={{
                        container: "bg-[var(--color-background-light)] gap-[1.2rem] p-[0.4rem]",
                        marquee: "text-[#ff4321] gap-[1.2rem] font-mono",
                    }}
                />
            </div>

            <div className="absolute bottom-0 left-0 bg-[#252525] w-auto max-w-[calc(100%-3.2rem)] flex flex-col justify-start items-start">
                <h5 className="text-left w-auto mobile:text-[1.6rem] pc:text-[2rem] p-[0.4rem_0.4rem_0_0.4rem] leading-[1.5] line-clamp-2 overflow-hidden break-words">{post.title}</h5>

                {/* <p className="text-left leading-[1.5] line-clamp-2 mobile:text-[1.6rem] tablet:text-[2rem] p-[0.8rem_0.4rem_0.4rem_0.4rem]">&quot;{post.summary}&quot;</p> */}
            </div>
        </motion.button>
    );
};

const ArchiveSliderHorizontalContent = ({ posts }: ArchiveSliderHorizontalContentProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dragStateRef = useRef({
        pointerId: -1,
        startX: 0,
        scrollLeft: 0,
        hasMoved: false,
    });
    const shouldBlockClickRef = useRef(false);

    const handlePointerUp = () => {
        const container = containerRef.current;

        if (container?.hasPointerCapture(dragStateRef.current.pointerId)) {
            container.releasePointerCapture(dragStateRef.current.pointerId);
        }

        window.setTimeout(() => {
            shouldBlockClickRef.current = false;
        }, 0);
        dragStateRef.current.pointerId = -1;
    };

    return (
        <section className="flex h-[calc(100svh)] w-full items-center overflow-hidden">
            {/* <section className="flex h-[100svh] w-full items-center overflow-hidden"> */}
            <Scrollbar
                direction="horizontal"
                aria-label="최신 글 가로 스크롤"
                viewportRef={containerRef}
                className="h-full w-full"
                viewportClassName="cursor-grab touch-pan-x select-none active:cursor-grabbing"
                contentClassName="flex h-full items-center gap-[0.8rem] px-[calc(50dvw-(36rem/2))]"
                viewportProps={{
                    onPointerDown: (event) => {
                        if (event.button !== 0) return;

                        const container = containerRef.current;

                        if (!container) return;

                        shouldBlockClickRef.current = false;
                        dragStateRef.current = {
                            pointerId: event.pointerId,
                            startX: event.clientX,
                            scrollLeft: container.scrollLeft,
                            hasMoved: false,
                        };
                    },
                    onPointerMove: (event) => {
                        const container = containerRef.current;
                        const dragState = dragStateRef.current;

                        if (!container || dragState.pointerId !== event.pointerId) return;

                        const moveX = event.clientX - dragState.startX;

                        if (Math.abs(moveX) > 4) {
                            if (!dragState.hasMoved) {
                                container.setPointerCapture(event.pointerId);
                            }

                            dragState.hasMoved = true;
                            shouldBlockClickRef.current = true;
                        }

                        if (dragState.hasMoved) {
                            container.scrollLeft = dragState.scrollLeft - moveX;
                        }
                    },
                    onPointerUp: handlePointerUp,
                    onPointerCancel: handlePointerUp,
                }}
            >
                {posts.map((post, index) => (
                    <ArchiveSliderHorizontalCard
                        key={post.idx}
                        post={post}
                        index={index}
                        containerRef={containerRef}
                        shouldBlockClickRef={shouldBlockClickRef}
                    />
                ))}
            </Scrollbar>
        </section>
    );
};

const ArchiveSliderHorizontalStatic = ({ initialData }: ArchiveSliderHorizontalProps) => {
    const posts = initialData.result ?? [];

    if (initialData.resultCode === "ERROR" && posts.length === 0) {
        return (
            <FeedError
                message={initialData.resultMessage}
                onRetry={() => undefined}
            />
        );
    }

    if (posts.length === 0) {
        return <FeedEmpty />;
    }

    return <ArchiveSliderHorizontalContent posts={posts} />;
};

const ArchiveSliderHorizontalWithQuery = ({ initialData }: ArchiveSliderHorizontalProps) => {
    const { data, isLoading, isError, error, refetch } = useGetPostLatestListQuery(initialData);
    const posts = data?.result ?? [];
    const isDataReady = !isLoading || posts.length > 0 || isError || data?.resultCode === "ERROR";

    usePageTransitionReady("archive-slider-horizontal-data", isDataReady);

    if (isLoading && posts.length === 0) {
        return <FeedLoading className="h-screen" />;
    }

    if (isError) {
        return (
            <FeedError
                message={error?.message}
                onRetry={() => refetch()}
            />
        );
    }

    if (data?.resultCode === "ERROR") {
        return (
            <FeedError
                message={data.resultMessage}
                onRetry={() => refetch()}
            />
        );
    }

    if (posts.length === 0) {
        return <FeedEmpty />;
    }

    return <ArchiveSliderHorizontalContent posts={posts} />;
};

const ArchiveSliderHorizontal = ({ initialData }: ArchiveSliderHorizontalProps) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <ArchiveSliderHorizontalStatic initialData={initialData} />;
    }

    return <ArchiveSliderHorizontalWithQuery initialData={initialData} />;
};

export default ArchiveSliderHorizontal;
