"use client";
import { usePostDetailProvider } from "../model/PostDetailContext";
import GiscusComments from "@/shared/ui/common/GiscusComments";

const Comments = () => {
    const { contents, prev, next, postId, imageUrl, title, summary, createDate, viewCount, likeCount, thumbnailAlt, pushToUrl, setToast, handleCopySentence } = usePostDetailProvider();
    return (
        <GiscusComments
            term={`post-${postId}`}
            className="max-w-[var(--size-tablet)] w-full mx-auto my-[5.2rem] px-[2rem]"
        />
    );
};
export default Comments;
