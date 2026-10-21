"use client";

import { motion, Reorder, useDragControls } from "motion/react";
import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import TipTap from "@/shared/ui/layout/Tiptap";
import TipTapToolbar from "@/shared/ui/layout/TipTapToolbar";
import UI from "@/shared/ui/common/UIComponent";
import IconComponent from "@/shared/ui/common/IconComponent";
import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";
import { blockContentToHtml } from "@/entities/post/lib/blockContent";
import { type BlockMode, isCodeBlock, isMainBlock, resolveBlockMode } from "@/entities/post/lib/blockMode";
import { getPostTocAnchorId } from "@/entities/post/lib/postToc";
import { confirmAction } from "@/shared/lib/confirmAction";

import { usePostDraftImageStore } from "@/shared/stores/usePostDraftImageStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { Row, useBlockStore } from "@/features/managePost/model/useEditorBlockStore";
import { normalizeBlocksForEditor } from "@/features/managePost/lib/normalizePostBlocks";
import {
    BLOCK_COLUMN_CLASS,
    BLOCK_MIN_HEIGHT_CLASS,
    BLOCK_ROW_CLASS,
    POST_BLOCK_CONTENT_CLASS,
    POST_BLOCK_HEADING_CLASS,
    POST_BLOCK_IMAGE_CLASS,
    POST_BLOCK_LIST_CLASS,
    POST_BLOCK_SUBTITLE_CLASS,
    POST_BLOCK_TITLE_CLASS,
    POST_CODE_BODY_CLASS,
} from "@/shared/lib/richText/styles";
import { detectCodeLanguage, extractCodeFromContent, getDefaultCodeFileBaseName, toCodeBlockHtml } from "@/shared/lib/codeHighlight";
import { formatCodeContent } from "@/shared/lib/formatCodeContent";
import CodeBlockPanel from "@/shared/ui/common/CodeBlockPanel";

import type { SectionContent } from "@/entities/post/model/post.type";

const REORDER_TRANSITION = {
    type: "spring" as const,
    stiffness: 500,
    damping: 42,
};

const GROUP_ACTION_BUTTON_CLASS = "flex h-[2.4rem] w-[3.6rem] items-center justify-center rounded-[1.2rem] text-[var(--color-gray-900)] transition-colors hover:bg-[var(--color-gray-100)]";

const BLOCK_MODE_OPTIONS = [
    { mode: "sub", label: "서브", icon: "notes" },
    { mode: "code", label: "코드", icon: "code" },
    { mode: "main", label: "메인", icon: "title" },
] as const;

const getRowKey = (row: Row) => row.map((b) => b.id).join("-");

const BlockEditableField = ({
    value,
    placeholder,
    className,
    as: Tag = "p",
    onChange,
}: {
    value: string;
    placeholder: string;
    className: string;
    as?: "p" | "h5";
    onChange: (value: string) => void;
}) => {
    const ref = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || document.activeElement === el) return;

        if ((el.textContent ?? "") !== value) {
            el.textContent = value;
        }
    }, [value]);

    return (
        <Tag
            ref={ref as never}
            contentEditable
            suppressContentEditableWarning
            data-placeholder={placeholder}
            className={`${className} outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--color-gray-400)] empty:before:pointer-events-none`}
            onClick={(event) => event.stopPropagation()}
            onInput={(event) => {
                onChange(event.currentTarget.textContent ?? "");
            }}
        />
    );
};

const SortableBlock = ({ contents }: { contents?: Row[] }) => {
    const { rows, setRows } = useBlockStore();

    useEffect(() => {
        if (contents && contents.length > 0) {
            setRows(normalizeBlocksForEditor(contents));
        }
    }, [contents, setRows]);

    return (
        <Reorder.Group
            axis="y"
            values={rows}
            onReorder={(newRows) => useBlockStore.getState().setRows(newRows)}
            as="section"
            className={POST_BLOCK_LIST_CLASS}
        >
            {rows.map((row, rowIndex) => (
                <Item
                    key={getRowKey(row)}
                    row={row}
                    rowIndex={rowIndex}
                />
            ))}
        </Reorder.Group>
    );
};

