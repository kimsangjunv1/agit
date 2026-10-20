"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { PostLatestItem } from "@/entities/post/model/post.type";
import PostThumbnail from "@/shared/ui/common/PostThumbnail";
import Marquee from "@/shared/ui/layout/Marquee";
import { util } from "@/shared/lib/util";
import useNavigate from "@/shared/hooks/useNavigate";

const MotionLink = motion.create(Link);

type ArchiveSliderVerticalCardProps = {
    post: PostLatestItem;
};

const ArchiveSliderVerticalCard = ({ post }: ArchiveSliderVerticalCardProps) => {
    const cardRef = useRef<HTMLButtonElement | null>(null);
    const postHref = `/post/${post.idx}`;
    const { pushToUrl } = useNavigate();
    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ["start end", "center center", "end start"],
    });
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]);

    return (
        <motion.button
            ref={cardRef}
            data-idx={post.idx}
            aria-label={post.title}
            className="block h-[30svh] w-[80dvw] shrink-0 origin-center will-change-transform"
            style={{ scale }}
            onClick={(event) => {
                event.preventDefault();

                pushToUrl(postHref);
            }}
        >
            <PostThumbnail
                readinessKey={`archive-slider-thumbnail-${post.idx}`}
                seed={post.idx}
                src={post.thumbnail}
                alt={post.title}
                className="object-cover h-full w-full pointer-events-none"
            />

            <div className="absolute top-0 left-0 w-full flex flex-col justify-start items-start">
                <p className="bg-[var(--color-background-light)] p-[0.4rem] text-black font-mono">{util.string.getCurrentFullTime(post.created_at)}</p>

                <Marquee
                    content="NEW"
                    className={{
                        container: "bg-[var(--color-background-light)] gap-[1.2rem] p-[0.4rem]",
                        marquee: "text-[#ff4321] gap-[1.2rem] font-mono",
                    }}
                />
            </div>

            <div className="absolute bottom-[1.6rem] left-[1.6rem] w-full flex flex-col justify-start items-start">
                <h5 className="bg-[#000000] text-[#ff4321] text-left mobile:text-[1.6rem] pc:text-[2rem] font-semibold p-[0.4rem_0.4rem_0_0.4rem] leading-[1.5]">{post.title}</h5>
                <p className="bg-[#000000] text-[#ffffff] text-left font-bold leading-[1.5] line-clamp-2 mobile:text-[1.6rem] tablet:text-[2rem] p-[0.8rem_0.4rem_0.4rem_0.4rem]">
                    &quot;{post.summary}&quot;
                </p>
            </div>
        </motion.button>
    );
};

export default ArchiveSliderVerticalCard;
