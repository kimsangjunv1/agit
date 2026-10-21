"use client";

import { forwardRef } from "react";

import TransitionLink from "@/shared/ui/common/TransitionLink";
import PostThumbnail from "@/shared/ui/common/PostThumbnail";
import { PostItem } from "@/entities/post/model/post.type";
import { util } from "@/shared/lib/util";
import { motion } from "motion/react";

const getCategoryClassName = (categoryIdx: number) => {
    if (categoryIdx === 1) return "text-[var(--color-brand-500)]";
    if (categoryIdx === 2) return "text-[var(--color-blue-500)]";
    return "text-[var(--color-pink-500)]";
};

const archiveListItemTransition = {
    layout: { type: "spring" as const, stiffness: 500, damping: 40 },
    opacity: { duration: 0.2 },
    scale: { type: "spring" as const, mass: 0.1, stiffness: 100, damping: 10 },
};

type ArchiveListDefaultItemProps = {
    post: PostItem;
};

const ArchiveListDefaultItem = forwardRef<HTMLElement, ArchiveListDefaultItemProps>(function ArchiveListDefaultItem({ post }, ref) {
    return (
        <motion.section
            ref={ref}
            layout="position"
            // className="max-w-[calc(1.6rem*16)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={archiveListItemTransition}
        >
            <TransitionLink
                href={`/post/${post.idx}`}
                className="relative flex flex-col justify-start items-center overflow-hidden"
            >
                <PostThumbnail
                    readinessKey={`archive-list-thumbnail-${post.idx}`}
                    seed={post.idx}
                    src={post.thumbnail}
                    alt={post.title}
                    // className={`${post.idx % 3 === 0 ? "mobile:w-[calc(1.6rem*(12*1))] pc:w-[calc(1.6rem*(12*2))]" : "mobile:w-[calc(1.6rem*(12*1))] pc:w-[calc(1.6rem*(12*3))]"} h-[calc(1.6rem*20)] object-cover`}
                    // className="h-[calc(1.6rem*20)] object-cover"
                    className="w-full h-[calc(1.6rem*24)] object-cover hover:scale-[1.2] transition-transform"
                    // className="w-[calc(1.6rem*(17))] h-[calc(1.6rem*20)] object-cover"
                    // className="w-[calc(1.6rem*6)] h-[calc(1.6rem*9)] object-cover rounded-[1.6rem] shadow-[var(--shadow-normal)]"
                />
                {/* <div className="pointer-events-none absolute h-[50%] mask-[linear-gradient(0deg,_#000,_#000_2.5%,_#000_50%,_#0000)] bottom-0 left-0 w-full bg-[#00000000] backdrop-blur-[30px]" /> */}
                <div className="pointer-events-none flex flex-col items-start flex-1 w-full absolute top-0">
                    <h5 className="bg-[#252525] max-w-[calc(100%-3.2rem)] text-inherit text-left leading-[1.5] text-[1.8rem] font-bold p-[0.4rem_0.4rem_0_0.4rem] line-clamp-2 overflow-hidden break-words">
                        {post.title}
                    </h5>

                    <p className="bg-[#252525] text-left font-semibold flex items-center justify-center text-[var(--color-text-muted)] mobile:text-[1.6rem] tablet:text-[1.6rem] p-[0.8rem_0.4rem_0.4rem_0.4rem]">
                        {util.string.getCurrentDate(post.created_at)}
                    </p>
                    {/* <p className="bg-[#252525] text-left font-semibold leading-[1.5] text-[var(--color-text-muted)] line-clamp-2 mobile:text-[1.6rem] tablet:text-[1.6rem] p-[0.8rem_0.4rem_0.4rem_0.4rem]">
                        &quot;{post.summary}&quot;
                    </p> */}
                </div>
                <div className="pointer-events-none flex flex-col items-start flex-1 w-full absolute bottom-0 right-0 p-[0.8rem]">
                    {/* <h5 className="bg-[#252525] text-inherit text-left text-[2rem] font-bold p-[0.4rem_0.4rem_0_0.4rem]">{post.title}</h5> */}
                    <p className="bg-[#252525] text-left font-semibold flex items-center justify-center text-[var(--color-text-muted)] mobile:text-[1.6rem] tablet:text-[1.6rem] p-[0.8rem_0.4rem_0.4rem_0.4rem]">
                        {post.category?.title}
                    </p>
                    <p>{post.likes ?? 0}</p>
                </div>
                {/* <p className="[text-align-last:justify] bg-[var(--color-surface-floating)] font-bold p-[0.8rem] text-[var(--color-text-primary)]">
                    {post.category?.title} ・ {util.string.getCurrentDate(post.created_at)} ・ {post.likes ?? 0} likes
                </p> */}
            </TransitionLink>
        </motion.section>
    );
});

export default ArchiveListDefaultItem;
