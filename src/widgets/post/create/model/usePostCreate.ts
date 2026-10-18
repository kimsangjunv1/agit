"use client";
import { useEffect } from "react";
import { useGetCategoryListQuery } from "@/entities/category/api/category.query";
import { useBlockStore } from "@/features/managePost/model/useEditorBlockStore";
import { useCreatePostStore } from "@/shared/stores/useCreatePostStore";
import { usePostDraftImageStore } from "@/shared/stores/usePostDraftImageStore";

const usePostCreate = () => {
    const { reset: resetBlocks } = useBlockStore();
    const { reset: resetPost, setTitle, setSummary, setThumbnail, setCategoryIdx, category_idx, title, summary, thumbnail } = useCreatePostStore();
    const { reset: resetDraftImages } = usePostDraftImageStore();
    const { data: getCategoryListData } = useGetCategoryListQuery();
    useEffect(() => {
        resetBlocks();
        resetPost();
        resetDraftImages();
    }, [resetBlocks, resetPost, resetDraftImages]);
    useEffect(() => {
        const firstCategory = getCategoryListData?.result?.find((e) => e.is_enabled);
        if (firstCategory && category_idx === 0) {
            setCategoryIdx(firstCategory.idx);
        }
    }, [getCategoryListData, category_idx, setCategoryIdx]);
    return {
        title,
        summary,
        thumbnail,
        category_idx,
        setTitle,
        setSummary,
        setThumbnail,
        setCategoryIdx,
    };
};
export default usePostCreate;
