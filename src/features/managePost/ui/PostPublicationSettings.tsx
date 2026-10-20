"use client";

import { isPostVisibility, POST_VISIBILITY_OPTIONS } from "@/entities/post/model/postSettings";
import { useGetPostTypesQuery } from "@/entities/postType/api/postType.query";
import { useCreatePostStore } from "@/shared/stores/useCreatePostStore";

export default function PostPublicationSettings() {
    const { post_type, visibility, setPostType, setVisibility } = useCreatePostStore();
    const { data, isPending, isError, refetch } = useGetPostTypesQuery();
    const types = data?.result ?? [];
    const selectClass =
        "rounded-[0.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-[1.2rem] py-[0.8rem] text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2";

    return (
        <div className="mb-[1.6rem] flex flex-wrap gap-[1.6rem] text-[1.4rem]">
            <label className="flex items-center gap-[0.8rem]">
                글 종류
                <select
                    aria-label="글 종류"
                    className={selectClass}
                    value={post_type}
                    disabled={isPending || isError}
                    onChange={(event) => setPostType(event.target.value)}
                >
                    {!types.some((type) => type.code === post_type) ? (
                        <option
                            value={post_type}
                            disabled
                        >
                            {isPending ? "불러오는 중..." : isError ? "불러오기 실패" : "글 종류를 다시 선택해주세요"}
                        </option>
                    ) : null}
                    {types.map((option) => (
                        <option
                            key={option.code}
                            value={option.code}
                        >
                            {option.title}
                        </option>
                    ))}
                </select>
            </label>
            {isError ? (
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="underline"
                >
                    글 종류 다시 불러오기
                </button>
            ) : null}
            <label className="flex items-center gap-[0.8rem]">
                공개 설정
                <select
                    aria-label="공개 설정"
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
