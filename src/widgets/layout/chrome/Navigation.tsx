"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "motion/react";

import UI from "@/shared/ui/common/UIComponent";
import IconComponent from "@/shared/ui/common/IconComponent";

import useNavigate from "@/shared/hooks/useNavigate";
import { useScrollProgressBar } from "@/shared/hooks/useScrollProgress";
import { getPostRouteFlags, PostSaveNavButton, usePostNavigationActions } from "@/features/managePost";
import { useBlockStore } from "@/features/managePost/model/useEditorBlockStore";
import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";
import { parsePostMarkdown } from "@/features/managePost/lib/parsePostMarkdown";
import { normalizeBlocksForEditor } from "@/features/managePost/lib/normalizePostBlocks";
import { collectImagesFromPost } from "@/features/managePost/lib/preparePostSave";
import type { PostDraftDetail } from "@/entities/post/model/post.type";
import { useCreatePostStore } from "@/shared/stores/useCreatePostStore";
import { usePostDraftImageStore } from "@/shared/stores/usePostDraftImageStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import PostDraftLoadModal from "./PostDraftLoadModal";

const springTransition = {
    type: "spring" as const,
    mass: 0.1,
    stiffness: 100,
    damping: 10,
};

const Navigation = () => {
    const params = useParams();
    const [showMenu, setShowMenu] = useState(false);
    const [showDraftModal, setShowDraftModal] = useState(false);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const markdownInputRef = useRef<HTMLInputElement>(null);

    useScrollProgressBar(progressBarRef);
    const { currentPathName, pushToUrl } = useNavigate();
    const { rows, setRows } = useBlockStore();
    const { title, summary, setTitle, setSummary, setPost, setDraftId } = useCreatePostStore();
    const { setToast } = useToastStore();

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
        if (hasEditorContent() && !window.confirm("현재 작성 중인 내용을 임시저장된 글로 교체할까요?")) {
            return;
        }

        const payload = draft.payload;
        setPost({ ...payload, draft_id: draft.id });
        setRows(normalizeBlocksForEditor(payload.contents));
        const images = usePostDraftImageStore.getState();
        images.reset();
        collectImagesFromPost(payload.thumbnail, payload.contents).forEach((url) => images.addFromUrl(url));
        setShowDraftModal(false);
        setToast({ msg: "임시저장 글을 불러왔어요", type: "success" });
    };

    const handleMarkdownFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;
        if (!file.name.toLowerCase().endsWith(".md")) {
            setToast({ msg: "Markdown(.md) 파일만 불러올 수 있어요", type: "warning" });
            return;
        }

        if (hasEditorContent() && !window.confirm("현재 작성 중인 제목, 요약, 블록을 불러온 Markdown 내용으로 교체할까요?")) {
            return;
        }

        try {
            const parsed = parsePostMarkdown(await file.text());
            if (!parsed.title || parsed.rows.length === 0) {
                setToast({ msg: "제목과 본문을 확인할 수 없는 Markdown 파일이에요", type: "warning" });
                return;
            }

            setTitle(parsed.title);
            setSummary(parsed.summary);
            setRows(parsed.rows);
            setDraftId(null);
            setShowDraftModal(false);
            setToast({ msg: `${parsed.rows.length}개 그룹을 불러왔어요`, type: "success" });
        } catch {
            setToast({ msg: "Markdown 파일을 불러오지 못했어요", type: "fail" });
        }
    };

    useEffect(() => {
        if (showMenu) {
            setShowMenu(false);
        }
        if (showDraftModal) {
            setShowDraftModal(false);
        }
    }, [currentPathName]);

    if (!IS_ROUTE_POST) return null;

    return (
        // <nav className="fixed tablet:top-[calc(1.6rem*3)] mobile:top-[calc(1.6rem*1)] left-[50%] tablet:px-[calc(1.6rem*2)] mobile:px-0 transform translate-x-[-50%] z-[1000] w-[calc(100dvw-(1.6rem*2))]">
        <nav className="fixed tablet:top-[calc(1.6rem*3)] mobile:top-[calc(1.6rem*1)] left-0 z-[1000] w-[calc(100dvw-(1.6rem*2))]">
            <div className="nav-inner menu flex justify-between gap-[4.8rem] w-full">
                <section className="flex items-start gap-[0.4rem] z-1">
                    <UI.Button
                        type="button"
                        onClick={() => pushToUrl("/")}
                        className="transition-colors flex flex-col items-start"
                    >
                        <p className="bg-black text-white p-[2.0rem] text-[2.4rem] font-semibold tablet:block mobile:hidden">{IS_ROUTE_POST_VIEW ? "메인으로" : "이전으로"}</p>
                        <MaterialIcon
                            name="arrow_back"
                            size={24}
                            className="bg-black text-white p-[2.0rem]"
                        />
                    </UI.Button>

                    {IS_ROUTE_POST_EDIT || IS_ROUTE_POST_CREATE ? (
                        <>
                            <UI.Button
                                type="button"
                                onClick={() => IS_ROUTE_POST_CREATE ? setShowDraftModal(true) : markdownInputRef.current?.click()}
                                className="transition-colors flex flex-col items-start"
                            >
                                <p className="bg-black text-white p-[2.0rem] text-[2.4rem] font-semibold tablet:block mobile:hidden">불러오기</p>
                                <MaterialIcon
                                    name="upload_file"
                                    size={24}
                                    className="bg-black text-white p-[2.0rem]"
                                />
                            </UI.Button>
                            <input
                                ref={markdownInputRef}
                                type="file"
                                accept=".md,text/markdown,text/plain"
                                className="hidden"
                                onChange={handleMarkdownFile}
                            />
                        </>
                    ) : null}
                </section>

                <section className="flex flex-col items-center justify-center gap-[1.6rem] flex-1 absolute left-[50%] translate-x-[-50%]">
                    <AnimatePresence mode="popLayout">
                        {/* {IS_ROUTE_POST_VIEW && (
                            <section className="flex flex-col gap-[0.8rem]">
                                <motion.section
                                    key={"post_title_view"}
                                    initial={{ opacity: 0, transform: "scale(0.8)" }}
                                    animate={{ opacity: 1, transform: "scale(1)" }}
                                    exit={{ opacity: 0, transform: "scale(0.8)" }}
                                    transition={springTransition}
                                    className="flex gap-[1.6rem] flex-1 justify-center"
                                >
                                    <h2 className="tablet:text-[2.8rem] mobile:text-[2.4rem] text-center leading-[1.5] font-bold text-white">{postTitle}</h2>
                                </motion.section>
                            </section>
                        )} */}

                        {IS_ROUTE_POST_EDIT && (
                            <section className="flex flex-col gap-[0.8rem]">
                                <motion.section
                                    key={"post_title_edit"}
                                    initial={{ opacity: 0, transform: "scale(0.8)" }}
                                    animate={{ opacity: 1, transform: "scale(1)" }}
                                    exit={{ opacity: 0, transform: "scale(0.8)" }}
                                    transition={springTransition}
                                    className="flex gap-[1.6rem] flex-1 justify-center"
                                >
                                    <h2 className="tablet:text-[2.8rem] mobile:text-[2.4rem] text-center leading-[1.5] font-bold text-white">{`${postTitle} | 수정중`}</h2>
                                </motion.section>
                            </section>
                        )}

                        {IS_ROUTE_POST_CREATE && (
                            <section className="flex flex-col gap-[0.8rem]">
                                <motion.section
                                    key={"post_title_create"}
                                    initial={{ opacity: 0, transform: "scale(0.8)" }}
                                    animate={{ opacity: 1, transform: "scale(1)" }}
                                    exit={{ opacity: 0, transform: "scale(0.8)" }}
                                    transition={springTransition}
                                    className="flex gap-[1.6rem] flex-1 justify-center"
                                >
                                    <h2 className="tablet:text-[2.8rem] mobile:text-[2.4rem] text-center leading-[1.5] font-bold text-white">생성 중</h2>
                                </motion.section>
                            </section>
                        )}
                    </AnimatePresence>

                    {/* <div className="w-[7.2rem] h-[0.8rem] p-[0.2rem] bg-[#ffffff40] backdrop-blur-sm rounded-full shadow-[var(--shadow-normal)]">
                        <div
                            ref={progressBarRef}
                            className="h-full w-0 rounded-full bg-white shadow-[var(--shadow-normal)] will-change-[width]"
                        />
                    </div> */}

                    {/* <div className={`absolute top-0 left-[50%] transform translate-x-[-50%] w-[calc(100%*2)] h-full bg-[linear-gradient(90deg,_transparent,_#000000ee,_transparent)] blur-lg z-[-1]`} /> */}
                </section>

                {IS_ROUTE_POST_EDIT || IS_ROUTE_POST_CREATE ? (
                    <section className="menu flex gap-[0.4rem] tablet:relative tablet:flex-row tablet:right-auto mobile:absolute mobile:flex-col mobile:right-0">
                        {IS_ROUTE_POST_CREATE ? (
                            <UI.Button
                                type="button"
                                disabled={isDraftPending || isSavePending}
                                onClick={() => saveDraft(rows)}
                                className="transition-colors flex flex-col items-end disabled:opacity-60"
                            >
                                <p className="bg-black text-white p-[2.0rem] text-[2.4rem] font-semibold tablet:block mobile:hidden">
                                    {isDraftPending ? "저장 중..." : "임시저장"}
                                </p>
                                <MaterialIcon name="save" size={24} className="bg-black text-white p-[2.0rem]" />
                            </UI.Button>
                        ) : null}
                        <PostSaveNavButton
                            isCreate={IS_ROUTE_POST_CREATE}
                            isPending={isSavePending || isDraftPending}
                            onSave={() => savePost(rows)}
                        />
                    </section>
                ) : null}
            </div>
            {showDraftModal && IS_ROUTE_POST_CREATE ? (
                <PostDraftLoadModal
                    onClose={() => setShowDraftModal(false)}
                    onLoad={handleLoadDraft}
                    onMarkdownClick={() => markdownInputRef.current?.click()}
                />
            ) : null}
        </nav>
    );
};

export default Navigation;
