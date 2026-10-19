"use client";
import { PostModifyPageProvider } from "./model/PostModifyContext";
import * as Layer from "@/widgets/post/[id]/modify/ui";
import PostContentBody from "@/features/managePost/ui/PostContentBody";
import { POST_CONTENT_WIDTH_CLASS, POST_INNER_CLASS, POST_PAGE_CLASS } from "@/shared/lib/richText/styles";
export default function Panel({ id }: { id: string }) {
    return (
        <PostModifyPageProvider id={id}>
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
        </PostModifyPageProvider>
    );
}