const Item = ({ row, rowIndex }: { row: Row; rowIndex: number }) => {
    const dragControls = useDragControls();

    const [isGrabbing, setIsGrabbing] = useState(false);

    const { setToast } = useToastStore();
    const { rows, addBlock, deleteRow, updateBlock, selectedPosition } = useBlockStore();
    const isSingleGroup = rows.length === 1;
    const activeBlockIndex = selectedPosition?.rowIndex === rowIndex && row[selectedPosition.blockIndex] ? selectedPosition.blockIndex : 0;
    const activeBlock = row[activeBlockIndex];
    const activeBlockMode = resolveBlockMode(activeBlock);

    const handleBlockModeChange = (mode: BlockMode) => {
        if (mode === activeBlockMode) return;

        const patch: Partial<SectionContent> = { blockMode: mode, type: 0 };

        if (mode === "code") {
            const { code } = extractCodeFromContent(blockContentToHtml(activeBlock.content));
            const language = detectCodeLanguage(code);
            patch.title = activeBlock.title?.trim() || getDefaultCodeFileBaseName(language);
            patch.subtitle = "";
            patch.content = toCodeBlockHtml(code, language);
        } else if (activeBlockMode === "code") {
            patch.title = "";
            patch.subtitle = "";
        }

        updateBlock(rowIndex, activeBlockIndex, patch);
    };

    return (
        <Reorder.Item
            value={row}
            layout
            transition={REORDER_TRANSITION}
            className="group/row relative flex flex-col gap-[0.8rem]"
            as="div"
            dragControls={dragControls}
            dragListener={false}
        >
            {/* <section className="mobile:hidden pc:flex absolute top-0 left-[-10%] items-center gap-[0.4rem] bg-[#00000090] rounded-full p-[0.4rem_0.8rem]">
                <MaterialIcon
                    name="deployed_code"
                    size={16}
                    className="invert"
                />
                <p className="text-[#ffffff] font-mono">group</p>
            </section> */}

            <motion.section
                layout="position"
                className="absolute top-0 right-0 tablet:right-[max(-4.8rem,calc((var(--size-tablet)-100svw)/2))] z-10 flex flex-col items-center gap-[1.2rem]"
            >
                <section className="shadow-[var(--shadow-normal)] bg-[var(--color-surface)] rounded-full py-[0.8rem]">
                    <UI.Button
                        onClick={() => addBlock(rowIndex, "down")}
                        className={GROUP_ACTION_BUTTON_CLASS}
                    >
                        <span className="sr-only">아래 그룹 추가</span>
                        <MaterialIcon
                            name="add_row_below"
                            size={20}
                        />
                    </UI.Button>

                    <UI.Button
                        onClick={() => {
                            if (row.length === 1) {
                                addBlock(rowIndex, "right");
                                return;
                            }

                            if (row.length === 2) {
                                const newRows = rows.map((e, idx) => (idx === rowIndex ? e.reverse() : e));
                                useBlockStore.getState().setRows(newRows);
                            }
                        }}
                        className={GROUP_ACTION_BUTTON_CLASS}
                    >
                        <span className="sr-only">{row.length === 1 ? "블록 추가" : "좌우 전환"}</span>
                        {row.length === 1 ? (
                            <svg aria-hidden="true" width="24" height="24" viewBox="0 -960 960 960" fill="currentColor">
                                <path d="M160-760v560h240v-560H160ZM80-120v-720h720v160h-80v-80H480v560h240v-80h80v160H80Zm400-360Zm-80 0h80-80Zm0 0Zm320 120v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z" />
                            </svg>
                        ) : (
                            <MaterialIcon
                                name="swap_horiz"
                                size={20}
                                className="mobile:rotate-90 pc:rotate-0"
                            />
                        )}
                    </UI.Button>

                    <section className="flex max-w-full flex-wrap items-center justify-center bg-[var(--color-background-light)] rounded-full">
                        {!isSingleGroup ? (
                            <UI.Button
                                onClick={() => {
                                    void confirmAction({
                                        title: "그룹을 삭제할까요?",
                                        description: `${rowIndex + 1}번째 그룹의 블록 ${row.length}개가 함께 삭제됩니다.`,
                                        confirmText: "삭제하기",
                                        onConfirm: () => {
                                            deleteRow(rowIndex);
                                            setToast({ msg: "그룹을 제거했어요", time: 2 });
                                        },
                                    });
                                }}
                                className={`${GROUP_ACTION_BUTTON_CLASS}`}
                            >
                                <span className="sr-only">그룹 삭제</span>
                                <svg aria-hidden="true" width="24" height="24" viewBox="0 -960 960 960" fill="currentColor">
                                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                                </svg>
                            </UI.Button>
                        ) : null}
                    </section>
                </section>

                <section
                    className={`flex justify-center items-center gap-[0.8rem] w-full shadow-[var(--shadow-normal)] h-[3.6rem] bg-[var(--color-surface)] rounded-full ${isGrabbing ? "cursor-grabbing" : "cursor-grab"}`}
                    onPointerDown={(e) => {
                        e.preventDefault();
                        setIsGrabbing(true);
                        dragControls.start(e);
                    }}
                    onPointerUp={() => setIsGrabbing(false)}
                >
                    <MaterialIcon
                        name="reorder"
                        size={16}
                        className="select-none"
                    />
                </section>

                {activeBlock.type === 0 ? (
                    <section
                        role="group"
                        aria-label="블록 형식"
                        className="flex flex-col shadow-[var(--shadow-normal)] bg-[var(--color-surface)] rounded-full py-[0.8rem]"
                    >
                        {BLOCK_MODE_OPTIONS.map(({ mode, label, icon }) => (
                            <motion.button
                                key={mode}
                                type="button"
                                title={label}
                                aria-label={`${label} 블록으로 전환`}
                                aria-pressed={activeBlockMode === mode}
                                onClick={() => handleBlockModeChange(mode)}
                                whileTap={{ scale: 0.95 }}
                                className={`${GROUP_ACTION_BUTTON_CLASS} aria-pressed:bg-[var(--color-surface-hover)] aria-pressed:text-[var(--color-interaction-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-interaction-hover)]`}
                            >
                                <MaterialIcon name={icon} size={20} />
                            </motion.button>
                        ))}
                    </section>
                ) : null}
            </motion.section>

            <section className={BLOCK_ROW_CLASS}>
                {row.map((block, blockIndex) => (
                    <motion.section
                        key={block.id}
                        layout="position"
                        className={`${BLOCK_COLUMN_CLASS} ${isCodeBlock(block) ? "" : BLOCK_MIN_HEIGHT_CLASS}`}
                    >
                        <Block
                            block={block}
                            rowIndex={rowIndex}
                            blockIndex={blockIndex}
                            last={row.length !== 1}
                            blockCount={row.length}
                        />
                    </motion.section>
                ))}
            </section>
        </Reorder.Item>
    );
};

