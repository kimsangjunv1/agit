"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

import type { GetCommentDetailData } from "@/entities/comment/model/comment.type";
import { useDeleteCommentQuery, useGetCommentDetailQuery, useUpdateCommentQuery } from "@/entities/comment/api/comment.query";
import { getCommentEmoji, getCommentProfile } from "@/entities/comment/config/commentAppearance";
import { COMMENT_MESSAGE_MAX_LENGTH } from "@/entities/comment/model/comment.constants";
import { confirmAction } from "@/shared/lib/confirmAction";
import { util } from "@/shared/lib/util";
import { usePostDetailProvider } from "../model/PostDetailContext";
import CommentComposer, { commentButtonClass, commentInputClass } from "./CommentComposer";

const CommentEntry = ({ comment, parent, onReply }: { comment: GetCommentDetailData; parent?: GetCommentDetailData; onReply: (comment: GetCommentDetailData) => void }) => {
    const { setToast } = usePostDetailProvider();
    const { data: session, status } = useSession();
    const update = useUpdateCommentQuery();
    const remove = useDeleteCommentQuery();
    const [mode, setMode] = useState<"edit" | "delete" | null>(null);
    const [msg, setMsg] = useState(comment.msg);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const busy = useRef(false);
    const id = useId();
    const isPending = update.isPending || remove.isPending;
    const isAdmin = session?.user?.role === "admin";
    const isGuest = comment.is_guest ?? true;
    const needsPassword = isGuest && !isAdmin;
    const canManage = !!comment.can_manage || isAdmin;
    const emoji = getCommentEmoji(comment.emoji_id);
    const startAction = (action: "edit" | "delete") => {
        setMode(action);
        setPassword("");
        setMsg(comment.msg);
        setError("");
    };

    const handleAction = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (busy.current || isPending) return;
        const payload = { idx: comment.idx, ...(needsPassword ? { password } : {}) };
        const execute = async () => {
            if (busy.current) return;
            busy.current = true;
            setError("");
            try {
                if (mode === "edit") await update.mutateAsync({ ...payload, msg: msg.trim() });
                else await remove.mutateAsync(payload);
                setToast({ msg: mode === "edit" ? "댓글을 수정했어요." : "댓글을 삭제했어요.", time: 2 });
                setMode(null);
                setPassword("");
            } catch (cause) {
                setError(cause instanceof Error ? cause.message : "처리하지 못했어요. 다시 시도해주세요.");
            } finally {
                busy.current = false;
            }
        };
        if (mode === "delete") {
            await confirmAction({ title: "댓글을 삭제할까요?", description: "삭제한 내용은 복구할 수 없어요. 답글은 유지됩니다.", confirmText: "삭제하기", onConfirm: execute });
        } else await execute();
    };

    if (comment.deleted_at) return <p className="py-[1.2rem] text-[1.4rem] text-[var(--color-text-muted)]">삭제된 댓글입니다.</p>;

    return <article className="relative min-w-0 text-[1.4rem]">
        <div className="flex items-start gap-[1.2rem] pr-[4rem]">
            <Image src={isGuest ? getCommentProfile(comment.profile).image : "/images/picture/profile.png"} alt="" width={44} height={44} className="h-[4.4rem] w-[4.4rem] shrink-0 rounded-full object-cover" />
            <div className="flex min-w-0 flex-wrap items-center gap-[0.8rem]">
                <span className="break-all font-semibold">{comment.author || "익명"}</span>
                {comment.is_admin ? <span className="rounded-full bg-[var(--color-brand-100)] px-[0.8rem] py-[0.4rem] text-[1.2rem] text-[var(--color-brand-700)]">관리자</span> : null}
                <time dateTime={comment.created_at} className="text-[1.2rem] text-[var(--color-text-muted)]">{util.string.getCurrentDate(comment.created_at, 4)}{comment.is_modified ? " · 수정됨" : ""}</time>
            </div>
        </div>
        {isGuest ? <span role="img" aria-label={emoji.label} className="absolute right-0 top-0 flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-floating)] text-[1.6rem]">{emoji.emoji}</span> : null}
        <p className="mt-[1.2rem] whitespace-pre-wrap [overflow-wrap:anywhere] text-[1.6rem] leading-[1.8]">
            {comment.reply_to_author ? <span className="mr-[0.6rem] text-[var(--color-brand-700)]">@{comment.reply_to_author}</span> : null}{comment.msg}
        </p>
        <div className="mt-[1.2rem] flex gap-[1.6rem] text-[var(--color-text-muted)]">
            {!parent?.deleted_at ? <button type="button" onClick={() => onReply(comment)} className="focus-visible:outline-2 focus-visible:outline-offset-4">답글</button> : null}
            {status !== "loading" && canManage ? <>
                {comment.can_manage ? <button type="button" onClick={() => startAction("edit")} className="focus-visible:outline-2 focus-visible:outline-offset-4">수정</button> : null}
                <button type="button" onClick={() => startAction("delete")} className="focus-visible:outline-2 focus-visible:outline-offset-4">삭제</button>
            </> : null}
        </div>
        {mode ? <form onSubmit={handleAction} aria-busy={isPending} className="mt-[1.6rem]">
            <fieldset disabled={isPending} className="flex min-w-0 flex-col gap-[1.2rem]">
                <legend className="mb-[1.2rem] font-semibold">댓글 {mode === "edit" ? "수정" : "삭제"}</legend>
                {mode === "edit" ? <>
                    <label htmlFor={`${id}-message`}>수정할 내용</label>
                    <textarea id={`${id}-message`} value={msg} onChange={(event) => setMsg(event.target.value)} maxLength={COMMENT_MESSAGE_MAX_LENGTH} required rows={3} className={`${commentInputClass} resize-y`} />
                </> : null}
                {needsPassword ? <>
                    <label htmlFor={`${id}-password`}>작성할 때 입력한 비밀번호</label>
                    <input id={`${id}-password`} type="password" autoComplete="off" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} maxLength={24} className={commentInputClass} />
                </> : null}
                {error ? <p role="alert" className="text-[var(--color-red-600)]">{error}</p> : null}
                <div className="flex justify-end gap-[0.8rem]">
                    <button type="button" onClick={() => { setMode(null); setPassword(""); }} className={commentButtonClass}>취소</button>
                    <button type="submit" disabled={isPending || (mode === "edit" && !msg.trim())} className={commentButtonClass}>{isPending ? "처리하고 있어요…" : mode === "edit" ? "수정하기" : "삭제 확인"}</button>
                </div>
            </fieldset>
        </form> : null}
    </article>;
};

