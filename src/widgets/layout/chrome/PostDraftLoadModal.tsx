"use client";

import { useEffect, useState } from "react";

import { getPostDraftDetailFetch, getPostDraftListFetch } from "@/entities/post/api/post.api";
import type { PostDraftDetail, PostDraftListItem } from "@/entities/post/model/post.type";

type Props = {
    onClose: () => void;
    onLoad: (draft: PostDraftDetail) => void;
    onMarkdownClick: () => void;
};

const PostDraftLoadModal = ({ onClose, onLoad, onMarkdownClick }: Props) => {
    const [drafts, setDrafts] = useState<PostDraftListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        getPostDraftListFetch()
            .then((response) => {
                if (active) setDrafts(response.result);
            })
            .catch((cause) => {
                if (active) setError(cause instanceof Error ? cause.message : "목록을 불러오지 못했어요");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    const handleLoad = async (id: string) => {
        setLoadingId(id);
        setError("");
        try {
            const response = await getPostDraftDetailFetch(id);
            onLoad(response.result);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "임시저장 글을 불러오지 못했어요");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 px-[1.6rem]"
            role="presentation"
            onClick={onClose}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="post-draft-title"
                className="w-full max-w-[48rem] max-h-[80vh] overflow-y-auto rounded-[1.6rem] bg-white p-[2.4rem] shadow-xl"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}
            >
                <div className="flex items-center justify-between gap-[1.6rem]">
                    <h2 id="post-draft-title" className="text-[2rem] font-bold">불러오기</h2>
                    <button type="button" onClick={onClose} aria-label="닫기" className="text-[2rem]">×</button>
                </div>
                <p className="mt-[1.6rem] text-[1.4rem] text-[var(--color-gray-600)]">임시저장된 글을 선택하세요.</p>
                {loading ? <p className="mt-[2rem]">목록을 불러오는 중...</p> : null}
                {error ? <p role="alert" className="mt-[1.6rem] text-red-600">{error}</p> : null}
                {!loading && drafts.length === 0 && !error ? <p className="mt-[2rem]">임시저장된 글이 없어요.</p> : null}
                {drafts.length > 0 ? (
                    <ul className="mt-[1.6rem] flex flex-col gap-[0.8rem]">
                        {drafts.map((draft) => (
                            <li key={draft.id}>
                                <button
                                    type="button"
                                    disabled={loadingId !== null}
                                    onClick={() => handleLoad(draft.id)}
                                    className="flex w-full items-center justify-between gap-[1.6rem] rounded-[0.8rem] border border-[var(--color-gray-200)] p-[1.2rem] text-left hover:bg-[var(--color-gray-100)] disabled:opacity-60"
                                >
                                    <span className="min-w-0 truncate font-semibold">{draft.title || "제목 없음"}</span>
                                    <time dateTime={draft.updated_at} className="shrink-0 text-[1.2rem] text-[var(--color-gray-600)]">
                                        {new Date(draft.updated_at).toLocaleString("ko-KR")}
                                    </time>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : null}
                <button
                    type="button"
                    onClick={onMarkdownClick}
                    className="mt-[2.4rem] rounded-[0.8rem] border border-[var(--color-gray-300)] px-[1.6rem] py-[1rem] text-[1.4rem]"
                >
                    Markdown 파일 불러오기
                </button>
            </section>
        </div>
    );
};

export default PostDraftLoadModal;
