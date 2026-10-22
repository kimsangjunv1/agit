"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

import { useSetCommentQuery } from "@/entities/comment/api/comment.query";
import { COMMENT_EMOJIS, COMMENT_PROFILES, DEFAULT_COMMENT_PROFILE, getRandomCommentEmojiId } from "@/entities/comment/config/commentAppearance";
import { COMMENT_AUTHOR_MAX_CODE_UNITS, COMMENT_AUTHOR_MAX_LENGTH, COMMENT_MESSAGE_MAX_LENGTH } from "@/entities/comment/model/comment.constants";
import { getCommentAuthorLength, getRandomCommentNickname, limitCommentAuthor } from "@/entities/comment/lib/commentNickname";
import { usePostDetailProvider } from "../model/PostDetailContext";

export const commentInputClass = "w-full min-w-0 rounded-[0.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-[1.6rem] py-[1.2rem] text-[1.6rem] focus-visible:outline-2 focus-visible:outline-[var(--color-brand-500)] disabled:opacity-50";
export const commentButtonClass = "rounded-[0.8rem] bg-[var(--color-surface-floating)] px-[1.6rem] py-[1.2rem] text-[1.4rem] font-semibold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4";

interface Props {
    parentId?: number;
    replyToId?: number;
    replyToAuthor?: string;
    onCancel?: () => void;
    onSubmitted?: () => void;
}

