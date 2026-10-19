"use client";
import { usePostDetailProvider } from "../model/PostDetailContext";
import PostHero from "@/features/managePost/ui/PostHero";

const Hero = () => {
    const { contents, prev, next, postId, imageUrl, title, summary, createDate, viewCount, likeCount, thumbnailAlt, pushToUrl, setToast, handleCopySentence } = usePostDetailProvider();
    return (
        <section className="flex flex-col justify-center items-center gap-[3.2rem] w-full mt-[calc(var(--header-height)+5.2rem)]">
            <PostHero
                mode="view"
                imageUrl={imageUrl}
                placeholderSeed={postId}
                title={title}
                summary={summary}
                createDate={createDate}
                viewCount={viewCount}
                likeCount={likeCount}
                thumbnailAlt={thumbnailAlt}
            />
        </section>
    );
};
export default Hero;
