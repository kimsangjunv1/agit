"use client";

import { NodeViewWrapper, type NodeViewProps, useEditorState } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { useEffect, useRef, useState } from "react";
import { startImageDrag } from "@/shared/ui/common/richText/extensions/imageDrag";
import { safeSetNodeSelection } from "@/shared/ui/common/richText/extensions/imageSelection";
import { getImageElementStyle, getImageFrameStyle, getImageWrapperStyle, normalizeImageAlign, normalizeImageWidth } from "@/shared/ui/common/richText/extensions/imageLayout";
import { TextInsertBars } from "@/shared/ui/common/richText/extensions/textInsertBar";

function clampWidthPercent(nextWidth: number, parentWidth: number) {
    if (parentWidth <= 0) {
        return 100;
    }

    const percent = Math.round((nextWidth / parentWidth) * 100);

    return Math.min(100, Math.max(20, percent));
}

export function ResizableImageNodeView({ node, updateAttributes, getPos, editor }: NodeViewProps) {
    const frameRef = useRef<HTMLDivElement>(null);
    const dragSessionRef = useRef<{ cleanup: () => void } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { isSelected, imageOnly, editingEmptyParagraph } = useEditorState({
        editor,
        selector: ({ editor: currentEditor }) => {
            const position = getPos();
            const { selection } = currentEditor.state;
            const parent = selection.$from.parent;

            return {
                isSelected: typeof position === "number" && selection instanceof NodeSelection && selection.from === position && selection.node.type.name === "image",
                imageOnly: currentEditor.state.doc.textContent.trim().length === 0,
                editingEmptyParagraph: currentEditor.isFocused && parent.isTextblock && parent.textContent.trim().length === 0,
            };
        },
    });
    const align = normalizeImageAlign(node.attrs.align);
    const width = normalizeImageWidth(node.attrs.imageWidth);

    function endDragState() {
        dragSessionRef.current?.cleanup();
        dragSessionRef.current = null;
        setIsDragging(false);
    }

    useEffect(() => {
        const root = editor.view.dom;
        root.toggleAttribute("data-image-only", imageOnly);
        root.toggleAttribute("data-image-gap-open", imageOnly && editingEmptyParagraph);

        return () => {
            if (editor.isDestroyed) {
                return;
            }

            if (editor.state.doc.textContent.trim().length > 0) {
                root.removeAttribute("data-image-only");
                root.removeAttribute("data-image-gap-open");
            }
        };
    }, [editor, editingEmptyParagraph, imageOnly]);

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
            style={{ ...getImageWrapperStyle(), ...(imageOnly ? { margin: 0 } : {}) }}
        >
            <TextInsertBars
                disabled={isDragging}
                editor={editor}
                getPos={getPos}
                label="이미지"
                nodeType="image"
            />

            <div
                className={`relative overflow-hidden ${isSelected ? "outline outline-2 outline-[#3b82f6]" : ""} ${isDragging ? "cursor-grabbing opacity-60" : "cursor-grab"}`}
                contentEditable={false}
                onPointerDown={startMove}
                ref={frameRef}
                style={getImageFrameStyle(width, align)}
            >
                <img
                    alt={String(node.attrs.alt ?? "")}
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
