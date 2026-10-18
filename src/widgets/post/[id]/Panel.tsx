"use client";
import type { GetPostDetailResponse } from "@/entities/post/model/post.type";
import { PostDetailPageProvider } from "./model/PostDetailContext";
import usePostDetail from "./model/usePostDetail";
import * as Layer from "@/widgets/post/[id]/ui";
export default function Panel({ id, initialData }: { id: string; initialData: GetPostDetailResponse }) {
    const page = usePostDetail(id, initialData);
    return (
        <PostDetailPageProvider value={page}>
            <section className="flex flex-col w-full post">
                <section className="mx-auto post-inner flex flex-col w-full items-center">
                    {page.isReady ? (
                        <>
                            <Layer.Hero />
                            <article
                                className="post-reading-root z-[100] mt-[100svh] pt-[10rem] flex w-full gap-[0.4rem] bg-white"
                                style={{
                                    ["--post-read-scale" as string]: page.fontScale,
                                    ["--post-read-line-height" as string]: page.lineHeight,
                                }}
                            >
                                <section className="flex flex-col flex-1 min-w-0">
                                    <Layer.Body />
                                    <Layer.Comments />
                                    <Layer.RelatedPosts />
                                    <Layer.Actions />
                                </section>
                            </article>
                            <Layer.Toc />
                        </>
                    ) : (
                        <Layer.Status />
                    )}
                </section>
            </section>
            <Layer.Modal />
        </PostDetailPageProvider>
    );
}
