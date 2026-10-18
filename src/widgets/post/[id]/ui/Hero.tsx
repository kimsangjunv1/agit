"use client";
import { usePostDetailProvider } from "../model/PostDetailContext";
import PostHero from "@/features/managePost/ui/PostHero";

const Hero = () => {
    const { contents, prev, next, postId, imageUrl, title, summary, createDate, viewCount, likeCount, thumbnailAlt, pushToUrl, setToast, handleCopySentence } = usePostDetailProvider();
    return (
        <section className="flex flex-col justify-center items-center gap-[3.2rem] h-[100svh] w-full fixed top-0 left-0">
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
