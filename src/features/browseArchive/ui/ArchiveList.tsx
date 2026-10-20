"use client";

import { useLayoutEffect, useRef } from "react";

import { useGetPostListQuery } from "@/entities/post/api/post.query";
import { usePostTypeFilter } from "@/entities/post/model/usePostTypeFilter";
import { useGetPostTypesQuery } from "@/entities/postType/api/postType.query";
import usePageTransitionReady from "@/shared/hooks/usePageTransitionReady";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import { clampPageScroll } from "@/features/browseArchive/lib/clampPageScroll";

import ArchiveListDefaultItem from "./ArchiveListDefaultItem";
import ArchiveTextListItem from "./ArchiveTextListItem";
import { FeedEmpty, FeedError, FeedLoading } from "./FeedStatus";
import { AnimatePresence, motion } from "motion/react";

const ArchiveList = () => {
    const { data, isLoading, isError, error, refetch } = useGetPostListQuery();
    const listViewMode = useLayoutStore((state) => state.listViewMode);
    const isPageReady = useLayoutStore((state) => state.transitionPhase === "idle");
    const { postType, categoryFilter } = usePostTypeFilter();
    const { data: postTypes } = useGetPostTypesQuery();
    const reducedMotion = useReducedMotion();
    const listRef = useRef<HTMLElement | null>(null);
    const isTextList = postType === "til" || postType === "diary";
    const typeTitle = postTypes?.result.find((type) => type.code === postType)?.title ?? postType;

    const posts = data?.result ?? [];
    const filtered = categoryFilter !== null ? posts.filter((item) => item.category_idx === categoryFilter) : posts;
    const isDataReady = !isLoading || posts.length > 0 || isError || data?.resultCode === "ERROR";

    usePageTransitionReady("archive-list-data", isDataReady);

    useLayoutEffect(() => {
        clampPageScroll();

        const listEl = listRef.current;
        if (!listEl || typeof ResizeObserver === "undefined") return;

        const ro = new ResizeObserver(() => {
            requestAnimationFrame(clampPageScroll);
        });
        ro.observe(listEl);

        return () => ro.disconnect();
    }, [categoryFilter, filtered.length, listViewMode, postType]);

    if (isLoading && posts.length === 0) {
        return <FeedLoading />;
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

    if (filtered.length === 0) {
        return <FeedEmpty title="해당 카테고리에 게시물이 없습니다" />;
    }

    return (
        <article ref={listRef}>
            {isTextList ? (
                <motion.ul
                    key={postType}
                    aria-label={`${typeTitle} 글 목록`}
                    initial="hidden"
                    animate={reducedMotion || isPageReady ? "visible" : "hidden"}
                    variants={{ visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.1 } } }}
                    className="relative mx-auto w-full max-w-[96rem] pb-[4rem] pl-[2rem] pr-[5.6rem] pt-[20rem] tablet:pl-[3.2rem] pc:pr-[3.2rem]"
                >
                    <AnimatePresence mode="popLayout">
                        {filtered.map((post) => (
                            <ArchiveTextListItem
                                key={post.idx}
                                post={post}
                                typeTitle={typeTitle}
                                reducedMotion={reducedMotion}
                            />
                        ))}
                    </AnimatePresence>
                </motion.ul>
            ) : (
                <div className="relative w-full grid grid-cols-2 tablet:grid-cols-4 pc:grid-cols-7 gap-[2.4rem_0.4rem] mobile:px-[0.4rem] pc:px-[2rem]">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((post) => (
                            <ArchiveListDefaultItem
                                key={post.idx + post.title}
                                post={post}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </article>
    );
};

export default ArchiveList;
