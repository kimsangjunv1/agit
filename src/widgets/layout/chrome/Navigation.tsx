"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";

import UI from "@/shared/ui/common/UIComponent";
import DynamicIsland from "@/shared/ui/common/DynamicIsland";

import useNavigate from "@/shared/hooks/useNavigate";
import { confirmAction } from "@/shared/lib/confirmAction";
import { getPostRouteFlags, usePostNavigationActions } from "@/features/managePost";
import { useBlockStore } from "@/features/managePost/model/useEditorBlockStore";
import { parsePostMarkdown } from "@/features/managePost/lib/parsePostMarkdown";
import { normalizeBlocksForEditor } from "@/features/managePost/lib/normalizePostBlocks";
import { collectImagesFromPost } from "@/features/managePost/lib/preparePostSave";
import type { PostDraftDetail } from "@/entities/post/model/post.type";
import { useCreatePostStore } from "@/shared/stores/useCreatePostStore";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import { usePostDraftImageStore } from "@/shared/stores/usePostDraftImageStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import PostDraftLoadModal from "./PostDraftLoadModal";

const Navigation = () => {
    const params = useParams();
    const [showDraftModal, setShowDraftModal] = useState(false);
    const [headerContainer, setHeaderContainer] = useState<HTMLElement | null>(null);
    const markdownInputRef = useRef<HTMLInputElement>(null);

    const { currentPathName, pushToUrl } = useNavigate();
    const { rows, setRows } = useBlockStore();
    const { title, summary, setTitle, setSummary, setPost, setDraftId } = useCreatePostStore();
    const { setToast } = useToastStore();
    const isIslandVisible = useLayoutStore((state) => state.isPageContentVisible && state.transitionPhase === "idle" && !state.isMobileMenuOpen);

    const { IS_ROUTE_POST, IS_ROUTE_POST_VIEW, IS_ROUTE_POST_EDIT, IS_ROUTE_POST_CREATE } = getPostRouteFlags(currentPathName);

    const postIdx = parseInt(params?.id as string);

    const { postTitle, isSavePending, savePost, saveDraft, isDraftPending } = usePostNavigationActions({
        postIdx,
        isView: IS_ROUTE_POST_VIEW,
        isCreate: IS_ROUTE_POST_CREATE,
        isEdit: IS_ROUTE_POST_EDIT,
        pushToUrl,
    });

    const hasEditorContent = () =>
        Boolean(title.trim() || summary.trim()) ||
        rows.some((row) => row.some((block) => Boolean(block.title?.trim() || block.subtitle?.trim() || (typeof block.content === "string" && block.content.trim()) || block.imageUrl?.trim())));

    const handleLoadDraft = (draft: PostDraftDetail) => {
        const load = () => {
            const payload = draft.payload;
            setPost({ ...payload, category_idx: payload.category_idx ?? 0, draft_id: draft.id });
            setRows(normalizeBlocksForEditor(payload.contents));
            const images = usePostDraftImageStore.getState();
            images.reset();
            collectImagesFromPost(payload.thumbnail, payload.contents).forEach((url) => images.addFromUrl(url));
            setShowDraftModal(false);
            setToast({ msg: "임시저장 글을 불러왔어요", type: "success" });
        };

        if (hasEditorContent()) {
            void confirmAction({
                title: "임시저장된 글을 불러올까요?",
                description: `현재 작성 중인 내용을 '${draft.title || "제목 없는 글"}'로 교체합니다.`,
                confirmText: "교체하기",
                onConfirm: load,
            });
        } else {
            load();
        }
    };

    const handleMarkdownFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;
        if (!file.name.toLowerCase().endsWith(".md")) {
            setToast({
                msg: "Markdown(.md) 파일만 불러올 수 있어요",
                type: "warning",
            });
            return;
        }

        try {
            const parsed = parsePostMarkdown(await file.text());
            if (!parsed.title || parsed.rows.length === 0) {
                setToast({
                    msg: "제목과 본문을 확인할 수 없는 Markdown 파일이에요",
                    type: "warning",
                });
                return;
            }

            const load = () => {
                setTitle(parsed.title);
                setSummary(parsed.summary);
                setRows(parsed.rows);
                setDraftId(null);
                setShowDraftModal(false);
                setToast({ msg: `${parsed.rows.length}개 그룹을 불러왔어요`, type: "success" });
            };

            if (hasEditorContent()) {
                void confirmAction({
                    title: "Markdown 내용을 불러올까요?",
                    description: `현재 작성 중인 제목, 요약, 블록을 '${file.name}'의 내용으로 교체합니다.`,
                    confirmText: "교체하기",
                    onConfirm: load,
                });
            } else {
                load();
            }
        } catch {
            setToast({ msg: "Markdown 파일을 불러오지 못했어요", type: "fail" });
        }
    };

    useEffect(() => {
        setHeaderContainer(document.getElementById(IS_ROUTE_POST_CREATE ? "post-create-header-actions" : "post-header-actions"));
        if (showDraftModal) {
            setShowDraftModal(false);
        }
    }, [currentPathName, IS_ROUTE_POST_CREATE]);

    if (!IS_ROUTE_POST || IS_ROUTE_POST_VIEW) return null;

    const markdownInput = (
        <input
            ref={markdownInputRef}
            type="file"
            accept=".md,text/markdown,text/plain"
            className="hidden"
            onChange={handleMarkdownFile}
        />
    );

    return (
        <>
            {headerContainer && IS_ROUTE_POST_EDIT
                ? createPortal(<h2 className="truncate text-[1.4rem] leading-[1.5]">{`${title || postTitle || "글 편집"} | 수정중`}</h2>, headerContainer)
                : null}
            {isIslandVisible ? (
                <div className="fixed bottom-[calc(2.4rem+env(safe-area-inset-bottom))] left-1/2 z-[120] -translate-x-1/2">
                    <DynamicIsland
                        ariaLabel={IS_ROUTE_POST_CREATE ? "포스트 작성" : "포스트 편집"}
                        placement="bottom"
                    >
                        <nav
                            aria-label={IS_ROUTE_POST_CREATE ? "포스트 작성 메뉴" : "포스트 편집 메뉴"}
                            className="flex items-center gap-[0.4rem]"
                        >
                            <UI.Button
                                onClick={() => (IS_ROUTE_POST_CREATE ? setShowDraftModal(true) : markdownInputRef.current?.click())}
                                className="whitespace-nowrap px-[1.2rem] py-[0.6rem] text-[1.4rem]"
                            >
                                불러오기
                            </UI.Button>
                            <UI.Button
                                disabled={isSavePending || isDraftPending}
                                onClick={() => savePost(rows)}
                                className="whitespace-nowrap px-[1.2rem] py-[0.6rem] text-[1.4rem] disabled:opacity-60"
                            >
                                {isSavePending ? (IS_ROUTE_POST_CREATE ? "생성 중..." : "수정 중...") : IS_ROUTE_POST_CREATE ? "생성하기" : "수정하기"}
                            </UI.Button>
                            {IS_ROUTE_POST_CREATE ? (
                                <UI.Button
                                    disabled={isDraftPending || isSavePending}
                                    onClick={() => saveDraft(rows)}
                                    className="whitespace-nowrap px-[1.2rem] py-[0.6rem] text-[1.4rem] disabled:opacity-60"
                                >
                                    {isDraftPending ? "저장 중..." : "임시저장"}
                                </UI.Button>
                            ) : null}
                        </nav>
                    </DynamicIsland>
                </div>
            ) : null}
            {markdownInput}
            {showDraftModal && IS_ROUTE_POST_CREATE
                ? createPortal(
                      <PostDraftLoadModal
                          onClose={() => setShowDraftModal(false)}
                          onLoad={handleLoadDraft}
                          onMarkdownClick={() => markdownInputRef.current?.click()}
                      />,
                      document.body,
                  )
                : null}
        </>
    );
};

export default Navigation;
