"use client";

import { motion, Reorder, useDragControls } from "motion/react";
import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import TipTap from "@/shared/ui/layout/Tiptap";
import TipTapToolbar from "@/shared/ui/layout/TipTapToolbar";
import UI from "@/shared/ui/common/UIComponent";
import IconComponent from "@/shared/ui/common/IconComponent";
import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";
import { blockContentToHtml } from "@/entities/post/lib/blockContent";
import { type BlockMode, getSectionEndRowIndexes, isCodeBlock, isMainBlock, resolveBlockMode } from "@/entities/post/lib/blockMode";
import { getPostTocAnchorId } from "@/entities/post/lib/postToc";
import { confirmAction } from "@/shared/lib/confirmAction";

import { usePostDraftImageStore } from "@/shared/stores/usePostDraftImageStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { Row, useBlockStore } from "@/features/managePost/model/useEditorBlockStore";
import { normalizeBlocksForEditor } from "@/features/managePost/lib/normalizePostBlocks";
import {
    BLOCK_COLUMN_CLASS,
    BLOCK_ROW_CLASS,
    POST_BLOCK_CONTENT_CLASS,
    POST_BLOCK_HEADING_CLASS,
    POST_BLOCK_IMAGE_CLASS,
    POST_BLOCK_LIST_CLASS,
    POST_BLOCK_SECTION_END_CLASS,
    POST_BLOCK_SUBTITLE_CLASS,
    POST_BLOCK_TITLE_CLASS,
    POST_CODE_BODY_CLASS,
} from "@/shared/lib/richText/styles";
import { detectCodeLanguage, extractCodeFromContent, getDefaultCodeFileBaseName, toCodeBlockHtml } from "@/shared/lib/codeHighlight";
import { formatCodeContent } from "@/shared/lib/formatCodeContent";
import CodeBlockPanel from "@/shared/ui/common/CodeBlockPanel";

import type { SectionContent } from "@/entities/post/model/post.type";

const blockKeepsEditorMinHeight = (block: SectionContent) => {
    if (isCodeBlock(block) || block.type === 1) return false;
    if (block.type !== 0 || typeof block.content !== "string") return true;

    const text = block.content
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

    return !(/<img\b/i.test(block.content) && text.length === 0);
};

const REORDER_TRANSITION = {
    type: "spring" as const,
    stiffness: 500,
    damping: 42,
};

const BLOCK_CORNER_CLUSTER_CLASS =
    "absolute bottom-[calc(100%+0.2cm)] right-0 z-20 flex items-center gap-[0.4rem] opacity-0 pointer-events-none transition-opacity group-hover/block:pointer-events-auto group-hover/block:opacity-100 before:absolute before:inset-x-0 before:top-full before:h-[0.2cm] before:content-['']";
const EDGE_ADD_BUTTON_CLASS =
    "absolute z-30 flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-gray-900)] shadow-[var(--shadow-normal)] opacity-0 pointer-events-none transition-opacity";
const BLOCK_EDGE_ADD_VISIBILITY_CLASS = "group-hover/block:pointer-events-auto group-hover/block:opacity-100";
const ROW_EDGE_ADD_VISIBILITY_CLASS = "group-hover/row:pointer-events-auto group-hover/row:opacity-100";
const BLOCK_MODE_PILL_BUTTON_CLASS =
    "flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full text-[var(--color-gray-900)] transition-colors hover:bg-[var(--color-gray-100)] aria-pressed:bg-[var(--color-surface-hover)] aria-pressed:text-[var(--color-interaction-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-interaction-hover)]";

const BLOCK_MODE_OPTIONS = [
    { mode: "sub", label: "서브", icon: "notes" },
    { mode: "code", label: "코드", icon: "code" },
    { mode: "main", label: "메인", icon: "title" },
] as const;

const dragChromeClass = (isDraggingRow: boolean, isOtherRowDragging: boolean, hoverClass: string) => {
    if (isOtherRowDragging) return "!pointer-events-none !opacity-0";
    if (isDraggingRow) return "!pointer-events-auto !opacity-100";
    return hoverClass;
};

