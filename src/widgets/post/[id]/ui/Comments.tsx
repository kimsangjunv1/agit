"use client";

import { useId, useRef } from "react";
import { useInView } from "motion/react";

import { useGetCommentDetailQuery } from "@/entities/comment/api/comment.query";
import { usePostDetailProvider } from "../model/PostDetailContext";
import { POST_CONTENT_WIDTH_CLASS } from "@/shared/lib/richText/styles";
import CommentComposer from "./CommentComposer";
import CommentThread from "./CommentThread";
import InfiniteScrollTrigger from "@/shared/ui/common/InfiniteScrollTrigger";

const Comments = () => {
    const { postIdx, setToast, scrollViewportRef } = usePostDetailProvider();
    const sectionRef = useRef<HTMLElement>(null);
    const hasBeenVisible = useInView(sectionRef, { root: scrollViewportRef, once: true });
    const { data, isLoading, isError, error, isFetching, refetch, hasNextPage, fetchNextPage } = useGetCommentDetailQuery(postIdx, { enabled: hasBeenVisible });
    const formId = useId();
    const comments = data?.pages.flatMap((page) => page.result) ?? [];
    const firstPage = data?.pages[0];
    const hasListError = isError || firstPage?.resultCode === "ERROR";

    return (
        <section
            ref={sectionRef}
            id="comments"
            aria-labelledby={`${formId}-title`}
            className={`${POST_CONTENT_WIDTH_CLASS} my-[5.2rem] scroll-mt-[18rem] tablet:scroll-mt-[12rem]`}
        >
            <h2
                id={`${formId}-title`}
                className="text-[2rem] font-semibold"
            >
                댓글 <span className="text-[var(--color-text-muted)]">{firstPage?.pagination?.commentTotalCount ?? firstPage?.pagination?.totalCount ?? "…"}</span>
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
                ) : hasListError && comments.length === 0 ? (
                    <div className="flex flex-wrap items-center gap-[1.2rem] py-[2.4rem] text-[1.4rem]">
                        <p role="alert">{error?.message || firstPage?.resultMessage || "댓글을 불러오지 못했어요."}</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="underline underline-offset-4 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4"
                        >
                            다시 불러오기
                        </button>
                    </div>
                ) : firstPage && comments.length === 0 ? (
                    <p className="py-[2.4rem] text-[1.4rem] text-[var(--color-text-muted)]">아직 댓글이 없어요. 첫 댓글을 남겨주세요.</p>
                ) : null}

                {comments.length > 0 && (
                    <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                        {comments.map((comment) => <CommentThread key={comment.idx} comment={comment} />)}
                    </ul>
                )}
                {hasNextPage ? (
                    <InfiniteScrollTrigger
                        root={scrollViewportRef}
                        isFetching={isFetching}
                        isError={isError}
                        onLoadMore={() => {
                            void fetchNextPage({ cancelRefetch: false });
                        }}
                    />
                ) : null}
            </div>

            <CommentComposer key={postIdx} />
        </section>
    );
};
export default Comments;
