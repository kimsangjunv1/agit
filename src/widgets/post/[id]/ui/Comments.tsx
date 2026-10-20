"use client";

import { useId, useState, type FormEvent } from "react";

import { useGetCommentDetailQuery, useSetCommentQuery } from "@/entities/comment/api/comment.query";
import { COMMENT_AUTHOR_MAX_LENGTH, COMMENT_MESSAGE_MAX_LENGTH } from "@/entities/comment/model/comment.constants";
import { util } from "@/shared/lib/util";
import { usePostDetailProvider } from "../model/PostDetailContext";
import { POST_CONTENT_WIDTH_CLASS } from "@/shared/lib/richText/styles";

const Comments = () => {
    const { postIdx, setToast } = usePostDetailProvider();
    const { data, isLoading, isError, error, isFetching, refetch } = useGetCommentDetailQuery(postIdx);
    const { mutate, isPending } = useSetCommentQuery();
    const [author, setAuthor] = useState("");
    const [msg, setMsg] = useState("");
    const [submitError, setSubmitError] = useState("");
    const formId = useId();
    const comments = data?.result ?? [];
    const hasListError = isError || data?.resultCode === "ERROR";

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isPending) return;

        if (!author.trim() || !msg.trim()) {
            setSubmitError("닉네임과 댓글 내용을 입력해주세요.");
            return;
        }

        setSubmitError("");
        mutate(
            { post_id: postIdx, author: author.trim(), msg: msg.trim() },
            {
                onSuccess: () => {
                    setMsg("");
                    setToast({ msg: "댓글을 남겼어요.", time: 2 });
                },
                onError: (submitError) => setSubmitError(submitError.message || "댓글을 등록하지 못했어요. 다시 시도해주세요."),
            },
        );
    };

    return (
        <section
            id="comments"
            aria-labelledby={`${formId}-title`}
            className={`${POST_CONTENT_WIDTH_CLASS} my-[5.2rem] scroll-mt-[18rem] tablet:scroll-mt-[12rem]`}
        >
            <h2
                id={`${formId}-title`}
                className="text-[2rem] font-semibold"
            >
                댓글 <span className="text-[var(--color-text-muted)]">{comments.length}</span>
            </h2>
            <p className="mt-[0.8rem] text-[1.4rem] text-[var(--color-text-muted)]">로그인 없이 닉네임으로 댓글을 남길 수 있어요.</p>

            <div
                className="my-[2.4rem]"
                aria-busy={isFetching}
            >
                {isLoading ? (
                    <p
                        role="status"
                        className="py-[2.4rem] text-[1.4rem] text-[var(--color-text-muted)]"
                    >
                        댓글을 불러오고 있어요.
                    </p>
                ) : hasListError ? (
                    <div className="flex flex-wrap items-center gap-[1.2rem] py-[2.4rem] text-[1.4rem]">
                        <p role="alert">{error?.message || data?.resultMessage || "댓글을 불러오지 못했어요."}</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="underline underline-offset-4 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4"
                        >
                            다시 불러오기
                        </button>
                    </div>
                ) : comments.length === 0 ? (
                    <p className="py-[2.4rem] text-[1.4rem] text-[var(--color-text-muted)]">아직 댓글이 없어요. 첫 댓글을 남겨주세요.</p>
                ) : null}

                {comments.length > 0 && (
                    <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                        {comments.map((comment) => (
                            <li
                                key={comment.idx}
                                className="py-[2.4rem]"
                            >
                                <div className="flex flex-wrap items-center gap-[0.8rem] text-[1.4rem]">
                                    <span className="break-all font-semibold">{comment.author || "익명"}</span>
                                    {comment.is_admin && <span className="rounded-full bg-[var(--color-brand-100)] px-[0.8rem] py-[0.4rem] text-[1.2rem] text-[var(--color-brand-700)]">관리자</span>}
                                    <time
                                        dateTime={comment.created_at}
                                        className="text-[var(--color-text-muted)]"
                                    >
                                        {util.string.getCurrentDate(comment.created_at, 4)}
                                        {comment.is_modified ? " · 수정됨" : ""}
                                    </time>
                                </div>
                                <p className="mt-[1.2rem] whitespace-pre-wrap [overflow-wrap:anywhere] text-[1.6rem] leading-[1.8]">{comment.msg}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <form
                onSubmit={handleSubmit}
                aria-busy={isPending}
            >
                <fieldset
                    disabled={isPending}
                    className="flex min-w-0 flex-col gap-[1.6rem]"
                >
                    <div className="flex flex-col gap-[0.8rem]">
                        <label
                            htmlFor={`${formId}-author`}
                            className="text-[1.4rem]"
                        >
                            닉네임
                        </label>
                        <input
                            id={`${formId}-author`}
                            name="author"
                            autoComplete="nickname"
                            value={author}
                            onChange={(event) => setAuthor(event.target.value)}
                            maxLength={COMMENT_AUTHOR_MAX_LENGTH}
                            required
                            placeholder="닉네임을 입력해주세요"
                            className="w-full rounded-[0.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-[1.6rem] py-[1.2rem] text-[1.6rem] focus-visible:outline-2 focus-visible:outline-[var(--color-brand-500)] disabled:opacity-50"
                        />
                    </div>
                    <div className="flex flex-col gap-[0.8rem]">
                        <label
                            htmlFor={`${formId}-message`}
                            className="text-[1.4rem]"
                        >
                            댓글 내용
                        </label>
                        <textarea
                            id={`${formId}-message`}
                            name="msg"
                            value={msg}
                            onChange={(event) => setMsg(event.target.value)}
                            maxLength={COMMENT_MESSAGE_MAX_LENGTH}
                            aria-describedby={`${formId}-length`}
                            required
                            rows={5}
                            placeholder="글에 대한 생각을 남겨주세요"
                            className="w-full resize-y rounded-[0.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-[1.6rem] py-[1.2rem] text-[1.6rem] leading-[1.8] focus-visible:outline-2 focus-visible:outline-[var(--color-brand-500)] disabled:opacity-50"
                        />
                        <p
                            id={`${formId}-length`}
                            className="text-right text-[1.2rem] text-[var(--color-text-muted)]"
                        >
                            {msg.length} / {COMMENT_MESSAGE_MAX_LENGTH}
                        </p>
                    </div>
                    {submitError && (
                        <p
                            role="alert"
                            className="text-[1.4rem] text-[var(--color-red-600)]"
                        >
                            {submitError}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={isPending || !author.trim() || !msg.trim()}
                        className="self-end rounded-[0.8rem] bg-[var(--color-surface-floating)] px-[2rem] py-[1.2rem] text-[1.4rem] font-semibold disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                        {isPending ? "등록하고 있어요…" : "댓글 남기기"}
                    </button>
                </fieldset>
            </form>
        </section>
    );
};
export default Comments;
