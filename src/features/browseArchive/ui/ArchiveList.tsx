"use client";

import { useLayoutEffect, useRef } from "react";

import { useGetPostListQuery } from "@/entities/post/api/post.query";
import { usePostTypeFilter } from "@/entities/post/model/usePostTypeFilter";
import usePageTransitionReady from "@/shared/hooks/usePageTransitionReady";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import { clampPageScroll } from "@/features/browseArchive/lib/clampPageScroll";

import ArchiveListDefaultItem from "./ArchiveListDefaultItem";
import { FeedEmpty, FeedError, FeedLoading } from "./FeedStatus";
import { AnimatePresence } from "motion/react";

const ArchiveList = () => {
    const { data, isLoading, isError, error, refetch } = useGetPostListQuery();
    const listViewMode = useLayoutStore((state) => state.listViewMode);
    const { categoryFilter } = usePostTypeFilter();
    const listRef = useRef<HTMLElement | null>(null);

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
    }, [categoryFilter, filtered.length, listViewMode]);

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
        </article>
    );
};

export default ArchiveList;
