"use client";

import { useEffect, useRef, type RefObject } from "react";

type Props = {
    root?: RefObject<Element | null>;
    isFetching: boolean;
    isError: boolean;
    onLoadMore: () => void;
};

const InfiniteScrollTrigger = ({ root, isFetching, isError, onLoadMore }: Props) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const target = ref.current;
        if (!target || isFetching || isError || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) onLoadMore();
            },
            { root: root?.current ?? null },
        );
        observer.observe(target);

        return () => observer.disconnect();
    }, [root, isFetching, isError, onLoadMore]);

    return (
        <div
            ref={ref}
            className="py-[2.4rem] text-center text-[1.4rem] text-[var(--color-text-muted)]"
            aria-busy={isFetching}
        >
            {isFetching ? (
                <p role="status">목록을 불러오고 있어요.</p>
            ) : (
                <>
                    {isError ? <p role="alert">목록을 불러오지 못했어요.</p> : null}
                    <button
                        type="button"
                        onClick={onLoadMore}
                        className={`${isError ? "" : "sr-only focus:not-sr-only"} underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4`}
                    >
                        {isError ? "다시 불러오기" : "더 불러오기"}
                    </button>
                </>
            )}
        </div>
    );
};

export default InfiniteScrollTrigger;
