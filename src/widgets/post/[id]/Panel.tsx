"use client";
import type { GetPostDetailResponse } from "@/entities/post/model/post.type";
import { PostDetailPageProvider } from "./model/PostDetailContext";
import usePostDetail from "./model/usePostDetail";
import * as Layer from "@/widgets/post/[id]/ui";
import PostContentBody from "@/features/managePost/ui/PostContentBody";
import { POST_INNER_CLASS, POST_PAGE_CLASS } from "@/shared/lib/richText/styles";
import Scrollbar from "@/shared/ui/common/Scrollbar";
export default function Panel({ id, initialData }: { id: string; initialData: GetPostDetailResponse }) {
    const page = usePostDetail(id, initialData);
    return (
        <PostDetailPageProvider value={page}>
            <Scrollbar
                direction="vertical"
                aria-label="글 보기 스크롤"
                viewportRef={page.scrollViewportRef}
                className="h-[100svh] w-full"
                viewportClassName="isolate"
            >
                <section className={POST_PAGE_CLASS}>
                    <section className={POST_INNER_CLASS}>
                        {page.isReady ? (
                            <>
                                <Layer.Hero />
                                <PostContentBody>
                                    <section className="flex flex-col flex-1 min-w-0">
                                        <Layer.Body />
                                        <Layer.Comments />
                                        <Layer.RelatedPosts />
                                        <Layer.Actions />
                                    </section>
                                </PostContentBody>
                            </>
                        ) : (
                            <Layer.Status />
                        )}
                    </section>
                </section>
            </Scrollbar>
            {page.isReady ? <Layer.Toc /> : null}
        </PostDetailPageProvider>
    );
}
