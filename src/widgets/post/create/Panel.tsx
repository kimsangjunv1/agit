"use client";
import { PostCreatePageProvider } from "./model/PostCreateContext";
import * as Layer from "@/widgets/post/create/ui";
export default function Panel() {
    return (
        <PostCreatePageProvider>
            <section className="flex flex-col w-full post pb-[7.2rem]">
                <section className="mx-auto post-inner flex flex-col gap-[5.2rem] w-full items-center bg-[#efefef]">
                    <Layer.EditorHero />
                    <article className="flex gap-[0.4rem] w-full max-w-[var(--size-tablet)] min-w-0">
                        <section className="flex flex-col gap-[7.2rem] flex-1 min-w-0 mx-[1.6rem_6.4rem]">
                            <Layer.EditorBlocks />
                            <Layer.AttachedImages />
                        </section>
                    </article>
                </section>
                <Layer.Toc />
            </section>
        </PostCreatePageProvider>
    );
}
