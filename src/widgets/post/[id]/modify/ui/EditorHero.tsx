"use client";
import PostHero from "@/features/managePost/ui/PostHero";
import { usePostModifyProvider } from "../model/PostModifyContext";
import { POST_HERO_SECTION_CLASS } from "@/shared/lib/richText/styles";
export default function EditorHero() {
    const { title, summary, thumbnail, category_idx, setTitle, setSummary, setThumbnail, setCategoryIdx, id } = usePostModifyProvider();
    return (
        <section className={POST_HERO_SECTION_CLASS}>
            <PostHero
                mode="edit"
                imageUrl={thumbnail}
                placeholderSeed={id}
                title={title}
                summary={summary}
                categoryIdx={category_idx}
                editLabel="수정 중"
                onTitleChange={setTitle}
                onSummaryChange={setSummary}
                onThumbnailChange={setThumbnail}
                onCategoryChange={setCategoryIdx}
            />
        </section>
    );
}