const CommentComposer = ({ parentId, replyToId, replyToAuthor, onCancel, onSubmitted }: Props) => {
    const { postIdx, setToast } = usePostDetailProvider();
    const { data: session, status } = useSession();
    const isGuest = !session?.user?.id;
    const { mutateAsync, isPending } = useSetCommentQuery();
    const [author, setAuthor] = useState("");
    const [msg, setMsg] = useState("");
    const [password, setPassword] = useState("");
    const [profile, setProfile] = useState<number>(DEFAULT_COMMENT_PROFILE);
    // Initialize on interaction to keep the server and hydration markup identical.
    const [emojiId, setEmojiId] = useState("");
    const [submitError, setSubmitError] = useState("");
    const requestRef = useRef<{ snapshot: string; id: string } | null>(null);
    const submitting = useRef(false);
    const isAuthorComposing = useRef(false);
    const formId = useId();
    const authorName = isGuest ? author.trim() : session?.user?.name?.trim() ?? "";
    const initializeEmoji = () => { if (!emojiId) setEmojiId(getRandomCommentEmojiId()); };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting.current || isPending || isAuthorComposing.current || status === "loading") return;
        if (!authorName || !msg.trim()) {
            setSubmitError("닉네임과 댓글 내용을 입력해주세요.");
            return;
        }
        if (getCommentAuthorLength(authorName) > COMMENT_AUTHOR_MAX_LENGTH) {
            setSubmitError(`닉네임은 ${COMMENT_AUTHOR_MAX_LENGTH}글자까지 입력할 수 있어요.`);
            return;
        }
        if (isGuest && (password.length < 6 || password.length > 24 || new TextEncoder().encode(password).length > 72)) {
            setSubmitError("비밀번호는 6~24자로 입력해주세요.");
            return;
        }
        const chosenEmoji = emojiId || getRandomCommentEmojiId();
        setEmojiId(chosenEmoji);
        const content = {
            post_id: postIdx,
            author: authorName,
            msg: msg.trim(),
            ...(isGuest ? { password, profile, emoji_id: chosenEmoji } : {}),
            ...(parentId ? { parent_id: parentId, reply_to_id: replyToId } : {}),
        };
        // Keep retries of an unchanged draft identical, including after a lost response.
        const snapshot = JSON.stringify({ ...content, account: session?.user?.id ?? null });
        if (requestRef.current?.snapshot !== snapshot) requestRef.current = { snapshot, id: crypto.randomUUID() };
        submitting.current = true;
        setSubmitError("");
        try {
            await mutateAsync({ ...content, request_id: requestRef.current.id });
            requestRef.current = null;
            setMsg("");
            setPassword("");
            setEmojiId("");
            setToast({ msg: parentId ? "답글을 남겼어요." : "댓글을 남겼어요.", time: 2 });
            onSubmitted?.();
        } catch (cause) {
            setSubmitError(cause instanceof Error ? cause.message : "댓글을 등록하지 못했어요. 다시 시도해주세요.");
        } finally {
            submitting.current = false;
        }
    };

    return (
        <form onSubmit={handleSubmit} onFocus={initializeEmoji} aria-busy={isPending} className="text-[1.4rem]">
            <fieldset disabled={isPending || status === "loading"} className="flex min-w-0 flex-col gap-[1.6rem]">
                <legend className="mb-[1.6rem] font-semibold">{parentId ? `${replyToAuthor || "댓글"}님에게 답글 남기기` : "댓글 남기기"}</legend>
                {isGuest ? <>
                    <div className="flex flex-col gap-[0.8rem]">
                        <label htmlFor={`${formId}-author`}>닉네임</label>
                        <div className="flex min-w-0 items-center gap-[0.8rem]">
                            <input id={`${formId}-author`} name="author" autoComplete="nickname" value={author}
                                onChange={(event) => setAuthor(isAuthorComposing.current ? event.target.value : limitCommentAuthor(event.target.value))}
                                onCompositionStart={() => { isAuthorComposing.current = true; }}
                                onCompositionEnd={(event) => { isAuthorComposing.current = false; setAuthor(limitCommentAuthor(event.currentTarget.value)); }}
                                aria-describedby={`${formId}-author-length`} maxLength={COMMENT_AUTHOR_MAX_CODE_UNITS} required placeholder="최대 10글자로 입력해주세요" className={`${commentInputClass} flex-1`} />
                            <button type="button" onClick={() => setAuthor(getRandomCommentNickname(author))} className={`${commentButtonClass} shrink-0`}>랜덤 변경</button>
                        </div>
                        <p id={`${formId}-author-length`} className="text-right text-[1.2rem] text-[var(--color-text-muted)]">{getCommentAuthorLength(author)} / {COMMENT_AUTHOR_MAX_LENGTH}</p>
                    </div>
                    <div className="flex flex-col gap-[0.8rem]">
                        <label htmlFor={`${formId}-password`}>비밀번호</label>
                        <input id={`${formId}-password`} name="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} maxLength={24} required aria-describedby={`${formId}-password-help`} placeholder="수정·삭제에 사용할 비밀번호 (6~24자)" className={commentInputClass} />
                        <p id={`${formId}-password-help`} className="text-[1.2rem] text-[var(--color-text-muted)]">비밀번호를 잊으면 직접 수정·삭제할 수 없어요.</p>
                    </div>
                    <fieldset className="flex flex-wrap gap-[1.2rem]">
                        <legend className="mb-[0.8rem]">프로필 선택</legend>
                        {COMMENT_PROFILES.map((option) => <label key={option.id} className="cursor-pointer">
                            <input type="radio" name={`${formId}-profile`} value={option.id} checked={profile === option.id} onChange={() => setProfile(option.id)} className="peer sr-only" />
                            <span className="block rounded-full border-2 border-transparent p-[0.3rem] peer-checked:border-[var(--color-brand-500)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4">
                                <Image src={option.image} alt={option.label} width={56} height={56} className="h-[5.6rem] w-[5.6rem] rounded-full object-cover" />
                            </span>
                        </label>)}
                    </fieldset>
                </> : <p className="text-[var(--color-text-muted)]">{authorName}님으로 작성해요.</p>}
                <div className="flex flex-col gap-[0.8rem]">
                    <label htmlFor={`${formId}-message`}>{parentId ? "답글 내용" : "댓글 내용"}</label>
                    <textarea id={`${formId}-message`} name="msg" value={msg} onChange={(event) => setMsg(event.target.value)} maxLength={COMMENT_MESSAGE_MAX_LENGTH} aria-describedby={`${formId}-length`} required rows={parentId ? 3 : 5} placeholder="글에 대한 생각을 남겨주세요" className={`${commentInputClass} resize-y leading-[1.8]`} />
                    <p id={`${formId}-length`} className="text-right text-[1.2rem] text-[var(--color-text-muted)]">{msg.length} / {COMMENT_MESSAGE_MAX_LENGTH}</p>
                </div>
                {submitError ? <p role="alert" className="text-[var(--color-red-600)]">{submitError}</p> : null}
                <div className="flex flex-wrap items-center justify-end gap-[0.8rem]">
                    {onCancel ? <button type="button" onClick={onCancel} className={commentButtonClass}>취소</button> : null}
                    {isGuest ? <>
                        <label htmlFor={`${formId}-emoji`} className="sr-only">댓글 이모지 선택</label>
                        <select id={`${formId}-emoji`} value={emojiId} onChange={(event) => setEmojiId(event.target.value)} className={`${commentButtonClass} border border-[var(--color-border)]`}>
                            {!emojiId ? <option value="">이모지</option> : null}
                            {COMMENT_EMOJIS.map((option) => <option key={option.id} value={option.id}>{option.emoji} {option.label}</option>)}
                        </select>
                    </> : null}
                    <button type="submit" disabled={isPending || status === "loading" || !authorName || !msg.trim() || (isGuest && password.length < 6)} className={commentButtonClass}>{isPending ? "등록하고 있어요…" : parentId ? "답글 남기기" : "댓글 남기기"}</button>
                </div>
            </fieldset>
        </form>
    );
};

export default CommentComposer;
