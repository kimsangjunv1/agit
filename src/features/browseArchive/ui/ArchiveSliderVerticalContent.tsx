"use client";

import { PostLatestItem } from "@/entities/post/model/post.type";

import ArchiveSliderVerticalCard from "./ArchiveSliderVerticalCard";

type ArchiveSliderVerticalContentProps = {
    posts: PostLatestItem[];
};

const ArchiveSliderVerticalContent = ({ posts }: ArchiveSliderVerticalContentProps) => {
    return (
        <section className="w-full py-[calc(50svh-var(--header-height))]">
            {/* <section className="w-full py-[25.6rem]"> */}
            <div className="flex w-full flex-col items-center gap-[2.4rem]">
                {posts.map((post) => (
                    <ArchiveSliderVerticalCard
                        key={post.idx}
                        post={post}
                    />
                ))}
            </div>
        </section>
    );
};

export default ArchiveSliderVerticalContent;
