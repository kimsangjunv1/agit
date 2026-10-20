"use client";
import { useEffect, useRef } from "react";
import { useGetPostDetailQuery } from "@/entities/post/api/post.query";
import { collectImagesFromPost } from "@/features/managePost/lib/preparePostSave";
import { useCreatePostStore } from "@/shared/stores/useCreatePostStore";
import { usePostDraftImageStore } from "@/shared/stores/usePostDraftImageStore";

const usePostModify = (id: string) => {
    const { setPostIdx } = useCreatePostStore();
    useEffect(() => {
        setPostIdx(parseInt(id));
    }, [id, setPostIdx]);
    const { data: getPostListData } = useGetPostDetailQuery(parseInt(id));
    const data = getPostListData?.result;
    const { title, summary, thumbnail, category_idx, setTitle, setSummary, setCategoryIdx, setThumbnail, setPostType, setVisibility } = useCreatePostStore();
    const { reset: resetDraftImages, addFromUrl } = usePostDraftImageStore();
    const initializedRef = useRef(false);
    useEffect(() => {
        initializedRef.current = false;
    }, [id]);
    useEffect(() => {
        if (data?.title && data?.summary) {
            setTitle(data.title);
            setSummary(data.summary);
            setCategoryIdx(data.category_idx);
            setThumbnail(data.thumbnail ?? "");
            setPostType(data.post_type ?? "article");
            setVisibility(data.visibility ?? "public");
        }
    }, [data, setTitle, setSummary, setCategoryIdx, setThumbnail, setPostType, setVisibility]);
    useEffect(() => {
        if (!data || initializedRef.current) return;

        initializedRef.current = true;
        resetDraftImages();
        collectImagesFromPost(data.thumbnail ?? "", data.contents ?? []).forEach((url) => addFromUrl(url));
    }, [data, resetDraftImages, addFromUrl]);
    return {
        title,
        summary,
        thumbnail,
        category_idx,
        setTitle,
        setSummary,
        setThumbnail,
        setCategoryIdx,
        id,
        contents: data?.contents ?? [],
    };
};
export default usePostModify;
