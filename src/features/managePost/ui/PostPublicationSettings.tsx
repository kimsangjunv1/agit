"use client";

import { isPostType, isPostVisibility, POST_TYPE_OPTIONS, POST_VISIBILITY_OPTIONS } from "@/entities/post/model/postSettings";
import { useCreatePostStore } from "@/shared/stores/useCreatePostStore";

export default function PostPublicationSettings() {
    const { post_type, visibility, setPostType, setVisibility } = useCreatePostStore();
    const selectClass =
        "rounded-[0.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-[1.2rem] py-[0.8rem] text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2";

    return (
        <div className="mb-[1.6rem] flex flex-wrap gap-[1.6rem] text-[1.4rem]">
            <label className="flex items-center gap-[0.8rem]">
                글 종류
                <select
                    className={selectClass}
                    value={post_type}
                    onChange={(event) => {
                        if (isPostType(event.target.value)) setPostType(event.target.value);
                    }}
                >
                    {POST_TYPE_OPTIONS.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.title}
                        </option>
                    ))}
                </select>
            </label>
            <label className="flex items-center gap-[0.8rem]">
                공개 설정
                <select
                    className={selectClass}
                    value={visibility}
                    onChange={(event) => {
                        if (isPostVisibility(event.target.value)) setVisibility(event.target.value);
                    }}
                >
                    {POST_VISIBILITY_OPTIONS.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.title}
                        </option>
                    ))}
                </select>
            </label>
            {visibility === "private" ? <p className="self-center text-[var(--color-text-muted)]">작성자에게만 보이는 글이에요.</p> : null}
        </div>
    );
}
