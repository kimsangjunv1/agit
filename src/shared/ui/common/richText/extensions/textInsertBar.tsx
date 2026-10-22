"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

type TextInsertTarget = {
    focusAt: number;
    createParagraph: boolean;
    position: number;
};

const isEmptyTextblock = (node: ProseMirrorNode | null | undefined) => Boolean(node?.isTextblock && node.textContent.trim().length === 0);

export function getTextInsertTarget(editor: Editor, position: number | undefined, side: "before" | "after", nodeType: string): TextInsertTarget | null {
    if (editor.isDestroyed || !editor.isEditable || typeof position !== "number" || position < 0 || position >= editor.state.doc.content.size) {
        return null;
    }

    const target = editor.state.doc.nodeAt(position);

    if (target?.type.name !== nodeType) {
        return null;
    }

    const insertPosition = side === "before" ? position : position + target.nodeSize;
    const resolved = editor.state.doc.resolve(insertPosition);
    const adjacent = side === "before" ? resolved.nodeBefore : resolved.nodeAfter;

    if (isEmptyTextblock(adjacent) && adjacent) {
        const focusAt = side === "before" ? insertPosition - adjacent.nodeSize + 1 : insertPosition + 1;

        return { position: insertPosition, focusAt, createParagraph: false };
    }

    if (adjacent?.isTextblock) {
        return null;
    }

    const index = resolved.index();

    if (!resolved.parent.canReplaceWith(index, index, editor.schema.nodes.paragraph)) {
        return null;
    }

    return { position: insertPosition, focusAt: insertPosition + 1, createParagraph: true };
}

export function insertTextBesideNode(editor: Editor, position: number | undefined, side: "before" | "after", nodeType: string) {
    const target = getTextInsertTarget(editor, position, side, nodeType);

    if (!target) {
        return;
    }

    const chain = editor.chain();

    if (target.createParagraph) {
        chain.insertContentAt(target.position, { type: "paragraph" }, { updateSelection: false });
    }

    chain.setTextSelection(target.focusAt).focus().run();
}

export function TextInsertBars({ editor, getPos, nodeType, label, disabled = false }: { editor: Editor; getPos: () => number | undefined; nodeType: string; label: string; disabled?: boolean }) {
    const { canInsertBefore, canInsertAfter } = useEditorState({
        editor,
        selector: ({ editor: currentEditor }) => {
            const position = getPos();

            return {
                canInsertBefore: getTextInsertTarget(currentEditor, position, "before", nodeType) !== null,
                canInsertAfter: getTextInsertTarget(currentEditor, position, "after", nodeType) !== null,
            };
        },
    });

    if (disabled) {
        return null;
    }

    return (["before", "after"] as const).map((side) =>
        (side === "before" ? canInsertBefore : canInsertAfter) ? (
            <button
                key={side}
                aria-label={`${label} ${side === "before" ? "위" : "아래"}에 텍스트 삽입`}
                className={`absolute left-0 z-10 flex h-[1.6rem] w-full cursor-text items-center opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none ${side === "before" ? "top-[-0.8rem]" : "bottom-[-0.8rem]"}`}
                contentEditable={false}
                onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                }}
                onClick={(event) => {
                    event.stopPropagation();
                    insertTextBesideNode(editor, getPos(), side, nodeType);
                }}
                type="button"
            >
                <span
                    aria-hidden="true"
                    className="h-[0.3rem] w-full rounded-full bg-[#3b82f6]"
                />
            </button>
        ) : null,
    );
}
