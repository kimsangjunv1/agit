"use client";
import PostHero from "@/features/managePost/ui/PostHero";
import { usePostCreateProvider } from "../model/PostCreateContext";
import { POST_HERO_SECTION_CLASS } from "@/shared/lib/richText/styles";
export default function EditorHero() {
    const { title, summary, thumbnail, category_idx, setTitle, setSummary, setThumbnail, setCategoryIdx } = usePostCreateProvider();
    return (
        <section className={POST_HERO_SECTION_CLASS}>
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
