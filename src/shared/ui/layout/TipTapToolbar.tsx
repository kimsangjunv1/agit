"use client";

import { useRef } from "react";
import type { Editor } from "@tiptap/react";

import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";
import {
    applyFontSize,
    applyHeading,
    applyLineHeight,
    DEFAULT_FONT_SIZE,
    DEFAULT_LINE_HEIGHT,
    FONT_SIZES,
    getActiveHeading,
    LINE_HEIGHTS,
    ToolbarDivider,
    ToolbarIconButton,
    ToolbarSelect,
    useTipTapToolbarState,
    type HeadingValue,
} from "@/shared/ui/layout/tipTapToolbarShared";
import { usePostDraftImageStore } from "@/shared/stores/usePostDraftImageStore";

type TipTapToolbarProps = {
    editor: Editor;
};

const TOOLBAR_VARIANT = "default" as const;

const HEADING_OPTIONS = [
    { label: "본문", value: "paragraph" },
    { label: "H1", value: "h1" },
    { label: "H2", value: "h2" },
    { label: "H3", value: "h3" },
] as const;

const TipTapToolbar = ({ editor }: TipTapToolbarProps) => {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const addFromFile = usePostDraftImageStore((state) => state.addFromFile);
    const state = useTipTapToolbarState(editor);
    const activeHeading = getActiveHeading(state);

    const handleImageInsert = (file: File) => {
        const id = addFromFile(file);
        if (!id) return;

        const previewUrl = usePostDraftImageStore.getState().images.find((image) => image.id === id)?.previewUrl;

        if (previewUrl) {
            editor.chain().focus().setImage({ src: previewUrl, alt: file.name }).updateAttributes("image", { align: "left", imageWidth: "100%" }).run();
        }
    };

    return (
        // <div className="relative w-full mobile:max-w-[100%] pc:max-w-[50%] rounded-[1.6rem] bg-white shadow-[var(--shadow-normal)]">
        <div className="relative w-full bg-white border border-[#00000020]">
            <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <section className="flex min-w-min flex-nowrap items-center gap-[0.4rem] p-[0.4rem]">
                    <ToolbarIconButton
                        label="굵게"
                        title="굵게"
                        variant={TOOLBAR_VARIANT}
                        active={state.isBold}
                        disabled={!state.canBold}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        <MaterialIcon name="format_bold" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="기울임"
                        title="기울임"
                        variant={TOOLBAR_VARIANT}
                        active={state.isItalic}
                        disabled={!state.canItalic}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <MaterialIcon name="format_italic" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="밑줄"
                        title="밑줄"
                        variant={TOOLBAR_VARIANT}
                        active={state.isUnderline}
                        disabled={!state.canUnderline}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                    >
                        <MaterialIcon name="format_underlined" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="취소선"
                        title="취소선"
                        variant={TOOLBAR_VARIANT}
                        active={state.isStrike}
                        disabled={!state.canStrike}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                    >
                        <MaterialIcon name="strikethrough_s" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="인라인 코드"
                        title="인라인 코드"
                        variant={TOOLBAR_VARIANT}
                        active={state.isCode}
                        disabled={!state.canCode}
                        onClick={() => editor.chain().focus().toggleCode().run()}
                    >
                        <MaterialIcon name="code" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="형광펜"
                        title="형광펜"
                        variant={TOOLBAR_VARIANT}
                        active={state.isHighlight}
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                    >
                        <MaterialIcon name="highlight" />
                    </ToolbarIconButton>

                    <ToolbarDivider variant={TOOLBAR_VARIANT} />

                    <ToolbarSelect
                        label="제목 스타일"
                        variant={TOOLBAR_VARIANT}
                        value={activeHeading}
                        options={HEADING_OPTIONS.map((option) => ({
                            label: option.label,
                            value: option.value,
                        }))}
                        onChange={(value) => applyHeading(editor, value as HeadingValue)}
                    />

                    <ToolbarDivider variant={TOOLBAR_VARIANT} />

                    <ToolbarIconButton
                        label="글머리 목록"
                        title="글머리 목록"
                        variant={TOOLBAR_VARIANT}
                        active={state.isBulletList}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <MaterialIcon name="format_list_bulleted" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="번호 목록"
                        title="번호 목록"
                        variant={TOOLBAR_VARIANT}
                        active={state.isOrderedList}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <MaterialIcon name="format_list_numbered" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="코드 블록"
                        title="코드 블록"
                        variant={TOOLBAR_VARIANT}
                        active={state.isCodeBlock}
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    >
                        <MaterialIcon name="code_blocks" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="코드 스니펫"
                        title="코드 스니펫"
                        variant={TOOLBAR_VARIANT}
                        active={state.isSnippetCodeBlock}
                        onClick={() => editor.chain().focus().insertSnippetCodeBlock().run()}
                    >
                        <MaterialIcon name="terminal" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="인용문"
                        title="인용문"
                        variant={TOOLBAR_VARIANT}
                        active={state.isBlockquote}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                        <MaterialIcon name="format_quote" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="이미지"
                        title="이미지 삽입"
                        variant={TOOLBAR_VARIANT}
                        onClick={() => imageInputRef.current?.click()}
                    >
                        <MaterialIcon name="image" />
                    </ToolbarIconButton>

                    <ToolbarDivider variant={TOOLBAR_VARIANT} />

                    <ToolbarIconButton
                        label="왼쪽 정렬"
                        title="왼쪽 정렬"
                        variant={TOOLBAR_VARIANT}
                        active={state.isAlignLeft}
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    >
                        <MaterialIcon name="format_align_left" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="가운데 정렬"
                        title="가운데 정렬"
                        variant={TOOLBAR_VARIANT}
                        active={state.isAlignCenter}
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    >
                        <MaterialIcon name="format_align_center" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="오른쪽 정렬"
                        title="오른쪽 정렬"
                        variant={TOOLBAR_VARIANT}
                        active={state.isAlignRight}
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    >
                        <MaterialIcon name="format_align_right" />
                    </ToolbarIconButton>

                    <ToolbarDivider variant={TOOLBAR_VARIANT} />

                    <ToolbarSelect
                        label="글자 크기"
                        variant={TOOLBAR_VARIANT}
                        value={FONT_SIZES.includes(state.activeFontSize as (typeof FONT_SIZES)[number]) ? state.activeFontSize : DEFAULT_FONT_SIZE}
                        options={FONT_SIZES.map((size) => ({
                            label: size,
                            value: size,
                        }))}
                        onChange={(value) => applyFontSize(editor, value)}
                    />
                    <ToolbarSelect
                        label="줄간격"
                        variant={TOOLBAR_VARIANT}
                        value={LINE_HEIGHTS.includes(state.activeLineHeight as (typeof LINE_HEIGHTS)[number]) ? state.activeLineHeight : DEFAULT_LINE_HEIGHT}
                        options={LINE_HEIGHTS.map((lh) => ({
                            label: lh,
                            value: lh,
                        }))}
                        onChange={(value) => applyLineHeight(editor, value)}
                    />

                    <ToolbarDivider variant={TOOLBAR_VARIANT} />

                    <ToolbarIconButton
                        label="실행 취소"
                        title="실행 취소"
                        variant={TOOLBAR_VARIANT}
                        disabled={!state.canUndo}
                        onClick={() => editor.chain().focus().undo().run()}
                    >
                        <MaterialIcon name="undo" />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="다시 실행"
                        title="다시 실행"
                        variant={TOOLBAR_VARIANT}
                        disabled={!state.canRedo}
                        onClick={() => editor.chain().focus().redo().run()}
                    >
                        <MaterialIcon name="redo" />
                    </ToolbarIconButton>
                </section>
            </div>

            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageInsert(file);
                    e.target.value = "";
                }}
            />
        </div>
    );
};

export default TipTapToolbar;