const CommentThread = ({ comment }: { comment: GetCommentDetailData }) => {
    const { postIdx } = usePostDetailProvider();
    const [repliesOpen, setRepliesOpen] = useState(false);
    const [replyTarget, setReplyTarget] = useState<GetCommentDetailData | null>(null);
    const replies = useGetCommentDetailQuery(postIdx, { parentId: comment.idx, enabled: repliesOpen });
    const replyComments = replies.data?.pages.flatMap((page) => page.result) ?? [];
    const replyError = replies.error?.message || (replies.data?.pages[0]?.resultCode === "ERROR" ? replies.data.pages[0].resultMessage : "");
    const startReply = (target: GetCommentDetailData) => { setRepliesOpen(true); setReplyTarget(target); };
    return <li className="py-[2.4rem]">
        <CommentEntry comment={comment} onReply={startReply} />
        {(comment.reply_count ?? 0) > 0 ? <button type="button" onClick={() => setRepliesOpen(!repliesOpen)} aria-expanded={repliesOpen} className="mt-[1.6rem] text-[1.4rem] text-[var(--color-text-muted)] focus-visible:outline-2 focus-visible:outline-offset-4">{repliesOpen ? "답글 접기" : `답글 ${comment.reply_count}개 보기`}</button> : null}
        {repliesOpen ? <div className="mt-[1.6rem] border-l border-[var(--color-border)] pl-[1.6rem] tablet:pl-[2.4rem]">
            {replies.isLoading ? <p role="status" className="text-[1.4rem]">답글을 불러오고 있어요.</p> : null}
            {replyError ? <div className="text-[1.4rem]"><p role="alert">{replyError}</p><button type="button" onClick={() => void replies.refetch()} disabled={replies.isFetching} className={commentButtonClass}>답글 다시 불러오기</button></div> : null}
            {replyComments.length ? <ul className="space-y-[2.4rem]">{replyComments.map((reply) => <li key={reply.idx}><CommentEntry comment={reply} parent={comment} onReply={startReply} /></li>)}</ul> : null}
            {replies.hasNextPage ? <button type="button" onClick={() => void replies.fetchNextPage({ cancelRefetch: false })} disabled={replies.isFetching} className={`${commentButtonClass} mt-[1.6rem]`}>답글 더보기</button> : null}
            {replyTarget && !comment.deleted_at ? <div className="mt-[2.4rem]"><CommentComposer key={`${replyTarget.idx}`} parentId={comment.idx} replyToId={replyTarget.idx} replyToAuthor={replyTarget.author} onCancel={() => setReplyTarget(null)} onSubmitted={() => setReplyTarget(null)} /></div> : null}
        </div> : null}
    </li>;
};

export default CommentThread;
