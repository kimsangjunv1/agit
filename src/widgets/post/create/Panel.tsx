"use client";
import { PostCreatePageProvider } from "./model/PostCreateContext";
import * as Layer from "@/widgets/post/create/ui";
import PostContentBody from "@/features/managePost/ui/PostContentBody";
import { POST_CONTENT_WIDTH_CLASS, POST_INNER_CLASS, POST_PAGE_CLASS } from "@/shared/lib/richText/styles";
export default function Panel() {
    return (
        <PostCreatePageProvider>
            <section className={`${POST_PAGE_CLASS} pb-[7.2rem]`}>
                <section className={POST_INNER_CLASS}>
                    <Layer.EditorHero />
                    <PostContentBody>
                        <section className={`${POST_CONTENT_WIDTH_CLASS} flex flex-col gap-[7.2rem]`}>
                            <Layer.EditorBlocks />
                            <Layer.AttachedImages />
                        </section>
                    </PostContentBody>
                </section>
                <Layer.Toc />
            </section>
        </PostCreatePageProvider>
    );
}
