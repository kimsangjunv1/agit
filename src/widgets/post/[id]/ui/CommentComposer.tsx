"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { useSetCommentQuery } from "@/entities/comment/api/comment.query";
import { COMMENT_EMOJIS, COMMENT_PROFILES, DEFAULT_COMMENT_PROFILE, getCommentProfile, getRandomCommentEmojiId } from "@/entities/comment/config/commentAppearance";
import { COMMENT_AUTHOR_MAX_CODE_UNITS, COMMENT_AUTHOR_MAX_LENGTH, COMMENT_MESSAGE_MAX_LENGTH } from "@/entities/comment/model/comment.constants";
import { getCommentAuthorLength, getRandomCommentNickname, limitCommentAuthor } from "@/entities/comment/lib/commentNickname";
import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";
import UI from "@/shared/ui/common/UIComponent";
import { usePostDetailProvider } from "../model/PostDetailContext";

export const commentInputClass =
    "w-full min-w-0 rounded-[0.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-[1.6rem] py-[1.2rem] text-[1.6rem] focus-visible:outline-2 focus-visible:outline-[var(--color-brand-500)] disabled:opacity-50";
export const commentButtonClass =
    "rounded-[0.8rem] bg-[var(--color-surface-floating)] px-[1.6rem] py-[1.2rem] text-[1.4rem] font-semibold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4";

interface Props {
    parentId?: number;
    replyToId?: number;
    replyToAuthor?: string;
    onCancel?: () => void;
    onSubmitted?: () => void;
}

