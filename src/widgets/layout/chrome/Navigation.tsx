"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
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
    const markdownInputRef = useRef<HTMLInputElement>(null);

    const { currentPathName, pushToUrl } = useNavigate();
    const { rows, setRows } = useBlockStore();
    const { title, summary, setTitle, setSummary, setPost, setDraftId } = useCreatePostStore();
    const { setToast } = useToastStore();
    const isIslandVisible = useLayoutStore((state) => state.isPageContentVisible && state.transitionPhase === "idle" && !state.isMobileMenuOpen);

    const { IS_ROUTE_POST, IS_ROUTE_POST_VIEW, IS_ROUTE_POST_EDIT, IS_ROUTE_POST_CREATE } = getPostRouteFlags(currentPathName);

    const postIdx = parseInt(params?.id as string);

    const { isSavePending, savePost, saveDraft, isDraftPending } = usePostNavigationActions({
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
        setShowDraftModal(false);
    }, [currentPathName]);

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
                                onClick={() => setShowDraftModal(true)}
                                className={EDITOR_ACTION_BUTTON_CLASS}
                            >
                                <LoadIcon />
                                <span className="sr-only">불러오기</span>
                            </UI.Button>
                            <UI.Button
                                disabled={isSavePending || isDraftPending}
                                onClick={() => savePost(rows)}
                                className={EDITOR_ACTION_BUTTON_CLASS}
                            >
                                <SaveIcon />
                                <span className="sr-only">{isSavePending ? "저장 중" : "저장하기"}</span>
                            </UI.Button>
                            <UI.Button
                                disabled={isDraftPending || isSavePending}
                                onClick={() => saveDraft(rows)}
                                className={EDITOR_ACTION_BUTTON_CLASS}
                            >
                                <DraftIcon />
                                <span className="sr-only">{isDraftPending ? "저장 중" : "임시저장"}</span>
                            </UI.Button>
                        </nav>
                    </DynamicIsland>
                </div>
            ) : null}
            {markdownInput}
            {showDraftModal
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

const EDITOR_ACTION_BUTTON_CLASS = "flex h-[3.2rem] w-[3.2rem] items-center justify-center";

const EditorActionSvg = ({ children }: { children: ReactNode }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        className="h-[2.4rem] w-[2.4rem]"
        fill="currentColor"
        aria-hidden
    >
        {children}
    </svg>
);

const LoadIcon = () => (
    <EditorActionSvg>
        <path d="M260-160q-91 0-155.5-63T40-377q0-78 47-139t123-78q17-72 85-137t145-65q33 0 56.5 23.5T520-716v242l64-62 56 56-160 160-160-160 56-56 64 62v-242q-76 14-118 73.5T280-520h-20q-58 0-99 41t-41 99q0 58 41 99t99 41h480q42 0 71-29t29-71q0-42-29-71t-71-29h-60v-80q0-48-22-89.5T600-680v-93q74 35 117 103.5T760-520q69 8 114.5 59.5T920-340q0 75-52.5 127.5T740-160H260Zm220-358Z" />
    </EditorActionSvg>
);

const SaveIcon = () => (
    <EditorActionSvg>
        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
    </EditorActionSvg>
);

const DraftIcon = () => (
    <EditorActionSvg>
        <path d="m480-240 160-160-56-56-64 64v-168h-80v168l-64-64-56 56 160 160ZM200-640v440h560v-440H200Zm0 520q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v499q0 33-23.5 56.5T760-120H200Zm16-600h528l-34-40H250l-34 40Zm264 300Z" />
    </EditorActionSvg>
);

export default Navigation;
