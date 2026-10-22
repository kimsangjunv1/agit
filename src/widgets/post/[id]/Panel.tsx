"use client";
import { useState } from "react";
import type { GetPostDetailResponse } from "@/entities/post/model/post.type";
import { PostDetailPageProvider } from "./model/PostDetailContext";
import usePostDetail from "./model/usePostDetail";
import * as Layer from "@/widgets/post/[id]/ui";
import PostContentBody from "@/features/managePost/ui/PostContentBody";
import { canShowPostComments } from "@/features/managePost/lib/postPermissions";
import { POST_INNER_CLASS, POST_PAGE_CLASS } from "@/shared/lib/richText/styles";
import Scrollbar from "@/shared/ui/common/Scrollbar";
import WidthControl, { type PostContentWidth } from "./ui/WidthControl";
import CheerUpIsland from "./ui/CheerUpIsland";
export default function Panel({ id, initialData }: { id: string; initialData: GetPostDetailResponse }) {
    const page = usePostDetail(id, initialData);
    const [contentWidth, setContentWidth] = useState<PostContentWidth>("tablet");
    return (
        <PostDetailPageProvider value={page}>
            <Scrollbar
                direction="vertical"
                aria-label="글 보기 스크롤"
                viewportRef={page.scrollViewportRef}
                className="h-[100svh] w-full"
                viewportClassName="isolate"
            >
                <section className={`${POST_PAGE_CLASS} pb-[calc(8rem+env(safe-area-inset-bottom))]`}>
                    <section
                        className={POST_INNER_CLASS}
                        style={{ ["--post-content-max-width" as string]: `var(--size-${contentWidth})` }}
                    >
                        {page.isReady ? (
                            <>
                                <Layer.Hero />
                                <PostContentBody>
                                    <section className="flex flex-col flex-1 min-w-0">
                                        <Layer.Body />
                                        {canShowPostComments(page.data?.result?.post_type) ? <Layer.Comments /> : null}
                                        <Layer.RelatedPosts />
                                    </section>
                                </PostContentBody>
                            </>
                        ) : (
                            <Layer.Status />
                        )}
                    </section>
                </section>
            </Scrollbar>
            {page.isReady ? (
                <>
                    <Layer.Toc />
                    <Layer.DynamicPostController key={page.postId} />
                    <CheerUpIsland key={`cheer-${page.postId}`} />
                    <Layer.Actions />
                    <WidthControl value={contentWidth} onChange={setContentWidth} />
                </>
            ) : null}
        </PostDetailPageProvider>
    );
}