const passwordReady = (password: string) => password.length >= 6 && password.length <= 24 && new TextEncoder().encode(password).length <= 72;

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
    const [needsPassword, setNeedsPassword] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const requestRef = useRef<{ snapshot: string; id: string } | null>(null);
    const submitting = useRef(false);
    const isAuthorComposing = useRef(false);
    const passwordRef = useRef<HTMLInputElement>(null);
    const formId = useId();
    const reducedMotion = useReducedMotion();
    const authorName = isGuest ? author.trim() : (session?.user?.name?.trim() ?? "");
    const selectedProfile = getCommentProfile(profile);
    const selectedEmoji = COMMENT_EMOJIS.find((option) => option.id === emojiId);
    const canConfirmPassword = passwordReady(password);
    const initializeEmoji = () => {
        if (!emojiId) setEmojiId(getRandomCommentEmojiId());
    };
    const motionTransition = reducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

    useEffect(() => {
        if (status !== "unauthenticated") return;
        setAuthor((current) => current || getRandomCommentNickname());
    }, [status]);

    useEffect(() => {
        if (needsPassword) passwordRef.current?.focus();
    }, [needsPassword]);

    const revealPassword = () => {
        if (isAuthorComposing.current || status === "loading" || isPending) return;
        if (!authorName || !msg.trim()) {
            setSubmitError("닉네임과 댓글 내용을 입력해주세요.");
            return;
        }
        if (getCommentAuthorLength(authorName) > COMMENT_AUTHOR_MAX_LENGTH) {
            setSubmitError(`닉네임은 ${COMMENT_AUTHOR_MAX_LENGTH}글자까지 입력할 수 있어요.`);
            return;
        }
        setSubmitError("");
        setNeedsPassword(true);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting.current || isPending || isAuthorComposing.current || status === "loading") return;
        if (isGuest && !needsPassword) {
            revealPassword();
            return;
        }
        if (!authorName || !msg.trim()) {
            setSubmitError("닉네임과 댓글 내용을 입력해주세요.");
            return;
        }
        if (getCommentAuthorLength(authorName) > COMMENT_AUTHOR_MAX_LENGTH) {
            setSubmitError(`닉네임은 ${COMMENT_AUTHOR_MAX_LENGTH}글자까지 입력할 수 있어요.`);
            return;
        }
        if (isGuest && !passwordReady(password)) {
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
            setNeedsPassword(false);
            setToast({ msg: parentId ? "답글을 남겼어요." : "댓글을 남겼어요.", time: 2 });
            onSubmitted?.();
        } catch (cause) {
            setSubmitError(cause instanceof Error ? cause.message : "댓글을 등록하지 못했어요. 다시 시도해주세요.");
        } finally {
            submitting.current = false;
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            onFocus={initializeEmoji}
            aria-busy={isPending}
            className="text-[1.4rem]"
        >
            <fieldset
                disabled={isPending || status === "loading"}
                className="flex min-w-0 flex-col gap-[1.6rem]"
            >
                {/* <legend className="mb-[1.6rem] font-semibold">{parentId ? `${replyToAuthor || "댓글"}님에게 답글 남기기` : "댓글 남기기"}</legend> */}
                {isGuest ? (
                    <div className="flex flex-col gap-[0.8rem]">
                        <label
                            htmlFor={`${formId}-author`}
                            className="sr-only"
                        >
                            닉네임
                        </label>
                        <div className="grid w-max max-w-full grid-cols-[auto_auto_auto] items-center gap-x-[0.8rem] gap-y-[0.8rem]">
                            <UI.FloatingSelector
                                ariaLabel="프로필 선택"
                                triggerClassName="h-[4.8rem] w-[4.8rem] shrink-0 overflow-hidden rounded-full border-2 border-[var(--color-brand-500)]"
                                trigger={
                                    <Image
                                        src={selectedProfile.image}
                                        alt=""
                                        width={48}
                                        height={48}
                                        className="h-full w-full object-cover"
                                    />
                                }
                            >
                                <div className="flex w-max gap-[0.4rem]">
                                    {COMMENT_PROFILES.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            aria-pressed={profile === option.id}
                                            aria-label={option.label}
                                            onClick={() => setProfile(option.id)}
                                            className={`rounded-full border-2 p-[0.3rem] ${profile === option.id ? "border-[var(--color-brand-500)]" : "border-transparent"}`}
                                        >
                                            <Image
                                                src={option.image}
                                                alt=""
                                                width={56}
                                                height={56}
                                                className="h-[5.6rem] w-[5.6rem] rounded-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </UI.FloatingSelector>
                            <input
                                id={`${formId}-author`}
                                name="author"
                                autoComplete="nickname"
                                value={author}
                                onChange={(event) => setAuthor(isAuthorComposing.current ? event.target.value : limitCommentAuthor(event.target.value))}
                                onCompositionStart={() => {
                                    isAuthorComposing.current = true;
                                }}
                                onCompositionEnd={(event) => {
                                    isAuthorComposing.current = false;
                                    setAuthor(limitCommentAuthor(event.currentTarget.value));
                                }}
                                aria-describedby={`${formId}-author-length`}
                                maxLength={COMMENT_AUTHOR_MAX_CODE_UNITS}
                                required
                                placeholder="닉네임"
                                className={`${commentInputClass} !w-[calc(10.8em+2px)] max-w-full`}
                            />
                            <button
                                type="button"
                                onClick={() => setAuthor(getRandomCommentNickname(author))}
                                className={`${commentButtonClass} shrink-0`}
                            >
                                랜덤 변경
                            </button>
                            {/* <p
                                id={`${formId}-author-length`}
                                className="col-start-2 text-right text-[1.2rem] text-[var(--color-text-muted)]"
                            >
                                {getCommentAuthorLength(author)} / {COMMENT_AUTHOR_MAX_LENGTH}
                            </p> */}
                        </div>
                    </div>
                ) : (
                    <p className="text-[var(--color-text-muted)]">{authorName}님으로 작성해요.</p>
                )}
                <div className="flex flex-col gap-[0.8rem]">
                    {/* <label htmlFor={`${formId}-message`}>{parentId ? "답글 내용" : "댓글 내용"}</label> */}
                    <textarea
                        id={`${formId}-message`}
                        name="msg"
                        value={msg}
                        onChange={(event) => setMsg(event.target.value)}
                        maxLength={COMMENT_MESSAGE_MAX_LENGTH}
                        aria-describedby={`${formId}-length`}
                        required
                        rows={parentId ? 3 : 5}
                        placeholder="글에 대한 생각을 남겨주세요"
                        className={`${commentInputClass} resize-y leading-[1.8]`}
                    />
                    <p
                        id={`${formId}-length`}
                        className="text-right text-[1.2rem] text-[var(--color-text-muted)]"
                    >
                        {msg.length} / {COMMENT_MESSAGE_MAX_LENGTH}
                    </p>
                </div>
                {submitError ? (
                    <p
                        role="alert"
                        className="text-[var(--color-red-600)]"
                    >
                        {submitError}
                    </p>
                ) : null}
                <div className="flex flex-wrap items-center justify-end gap-[0.8rem]">
                    {onCancel ? (
                        <button
                            type="button"
                            onClick={onCancel}
                            className={commentButtonClass}
                        >
                            취소
                        </button>
                    ) : null}
                    {isGuest ? (
                        <div className="flex items-center gap-[0.8rem]">
                            <motion.div
                                layout="position"
                                transition={motionTransition}
                            >
                                <UI.FloatingSelector
                                    ariaLabel="댓글 이모지 선택"
                                    align="end"
                                    triggerClassName={`${commentButtonClass} flex h-[4.8rem] w-[4.8rem] items-center justify-center border border-[var(--color-border)] px-0 text-[2rem]`}
                                    trigger={<span aria-hidden="true">{selectedEmoji?.emoji ?? "🙂"}</span>}
                                >
                                    <div className="flex w-max gap-[0.4rem]">
                                        {COMMENT_EMOJIS.map((option) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                aria-label={option.label}
                                                aria-pressed={emojiId === option.id}
                                                onClick={() => setEmojiId(option.id)}
                                                className={`flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-full text-[2.2rem] hover:bg-white/10 ${emojiId === option.id ? "bg-white/10" : ""}`}
                                            >
                                                <span aria-hidden="true">{option.emoji}</span>
                                            </button>
                                        ))}
                                    </div>
                                </UI.FloatingSelector>
                            </motion.div>
                            <AnimatePresence
                                mode="popLayout"
                                initial={false}
                            >
                                {needsPassword ? (
                                    <motion.div
                                        key="password"
                                        layout
                                        className="flex min-w-0 items-center gap-[0.8rem]"
                                        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={reducedMotion ? undefined : { opacity: 0, y: 18 }}
                                        transition={motionTransition}
                                    >
                                        <label
                                            htmlFor={`${formId}-password`}
                                            className="sr-only"
                                        >
                                            비밀번호
                                        </label>
                                        <input
                                            ref={passwordRef}
                                            id={`${formId}-password`}
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            minLength={6}
                                            maxLength={24}
                                            required
                                            aria-describedby={`${formId}-password-help`}
                                            placeholder="수정·삭제에 사용할 비밀번호 (6~24자)"
                                            className={`${commentInputClass} w-[24rem] max-w-[calc(100vw-12rem)]`}
                                        />
                                        <p
                                            id={`${formId}-password-help`}
                                            className="sr-only"
                                        >
                                            비밀번호를 잊으면 직접 수정·삭제할 수 없어요.
                                        </p>
                                        <button
                                            type="submit"
                                            disabled={isPending || status === "loading" || !canConfirmPassword}
                                            aria-label={parentId ? "답글 등록" : "댓글 등록"}
                                            className={`${commentButtonClass} flex h-[4.8rem] w-[4.8rem] items-center justify-center px-0`}
                                        >
                                            <MaterialIcon
                                                name="check"
                                                size={22}
                                                className={canConfirmPassword ? "text-[var(--color-brand-500)]" : "text-[var(--color-text-muted)]"}
                                            />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        key="submit"
                                        layout
                                        type="button"
                                        disabled={isPending || status === "loading" || !authorName || !msg.trim()}
                                        onClick={revealPassword}
                                        initial={reducedMotion ? false : { opacity: 0, y: -12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={reducedMotion ? undefined : { opacity: 0, y: -16 }}
                                        transition={motionTransition}
                                        className={commentButtonClass}
                                    >
                                        {parentId ? "답글 남기기" : "댓글 남기기"}
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            disabled={isPending || status === "loading" || !authorName || !msg.trim()}
                            className={commentButtonClass}
                        >
                            {isPending ? "등록하고 있어요…" : parentId ? "답글 남기기" : "댓글 남기기"}
                        </button>
                    )}
                </div>
            </fieldset>
        </form>
    );
};

export default CommentComposer;
