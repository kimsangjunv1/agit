"use client";

import { NodeViewWrapper, type Editor, type NodeViewProps, useEditorState } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { useEffect, useRef, useState } from "react";
import { startImageDrag } from "@/shared/ui/common/richText/extensions/imageDrag";
import { safeSetNodeSelection } from "@/shared/ui/common/richText/extensions/imageSelection";
import { getImageElementStyle, getImageFrameStyle, getImageWrapperStyle, normalizeImageAlign, normalizeImageWidth } from "@/shared/ui/common/richText/extensions/imageLayout";

function clampWidthPercent(nextWidth: number, parentWidth: number) {
    if (parentWidth <= 0) {
        return 100;
    }

    const percent = Math.round((nextWidth / parentWidth) * 100);

    return Math.min(100, Math.max(20, percent));
}

function getTextInsertPosition(editor: Editor, position: number | undefined, side: "before" | "after") {
    if (editor.isDestroyed || !editor.isEditable || typeof position !== "number" || position < 0 || position >= editor.state.doc.content.size) {
        return null;
    }

    const image = editor.state.doc.nodeAt(position);

    if (image?.type.name !== "image") {
        return null;
    }

    const insertPosition = side === "before" ? position : position + image.nodeSize;
    const resolved = editor.state.doc.resolve(insertPosition);
    const adjacent = side === "before" ? resolved.nodeBefore : resolved.nodeAfter;
    const index = resolved.index();

    if (adjacent?.isTextblock || !resolved.parent.canReplaceWith(index, index, editor.schema.nodes.paragraph)) {
        return null;
    }

    return insertPosition;
}

export function ResizableImageNodeView({ node, updateAttributes, getPos, editor }: NodeViewProps) {
    const frameRef = useRef<HTMLDivElement>(null);
    const dragSessionRef = useRef<{ cleanup: () => void } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { isSelected, canInsertBefore, canInsertAfter } = useEditorState({
        editor,
        selector: ({ editor: currentEditor }) => {
            const position = getPos();
            const { selection } = currentEditor.state;

            return {
                isSelected: typeof position === "number" && selection instanceof NodeSelection && selection.from === position && selection.node.type.name === "image",
                canInsertBefore: getTextInsertPosition(currentEditor, position, "before") !== null,
                canInsertAfter: getTextInsertPosition(currentEditor, position, "after") !== null,
            };
        },
    });
    const align = normalizeImageAlign(node.attrs.align);
    const width = normalizeImageWidth(node.attrs.imageWidth);

    function insertText(side: "before" | "after") {
        const position = getTextInsertPosition(editor, getPos(), side);

        if (position === null) {
            return;
        }

        editor.chain().insertContentAt(position, { type: "paragraph" }, { updateSelection: false }).setTextSelection(position + 1).focus().run();
    }

    function endDragState() {
        dragSessionRef.current?.cleanup();
        dragSessionRef.current = null;
        setIsDragging(false);
    }

    useEffect(() => {
        return () => {
            dragSessionRef.current?.cleanup();
            dragSessionRef.current = null;
        };
    }, []);

    useEffect(() => {
        function handleTransaction() {
            if (dragSessionRef.current) {
                endDragState();
            }
        }

        editor.on("transaction", handleTransaction);

        return () => {
            editor.off("transaction", handleTransaction);
        };
    }, [editor]);

    function startResize(event: React.PointerEvent<HTMLButtonElement>) {
        event.preventDefault();
        event.stopPropagation();

        const frame = frameRef.current;
        const editorElement = frame?.closest(".ProseMirror");

        if (!frame || !editorElement) {
            return;
        }

        const parentWidth = editorElement.clientWidth;
        const startWidth = frame.offsetWidth;
        const startX = event.clientX;

        function handlePointerMove(moveEvent: PointerEvent) {
            const deltaX = moveEvent.clientX - startX;
            const nextWidth = clampWidthPercent(startWidth + deltaX, parentWidth);

            updateAttributes({
                imageWidth: `${nextWidth}%`,
            });
        }

        function handlePointerUp() {
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
        }

        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
    }

    function startMove(event: React.PointerEvent<HTMLDivElement>) {
        if (event.button !== 0) {
            return;
        }

        if (isDragging) {
            endDragState();
            return;
        }

        const frame = frameRef.current;
        const position = getPos();

        if (!frame || typeof position !== "number") {
            return;
        }

        dragSessionRef.current?.cleanup();
        dragSessionRef.current = startImageDrag({
            captureElement: frame,
            editor,
            event,
            getFromPos: () => {
                const nextPosition = getPos();

                return typeof nextPosition === "number" ? nextPosition : null;
            },
            onComplete: () => {
                dragSessionRef.current = null;
                setIsDragging(false);
            },
            onDragStateChange: setIsDragging,
            onSelect: (position) => {
                safeSetNodeSelection(editor, position);
            },
        });
    }

    return (
        <NodeViewWrapper
            as="div"
            className="rich-text-image-node relative w-full"
            data-align={align}
            style={getImageWrapperStyle()}
        >
            {(["before", "after"] as const).map((side) =>
                !isDragging && (side === "before" ? canInsertBefore : canInsertAfter) ? (
                    <button
                        key={side}
                        aria-label={`이미지 ${side === "before" ? "위" : "아래"}에 텍스트 삽입`}
                        className={`absolute left-0 z-10 flex h-[1.6rem] w-full cursor-text items-center opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none ${side === "before" ? "top-[-0.8rem]" : "bottom-[-0.8rem]"}`}
                        contentEditable={false}
                        onPointerDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                        }}
                        onClick={(event) => {
                            event.stopPropagation();
                            insertText(side);
                        }}
                        type="button"
                    >
                        <span aria-hidden="true" className="h-[0.3rem] w-full rounded-full bg-[#3b82f6]" />
                    </button>
                ) : null,
            )}

            <div
                className={`relative overflow-hidden ${isSelected ? "outline outline-2 outline-[#3b82f6]" : ""} ${isDragging ? "cursor-grabbing opacity-60" : "cursor-grab"}`}
                // className={`relative overflow-hidden rounded-[2.4rem] shadow-[var(--shadow-normal)] ${selected ? "outline outline-2 outline-[#3b82f6]" : ""} ${isDragging ? "cursor-grabbing opacity-60" : "cursor-grab"}`}
                contentEditable={false}
                onPointerDown={startMove}
                ref={frameRef}
                style={getImageFrameStyle(width, align)}
            >
                <img
                    alt={String(node.attrs.alt ?? "")}
                    // className="rounded-[2.4rem]"
                    draggable={false}
                    src={String(node.attrs.src ?? "")}
                    style={getImageElementStyle()}
                />

                {isSelected ? (
                    <button
                        aria-label="이미지 크기 조절"
                        className="absolute bottom-[-0.8rem] right-[-0.8rem] h-[1.6rem] w-[1.6rem] cursor-se-resize border border-white bg-[#3b82f6]"
                        onPointerDown={startResize}
                        type="button"
                    />
                ) : null}
            </div>
        </NodeViewWrapper>
    );
}
