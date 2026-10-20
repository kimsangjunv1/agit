"use client";
import { usePostDetailProvider } from "../model/PostDetailContext";
import GiscusComments from "@/shared/ui/common/GiscusComments";
import { POST_CONTENT_WIDTH_CLASS } from "@/shared/lib/richText/styles";

const Comments = () => {
    const { contents, prev, next, postId, imageUrl, title, summary, createDate, viewCount, likeCount, thumbnailAlt, pushToUrl, setToast, handleCopySentence } = usePostDetailProvider();
    return (
        <GiscusComments
            term={`post-${postId}`}
            className={`${POST_CONTENT_WIDTH_CLASS} my-[5.2rem]`}
        />
    );
};
export default Comments;