const getRowKey = (row: Row) => row.map((block) => block.id).join("-");

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
    const [draggingRowKey, setDraggingRowKey] = useState<string | null>(null);

    useEffect(() => {
        if (contents && contents.length > 0) {
            setRows(normalizeBlocksForEditor(contents));
        }
    }, [contents, setRows]);

    useEffect(() => {
        if (!draggingRowKey) return;

        const endDrag = () => setDraggingRowKey(null);
        window.addEventListener("pointerup", endDrag);
        window.addEventListener("pointercancel", endDrag);

        return () => {
            window.removeEventListener("pointerup", endDrag);
            window.removeEventListener("pointercancel", endDrag);
        };
    }, [draggingRowKey]);

    const sectionEndRows = useMemo(() => getSectionEndRowIndexes(rows), [rows]);

    return (
        <Reorder.Group
            axis="y"
            values={rows}
            onReorder={(newRows) => useBlockStore.getState().setRows(newRows)}
            as="section"
            className={`${POST_BLOCK_LIST_CLASS} ${draggingRowKey ? "isolate" : ""}`}
        >
            {rows.map((row, rowIndex) => (
                <Item
                    key={getRowKey(row)}
                    row={row}
                    rowIndex={rowIndex}
                    isSectionEnd={sectionEndRows.has(rowIndex)}
                    draggingRowKey={draggingRowKey}
                    onRowDragStart={setDraggingRowKey}
                />
            ))}
        </Reorder.Group>
    );
};

const Item = ({ row, rowIndex, isSectionEnd, draggingRowKey, onRowDragStart }: { row: Row; rowIndex: number; isSectionEnd: boolean; draggingRowKey: string | null; onRowDragStart: (rowKey: string) => void }) => {
    const dragControls = useDragControls();
    const rowRef = useRef<HTMLDivElement>(null);
    const focusedBlockIndexRef = useRef<number | null>(null);
    const rowKey = getRowKey(row);
    const isDraggingRow = draggingRowKey === rowKey;
    const isOtherRowDragging = draggingRowKey !== null && !isDraggingRow;

    const [focusedEditor, setFocusedEditor] = useState<Editor | null>(null);

    const { rows, addBlock } = useBlockStore();

    const handleEditorFocus = useCallback((blockIndex: number, editor: Editor) => {
        focusedBlockIndexRef.current = blockIndex;
        setFocusedEditor(editor);
    }, []);

    const handleEditorBlur = useCallback((blockIndex: number) => {
        requestAnimationFrame(() => {
            if (focusedBlockIndexRef.current !== blockIndex) return;
            if (rowRef.current?.contains(document.activeElement)) return;

            focusedBlockIndexRef.current = null;
            setFocusedEditor(null);
        });
    }, []);

    return (
        <Reorder.Item
            ref={rowRef}
            value={row}
            layout
            transition={REORDER_TRANSITION}
            className={`group/row relative flex flex-col gap-[0.8rem] ${isOtherRowDragging ? "opacity-70" : ""} ${isSectionEnd ? POST_BLOCK_SECTION_END_CLASS : ""}`}
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

            <motion.button
                type="button"
                onClick={() => addBlock(rowIndex, "up")}
                whileTap={{ scale: 0.95 }}
                className={`${EDGE_ADD_BUTTON_CLASS} ${dragChromeClass(false, isOtherRowDragging, ROW_EDGE_ADD_VISIBILITY_CLASS)} left-1/2 top-[calc(-3.2rem-0.2cm)] -translate-x-1/2 after:absolute after:inset-x-0 after:top-full after:h-[0.2cm] after:content-['']`}
            >
                <span className="sr-only">위에 행 추가</span>
                <MaterialIcon
                    name="add"
                    size={20}
                />
            </motion.button>
            <motion.button
                type="button"
                onClick={() => addBlock(rowIndex, "down")}
                whileTap={{ scale: 0.95 }}
                className={`${EDGE_ADD_BUTTON_CLASS} ${dragChromeClass(false, isOtherRowDragging, ROW_EDGE_ADD_VISIBILITY_CLASS)} bottom-[calc(-3.2rem-0.2cm)] left-1/2 -translate-x-1/2 before:absolute before:inset-x-0 before:bottom-full before:h-[0.2cm] before:content-['']`}
            >
                <span className="sr-only">아래에 행 추가</span>
                <MaterialIcon
                    name="add"
                    size={20}
                />
            </motion.button>

            <section className={`${BLOCK_ROW_CLASS} relative items-start`}>
                {row.length === 2 ? (
                    <motion.button
                        type="button"
                        onClick={() => {
                            const newRows = rows.map((entry, idx) => (idx === rowIndex ? [...entry].reverse() : entry));
                            useBlockStore.getState().setRows(newRows);
                        }}
                        whileTap={{ scale: 0.95 }}
                        className={`${EDGE_ADD_BUTTON_CLASS} ${dragChromeClass(false, isOtherRowDragging, ROW_EDGE_ADD_VISIBILITY_CLASS)} left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`}
                    >
                        <span className="sr-only">좌우 전환</span>
                        <MaterialIcon
                            name="swap_horiz"
                            size={20}
                            className="rotate-90 tablet:rotate-0"
                        />
                    </motion.button>
                ) : null}
                {row.map((block, blockIndex) => (
                    <motion.section
                        key={block.id}
                        layout="position"
                        className={`${BLOCK_COLUMN_CLASS} relative items-start overflow-visible focus-within:border-[#ff4321] ${isOtherRowDragging ? "!z-0" : "z-20"} ${blockKeepsEditorMinHeight(block) ? "" : "!min-h-0 h-auto"}`}
                    >
                        <Block
                            block={block}
                            rowIndex={rowIndex}
                            blockIndex={blockIndex}
                            blockCount={row.length}
                            isGrabbing={isDraggingRow}
                            suppressHoverChrome={isOtherRowDragging}
                            onDragHandlePointerDown={(event) => {
                                event.preventDefault();
                                onRowDragStart(rowKey);
                                dragControls.start(event);
                            }}
                            onEditorFocus={(editor) => handleEditorFocus(blockIndex, editor)}
                            onEditorBlur={() => handleEditorBlur(blockIndex)}
                        />
                    </motion.section>
                ))}
            </section>

            {focusedEditor && !focusedEditor.isDestroyed ? (
                <div
                    className={`pointer-events-none absolute top-[calc(100%+0.2cm)] left-1/2 z-30 w-full -translate-x-1/2 opacity-0 transition-opacity before:absolute before:inset-x-0 before:bottom-full before:h-[0.2cm] before:content-[''] ${dragChromeClass(false, isOtherRowDragging, "group-hover/row:pointer-events-auto group-hover/row:opacity-100")}`}
                    onPointerDown={(event) => event.stopPropagation()}
                >
                    <TipTapToolbar editor={focusedEditor} />
                </div>
            ) : null}
        </Reorder.Item>
    );
};

