"use client";
import { usePostDetailProvider } from "../model/PostDetailContext";
import PostHero from "@/features/managePost/ui/PostHero";
import { POST_HERO_SECTION_CLASS } from "@/shared/lib/richText/styles";

const Hero = () => {
    const { contents, prev, next, postId, imageUrl, title, summary, createDate, viewCount, likeCount, thumbnailAlt, pushToUrl, setToast, handleCopySentence } = usePostDetailProvider();
    return (
        <section className={POST_HERO_SECTION_CLASS}>
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
