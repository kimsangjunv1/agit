"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";

import { getSelectedImagePosition } from "@/shared/ui/common/richText/extensions/imageSelection";
import { preventEditorBlur, ToolbarDivider, ToolbarIconButton, useTipTapToolbarState } from "@/shared/ui/layout/tipTapToolbarShared";

type TipTapBubbleMenuProps = {
    editor: Editor;
};

const TipTapBubbleMenu = ({ editor }: TipTapBubbleMenuProps) => {
    const state = useTipTapToolbarState(editor);

    return (
        <BubbleMenu
            editor={editor}
            options={{
                placement: "top",
                offset: 8,
            }}
            shouldShow={({ editor: currentEditor, state: editorState }) => {
                if (getSelectedImagePosition(currentEditor) !== null) {
                    return false;
                }

                const { from, to } = editorState.selection;
                if (from === to) return false;
                return !currentEditor.isActive("codeBlock");
            }}
        >
            <div
                className="flex items-center gap-[0.4rem] p-[0.4rem] bg-white rounded-full shadow-[var(--shadow-normal)] border border-[var(--color-gray-200)]"
                onMouseDown={preventEditorBlur}
            >
                <ToolbarIconButton
                    label="굵게"
                    title="굵게"
                    compact
                    active={state.isBold}
                    disabled={!state.canBold}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <span className="font-bold">B</span>
                </ToolbarIconButton>
                <ToolbarIconButton
                    label="기울임"
                    title="기울임"
                    compact
                    active={state.isItalic}
                    disabled={!state.canItalic}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <span className="italic font-serif">I</span>
                </ToolbarIconButton>
                <ToolbarIconButton
                    label="밑줄"
                    title="밑줄"
                    compact
                    active={state.isUnderline}
                    disabled={!state.canUnderline}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <span className="underline">U</span>
                </ToolbarIconButton>
                <ToolbarIconButton
                    label="취소선"
                    title="취소선"
                    compact
                    active={state.isStrike}
                    disabled={!state.canStrike}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <span className="line-through">S</span>
                </ToolbarIconButton>

                <ToolbarDivider />

                <ToolbarIconButton
                    label="인라인 코드"
                    title="인라인 코드"
                    compact
                    active={state.isCode}
                    disabled={!state.canCode}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                >
                    <span className="font-mono text-[1.2rem]">{`</>`}</span>
                </ToolbarIconButton>
                <ToolbarIconButton
                    label="형광펜"
                    title="형광펜"
                    compact
                    active={state.isHighlight}
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                >
                    <span className="bg-[#fff59d] text-[var(--color-gray-1000)] px-[0.4rem] rounded-[0.4rem]">H</span>
                </ToolbarIconButton>
            </div>
        </BubbleMenu>
    );
};

export default TipTapBubbleMenu;