const Block = ({ block, rowIndex, blockIndex, last, blockCount }: { block: SectionContent; rowIndex: number; blockIndex: number; last: boolean; blockCount: number }) => {
    const { updateBlock, deleteBlock, copyBlock, pasteBlock, selectBlock, unSelectBlock } = useBlockStore();
    const { setToast } = useToastStore();
    const addFromFile = usePostDraftImageStore((state) => state.addFromFile);

    const blockRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string>(block.imageUrl ?? "/");
    const [focusedEditor, setFocusedEditor] = useState<Editor | null>(null);
    const textContent = blockContentToHtml(block.content);

    const handleEditorFocus = useCallback((editor: Editor) => {
        setFocusedEditor(editor);
    }, []);

    const handleEditorBlur = useCallback(() => {
        requestAnimationFrame(() => {
            const activeElement = document.activeElement;

            if (blockRef.current?.contains(activeElement)) {
                return;
            }

            setFocusedEditor(null);
        });
    }, []);

    const codeBlockMode = isCodeBlock(block);
    const showHeadingFields = block.type === 0 && isMainBlock(block) && !codeBlockMode;

    const handleFormatCode = useCallback(async () => {
        const { code } = extractCodeFromContent(textContent);
        if (!code.trim()) {
            setToast({ msg: "정렬할 코드가 없어요", time: 2 });
            return;
        }

        const language = detectCodeLanguage(code);
        const formatted = await formatCodeContent(code, language);

        updateBlock(rowIndex, blockIndex, {
            content: toCodeBlockHtml(formatted, language),
        });
        setToast({ msg: "코드를 정렬했어요", time: 2 });
    }, [blockIndex, rowIndex, setToast, textContent, updateBlock]);

    useEffect(() => {
        if (codeBlockMode) {
            setFocusedEditor(null);
        }
    }, [codeBlockMode]);

    const columnClassName = "w-full min-w-0 flex flex-col h-full group/block";
    // const columnClassName = `w-full min-w-0 flex flex-col gap-[1.6rem] h-full group/block ${!codeBlockMode && block.type !== 0 ? "rounded-[2.4rem]" : ""} ${blockCount === 1 && !codeBlockMode && block.type !== 0 ? "tablet:col-span-2" : blockCount > 1 && !codeBlockMode && block.type !== 0 ? "tablet:min-h-[36.0rem]" : ""} ${codeBlockMode ? "rounded-[2.4rem] overflow-hidden" : ""}`;

    const handleImageFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setToast({ msg: "이미지 파일만 추가할 수 있어요", time: 2 });
            return;
        }

        const id = addFromFile(file);
        if (!id) return;

        const previewUrl = usePostDraftImageStore.getState().images.find((image) => image.id === id)?.previewUrl;

        if (previewUrl) {
            setCurrentImageUrl(previewUrl);
            updateBlock(rowIndex, blockIndex, { imageUrl: previewUrl });
        }
    };

    useEffect(() => {
        setCurrentImageUrl(block.imageUrl ?? "/");
    }, [block.imageUrl]);

    return (
        <div
            ref={blockRef}
            id={block.type === 0 ? getPostTocAnchorId(block.id) : undefined}
            tabIndex={0}
            className={`${columnClassName} relative ${block.type === 0 ? "scroll-mt-[12rem]" : ""}`}
            onClick={() => {
                selectBlock(rowIndex, blockIndex);
            }}
            onFocusCapture={() => selectBlock(rowIndex, blockIndex)}
            onKeyDown={(e: React.KeyboardEvent) => {
                const target = e.target as HTMLElement;

                if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                    return;
                }

                if (e.key === "Escape") {
                    e.preventDefault();
                    unSelectBlock();
                    setToast({ msg: "선택 해제 되었어요", time: 2 });
                }

                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
                    e.preventDefault();
                    copyBlock(rowIndex, blockIndex);
                    setToast({ msg: "복사가 완료됐어요!", time: 2 });
                }

                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
                    e.preventDefault();
                    pasteBlock();
                    setToast({ msg: "복사한 col을 붙여넣었어요", time: 2 });
                }
            }}
        >
            {last ? (
                <section
                    className="absolute bottom-[4px] right-[4px] z-10 flex items-center rounded-full overflow-hidden bg-[var(--color-surface)] opacity-30 pointer-events-none group-hover/block:opacity-100 group-hover/block:pointer-events-auto group-focus-within/block:opacity-100 group-focus-within/block:pointer-events-auto"
                    // className={`absolute top-[calc((2.8rem/1)*-1)] left-[50%] transform translate-x-[-50%] z-10 flex items-center rounded-full overflow-hidden p-[0.4rem] ${block.blockMode === "code" ? "bg-[#2d2d2d]" : "bg-white"}`}
                    onClick={(event) => event.stopPropagation()}
                >
                    {last ? (
                        <UI.Button
                            onClick={() => {
                                void confirmAction({
                                    title: "블록을 삭제할까요?",
                                    description: `${rowIndex + 1}번째 그룹의 ${blockIndex + 1}번째 블록을 삭제합니다.`,
                                    confirmText: "삭제하기",
                                    onConfirm: () => deleteBlock(rowIndex, blockIndex),
                                });
                            }}
                            className="cursor-pointer rounded-full p-[0.4rem]"
                        >
                            <IconComponent
                                type="outlined-cross"
                                alt="블록 지우기"
                                // className="invert brightness-0"
                            />
                        </UI.Button>
                    ) : null}
                </section>
            ) : null}

            <section className={`relative ${POST_BLOCK_CONTENT_CLASS} h-full`}>
                {block.type === 0 && !codeBlockMode ? (
                    <>
                        {showHeadingFields ? (
                            <section className={POST_BLOCK_HEADING_CLASS}>
                                <BlockEditableField
                                    as="p"
                                    value={block.subtitle}
                                    placeholder="부제목을 입력해주세요"
                                    className={POST_BLOCK_SUBTITLE_CLASS}
                                    onChange={(subtitle) => updateBlock(rowIndex, blockIndex, { subtitle })}
                                />
                                <BlockEditableField
                                    as="h5"
                                    value={block.title}
                                    placeholder="제목을 입력해주세요"
                                    className={POST_BLOCK_TITLE_CLASS}
                                    onChange={(title) => updateBlock(rowIndex, blockIndex, { title })}
                                />
                            </section>
                        ) : null}
                        <section className="w-full flex-1">
                            <TipTap.Normal
                                key={block.id}
                                content={textContent}
                                showToolbar={false}
                                onChange={(html) => updateBlock(rowIndex, blockIndex, { content: html })}
                                onEditorFocus={handleEditorFocus}
                                onEditorBlur={handleEditorBlur}
                            />
                        </section>
                    </>
                ) : null}

                {codeBlockMode ? (
                    <CodeBlockPanel
                        content={textContent}
                        fileName={block.title}
                        editableFileName
                        showFormat
                        onFormat={handleFormatCode}
                        onFileNameChange={(title) => updateBlock(rowIndex, blockIndex, { title })}
                        bodyClassName={POST_CODE_BODY_CLASS}
                    >
                        <TipTap.Code
                            key={`${block.id}-code`}
                            content={textContent}
                            onChange={(html) => updateBlock(rowIndex, blockIndex, { content: html })}
                        />
                    </CodeBlockPanel>
                ) : null}

                {block.type === 1 ? (
                    <div className="relative">
                        <img
                            src={block.imageUrl !== "" ? block.imageUrl : "https://dummyimage.com/200x200/ededed/000000&text=placeholder"}
                            alt=""
                            className={POST_BLOCK_IMAGE_CLASS}
                        />
                        <UI.Button
                            onClick={() => imageInputRef.current?.click()}
                            className="p-[1.2rem] bg-[white] hover:bg-[var(--color-brand-500)] transition-all backdrop-blur-sm rounded-[1.6rem] absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] shadow-[var(--shadow-normal)] font-semibold opacity-0 group-hover/block:opacity-100"
                        >
                            이미지 선택
                        </UI.Button>
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageFile(file);
                                e.target.value = "";
                            }}
                        />
                    </div>
                ) : null}
            </section>

            {focusedEditor && !codeBlockMode && !focusedEditor.isDestroyed ? (
                <div
                    className="pointer-events-auto absolute bottom-[0] left-[50%] transform translate-x-[-50%] mobile:w-[80%] pc:w-full"
                    // className="pointer-events-auto absolute bottom-[calc((2.8rem/1)*-1)] left-[50%] transform translate-x-[-50%] mobile:w-[80%] pc:w-[50%]"
                    onPointerDown={(event) => event.stopPropagation()}
                >
                    <TipTapToolbar editor={focusedEditor} />
                </div>
            ) : null}
        </div>
    );
};

export default SortableBlock;
