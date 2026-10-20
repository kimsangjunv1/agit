"use client";
import { useEffect, useCallback, useRef } from "react";
import type { GetPostDetailResponse } from "@/entities/post/model/post.type";
import { useGetPostDetailQuery, useIncrementPostViewOnVisit } from "@/entities/post/api/post.query";
import useNavigate from "@/shared/hooks/useNavigate";
import usePageTransitionReady from "@/shared/hooks/usePageTransitionReady";
import { useCreatePostStore } from "@/shared/stores/useCreatePostStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { util } from "@/shared/lib/util";
export default function usePostDetail(id: string, initialData: GetPostDetailResponse) {
    const scrollViewportRef = useRef<HTMLDivElement | null>(null);
    const postIdx = Number(id);
    const { setPostIdx } = useCreatePostStore();
    const { setToast } = useToastStore();
    const { pushToUrl } = useNavigate();
    useIncrementPostViewOnVisit(postIdx);
    useEffect(() => {
        setPostIdx(postIdx);
    }, [postIdx, setPostIdx]);
    const query = useGetPostDetailQuery(postIdx, initialData);
    const post = query.data?.result;
    const hasContent = Boolean(post?.title);
    const isReady = hasContent && !query.isError && query.data?.resultCode !== "ERROR";
    usePageTransitionReady("post-detail-data", hasContent || query.isError || query.data?.resultCode === "ERROR");
    const handleCopySentence = useCallback(
        (text: string) => {
            util.dom.setCopyOnClipboard(text);
            setToast({ msg: "선택하신 문장을 복사했어요", time: 2 });
        },
        [setToast],
    );
    return {
        ...query,
        scrollViewportRef,
        isReady,
        postIdx,
        postId: id,
        contents: post?.contents ?? [],
        prev: post?.prev,
        next: post?.next,
        imageUrl: post?.thumbnail ?? "",
        title: post?.title ?? "",
        summary: post?.summary ?? "",
        createDate: post?.created_at ?? "",
        viewCount: post?.views ?? 0,
        likeCount: post?.likes ?? 0,
        thumbnailAlt: post?.title ?? "",
        pushToUrl,
        setToast,
        handleCopySentence,
    };
}
