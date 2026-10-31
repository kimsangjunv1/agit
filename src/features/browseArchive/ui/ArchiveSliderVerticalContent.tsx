"use client";

import { PostLatestItem } from "@/entities/post/model/post.type";
import { useRef } from "react";
import Scrollbar from "@/shared/ui/common/Scrollbar";

import ArchiveSliderVerticalCard from "./ArchiveSliderVerticalCard";

type ArchiveSliderVerticalContentProps = {
    posts: PostLatestItem[];
};

const ArchiveSliderVerticalContent = ({ posts }: ArchiveSliderVerticalContentProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    return (
        <Scrollbar
            direction="vertical"
            aria-label="최신 글 세로 스크롤"
            viewportRef={containerRef}
            className="h-[100svh] w-full"
            contentClassName="py-[calc(50svh-var(--header-height))]"
        >
            <div className="flex w-full flex-col items-center gap-[2.4rem]">
                {posts.map((post, index) => (
                    <ArchiveSliderVerticalCard
                        key={post.idx}
                        post={post}
                        index={index}
                        containerRef={containerRef}
                    />
                ))}
            </div>
        </Scrollbar>
    );
};

export default ArchiveSliderVerticalContent;
