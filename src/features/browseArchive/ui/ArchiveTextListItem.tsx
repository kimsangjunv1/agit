"use client";

import { forwardRef } from "react";
import { motion } from "motion/react";

import type { PostItem } from "@/entities/post/model/post.type";
import { util } from "@/shared/lib/util";
import TransitionLink from "@/shared/ui/common/TransitionLink";

type Props = {
    post: PostItem;
    typeTitle: string;
    reducedMotion: boolean;
};

const ArchiveTextListItem = forwardRef<HTMLLIElement, Props>(function ArchiveTextListItem({ post, typeTitle, reducedMotion }, ref) {
    return (
        <motion.li
            ref={ref}
            layout="position"
            variants={{
                hidden: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 24 },
                visible: { opacity: 1, y: 0 },
            }}
            exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.15 } }}
            transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="border-b border-[var(--color-border)]"
        >
            <TransitionLink
                href={`/post/${post.idx}`}
                className="group block py-[2.8rem] focus-visible:rounded-[0.4rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-interaction-hover)]"
            >
                <div className="flex flex-wrap items-baseline justify-between gap-x-[2.4rem] gap-y-[0.8rem] text-[1.4rem] leading-[1.5] text-[var(--color-text-muted)] tablet:text-[1.6rem]">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-[0.8rem]">
                        <h2 className="min-w-0 font-semibold [overflow-wrap:anywhere]">{post.title}</h2>
                        <span className="shrink-0 rounded-[0.4rem] bg-[var(--color-surface-hover)] px-[0.6rem] py-[0.2rem] text-[1.2rem]">{typeTitle}</span>
                    </div>
                    <time
                        dateTime={post.created_at}
                        className="shrink-0 whitespace-nowrap tabular-nums"
                    >
                        {util.string.getCurrentDate(post.created_at, 4)}
                    </time>
                </div>
                <p className="mt-[1.2rem] text-[1.8rem] leading-[1.8] text-[var(--color-text-primary)] [overflow-wrap:anywhere] tablet:text-[2rem]">
                    {post.summary} <span className="whitespace-nowrap text-[var(--color-interaction-hover)] group-hover:underline group-focus-visible:underline">더보기</span>
                </p>
            </TransitionLink>
        </motion.li>
    );
});

export default ArchiveTextListItem;