const Block = ({
    block,
    rowIndex,
    blockIndex,
    blockCount,
    isGrabbing,
    suppressHoverChrome,
    onDragHandlePointerDown,
    onEditorFocus,
    onEditorBlur,
}: {
    block: SectionContent;
    rowIndex: number;
    blockIndex: number;
    blockCount: number;
    isGrabbing: boolean;
    suppressHoverChrome: boolean;
    onDragHandlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onEditorFocus: (editor: Editor) => void;
    onEditorBlur: () => void;
}) => {
    const { rows, addBlock, updateBlock, deleteBlock, deleteRow, copyBlock, pasteBlock, selectBlock, unSelectBlock } = useBlockStore();
    const { setToast } = useToastStore();
    const addFromFile = usePostDraftImageStore((state) => state.addFromFile);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string>(block.imageUrl ?? "/");
    const textContent = blockContentToHtml(block.content);
    const codeBlockMode = isCodeBlock(block);
    const blockMode = resolveBlockMode(block);
    const showHeadingFields = block.type === 0 && isMainBlock(block) && !codeBlockMode;
    const showModePill = block.type === 0;
    const removeMode = blockCount > 1 ? "block" : rows.length > 1 ? "row" : null;

    const handleBlockModeChange = (mode: BlockMode) => {
        if (mode === blockMode) return;

        const patch: Partial<SectionContent> = { blockMode: mode, type: 0 };

        if (mode === "code") {
            const { code } = extractCodeFromContent(textContent);
            const language = detectCodeLanguage(code);
            patch.title = block.title?.trim() || getDefaultCodeFileBaseName(language);
            patch.subtitle = "";
            patch.content = toCodeBlockHtml(code, language);
        } else if (blockMode === "code") {
            patch.title = "";
            patch.subtitle = "";
        }

        updateBlock(rowIndex, blockIndex, patch);
    };

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

    const keepMinHeight = blockKeepsEditorMinHeight(block);
    const columnClassName = `w-full min-w-0 flex flex-col group/block ${keepMinHeight ? "h-full" : "h-auto"}`;
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
            <div
                className={`${BLOCK_CORNER_CLUSTER_CLASS} ${dragChromeClass(isGrabbing, suppressHoverChrome, "")}`}
                onClick={(event) => event.stopPropagation()}
            >
                <div
                    role="button"
                    aria-label="행 이동"
                    className={`flex h-[3.2rem] w-[3.2rem] shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-normal)] ${isGrabbing ? "cursor-grabbing" : "cursor-grab"}`}
                    onPointerDown={(event) => {
                        event.stopPropagation();
                        onDragHandlePointerDown(event);
                    }}
                >
                    <MaterialIcon
                        name="reorder"
                        size={16}
                        className="select-none"
                    />
                </div>
                {showModePill ? (
                        <section
                            role="group"
                            aria-label="블록 형식"
                            className="flex h-[3.2rem] items-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-normal)]"
                        >
                            {BLOCK_MODE_OPTIONS.map(({ mode, label, icon }) => (
                                <motion.button
                                    key={mode}
                                    type="button"
                                    title={label}
                                    aria-label={`${label} 블록으로 전환`}
                                    aria-pressed={blockMode === mode}
                                    onClick={() => handleBlockModeChange(mode)}
                                    whileTap={{ scale: 0.95 }}
                                    className={BLOCK_MODE_PILL_BUTTON_CLASS}
                                >
                                    <MaterialIcon
                                        name={icon}
                                        size={20}
                                    />
                                </motion.button>
                            ))}
                        </section>
                    ) : null}
                    {removeMode ? (
                        <UI.Button
                            onClick={() => {
                                if (removeMode === "row") {
                                    void confirmAction({
                                        title: "행을 삭제할까요?",
                                        description: `${rowIndex + 1}번째 행을 삭제합니다.`,
                                        confirmText: "삭제하기",
                                        onConfirm: () => {
                                            deleteRow(rowIndex);
                                            setToast({ msg: "행을 제거했어요", time: 2 });
                                        },
                                    });
                                    return;
                                }

                                void confirmAction({
                                    title: "블록을 삭제할까요?",
                                    description: `${rowIndex + 1}번째 그룹의 ${blockIndex + 1}번째 블록을 삭제합니다.`,
                                    confirmText: "삭제하기",
                                    onConfirm: () => deleteBlock(rowIndex, blockIndex),
                                });
                            }}
                            className="flex h-[3.2rem] w-[3.2rem] cursor-pointer items-center justify-center rounded-full bg-[var(--color-surface)] p-0 shadow-[var(--shadow-normal)]"
                        >
                            <IconComponent
                                type="outlined-cross"
                                alt={removeMode === "row" ? "행 지우기" : "블록 지우기"}
                            />
                        </UI.Button>
                    ) : null}
            </div>

            {blockCount === 1 ? (
                <>
                    <motion.button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            addBlock(rowIndex, "left");
                        }}
                        whileTap={{ scale: 0.95 }}
                        className={`${EDGE_ADD_BUTTON_CLASS} ${dragChromeClass(isGrabbing, suppressHoverChrome, BLOCK_EDGE_ADD_VISIBILITY_CLASS)} left-[calc(-3.2rem-0.2cm)] top-1/2 -translate-y-1/2 after:absolute after:inset-y-0 after:left-full after:w-[0.2cm] after:content-['']`}
                    >
                        <span className="sr-only">왼쪽에 블록 추가</span>
                        <MaterialIcon
                            name="add"
                            size={20}
                        />
                    </motion.button>
                    <motion.button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            addBlock(rowIndex, "right");
                        }}
                        whileTap={{ scale: 0.95 }}
                        className={`${EDGE_ADD_BUTTON_CLASS} ${dragChromeClass(isGrabbing, suppressHoverChrome, BLOCK_EDGE_ADD_VISIBILITY_CLASS)} right-[calc(-3.2rem-0.2cm)] top-1/2 -translate-y-1/2 before:absolute before:inset-y-0 before:right-full before:w-[0.2cm] before:content-['']`}
                    >
                        <span className="sr-only">오른쪽에 블록 추가</span>
                        <MaterialIcon
                            name="add"
                            size={20}
                        />
                    </motion.button>
                </>
            ) : null}

            <section className={`relative ${POST_BLOCK_CONTENT_CLASS} ${keepMinHeight ? "h-full" : "h-auto"}`}>
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
                        <section className={`w-full ${keepMinHeight ? "flex-1" : ""}`}>
                            <TipTap.Normal
                                key={block.id}
                                content={textContent}
                                showToolbar={false}
                                onChange={(html) => updateBlock(rowIndex, blockIndex, { content: html })}
                                onEditorFocus={onEditorFocus}
                                onEditorBlur={onEditorBlur}
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
        </div>
    );
};

export default SortableBlock;
