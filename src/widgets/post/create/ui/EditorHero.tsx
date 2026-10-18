"use client";
import PostHero from "@/features/managePost/ui/PostHero";
import { usePostCreateProvider } from "../model/PostCreateContext";
export default function EditorHero() {
    const { title, summary, thumbnail, category_idx, setTitle, setSummary, setThumbnail, setCategoryIdx } = usePostCreateProvider();
    return (
        <section className="flex flex-col justify-center items-center gap-[3.2rem] h-[100svh] w-full">
            <PostHero
                mode="edit"
                imageUrl={thumbnail}
                title={title}
                summary={summary}
                categoryIdx={category_idx}
                editLabel="작성 중"
                onTitleChange={setTitle}
                onSummaryChange={setSummary}
                onThumbnailChange={setThumbnail}
                onCategoryChange={setCategoryIdx}
            />
        </section>
    );
}
