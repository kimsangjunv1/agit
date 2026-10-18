"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";

import { applyImageAlign, getSelectedImagePosition } from "@/shared/ui/common/richText/extensions/imageSelection";
import { normalizeImageAlign, type ImageAlign } from "@/shared/ui/common/richText/extensions/imageLayout";
import { preventEditorBlur, ToolbarDivider, ToolbarIconButton } from "@/shared/ui/layout/tipTapToolbarShared";

type TipTapImageBubbleMenuProps = {
    editor: Editor;
};

const ALIGN_OPTIONS: { label: string; value: ImageAlign; symbol: string }[] = [
    { label: "왼쪽 정렬", value: "left", symbol: "←" },
    { label: "가운데 정렬", value: "center", symbol: "↔" },
    { label: "오른쪽 정렬", value: "right", symbol: "→" },
];

const TipTapImageBubbleMenu = ({ editor }: TipTapImageBubbleMenuProps) => {
    const imageState = useEditorState({
        editor,
        selector: ({ editor: currentEditor }) => {
            const position = getSelectedImagePosition(currentEditor);

            return {
                position,
                align: position !== null ? normalizeImageAlign(currentEditor?.state.doc.nodeAt(position)?.attrs.align) : ("left" as ImageAlign),
            };
        },
    });

    return (
        <BubbleMenu
            editor={editor}
            options={{
                placement: "top",
                offset: 8,
            }}
            shouldShow={({ editor: currentEditor }) => getSelectedImagePosition(currentEditor) !== null}
        >
            <div
                className="flex items-center gap-[0.4rem] p-[0.4rem] bg-white rounded-full shadow-[var(--shadow-normal)] border border-[var(--color-gray-200)]"
                onMouseDown={preventEditorBlur}
            >
                {ALIGN_OPTIONS.map((option) => (
                    <ToolbarIconButton
                        key={option.value}
                        label={option.label}
                        title={option.label}
                        compact
                        active={imageState.align === option.value}
                        onClick={() => {
                            if (imageState.position === null) {
                                return;
                            }

                            applyImageAlign(editor, imageState.position, option.value);
                        }}
                    >
                        <span>{option.symbol}</span>
                    </ToolbarIconButton>
                ))}

                <ToolbarDivider />

                <span className="px-[0.8rem] text-[1.2rem] text-[var(--color-gray-500)] whitespace-nowrap">드래그 이동 · 모서리 크기 조절</span>
            </div>
        </BubbleMenu>
    );
};

export default TipTapImageBubbleMenu;
