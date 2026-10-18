import type { Editor } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";

const DRAG_THRESHOLD_PX = 6;

type DragSession = {
    cleanup: () => void;
};

function getBlockStartPosition(editor: Editor, blockIndex: number) {
    let position = 0;

    for (let index = 0; index < blockIndex; index += 1) {
        position += editor.state.doc.child(index).nodeSize;
    }

    return position;
}

function getTopLevelDropPosition(editor: Editor, clientX: number, clientY: number) {
    const coordsResult = editor.view.posAtCoords({ left: clientX, top: clientY });

    if (!coordsResult) {
        return null;
    }

    const resolved = editor.state.doc.resolve(Math.min(coordsResult.pos, editor.state.doc.content.size));
    const blockIndex = Math.min(resolved.index(0), editor.state.doc.childCount - 1);

    if (blockIndex < 0) {
        return null;
    }

    const blockNode = editor.state.doc.child(blockIndex);
    const blockPos = getBlockStartPosition(editor, blockIndex);
    const domNode = editor.view.nodeDOM(blockPos);

    if (!(domNode instanceof HTMLElement)) {
        return blockPos;
    }

    const rect = domNode.getBoundingClientRect();
    const insertAfter = clientY >= rect.top + rect.height / 2;

    return insertAfter ? blockPos + blockNode.nodeSize : blockPos;
}

export function normalizeInsertPosition(editor: Editor, targetPos: number) {
    const maxPos = editor.state.doc.content.size;

    return Math.max(0, Math.min(targetPos, maxPos));
}

export function canMoveImageTo(editor: Editor, fromPos: number, nodeSize: number, targetPos: number) {
    const normalizedTarget = normalizeInsertPosition(editor, targetPos);
    const dragEnd = fromPos + nodeSize;

    if (normalizedTarget >= fromPos && normalizedTarget <= dragEnd) {
        return false;
    }

    let insertPos = normalizedTarget;

    if (normalizedTarget > fromPos) {
        insertPos = normalizedTarget - nodeSize;
    }

    return insertPos !== fromPos;
}

export function moveImageNode(editor: Editor, fromPos: number, targetPos: number) {
    const node = editor.state.doc.nodeAt(fromPos);

    if (!node || node.type.name !== "image") {
        return null;
    }

    const nodeSize = node.nodeSize;
    const normalizedTarget = normalizeInsertPosition(editor, targetPos);

    if (!canMoveImageTo(editor, fromPos, nodeSize, normalizedTarget)) {
        return null;
    }

    const transaction = editor.state.tr.delete(fromPos, fromPos + nodeSize);
    const mappedInsertPos = transaction.mapping.map(normalizedTarget);

    transaction.insert(mappedInsertPos, node);
    transaction.setSelection(NodeSelection.create(transaction.doc, mappedInsertPos));
    editor.view.dispatch(transaction.scrollIntoView());

    return mappedInsertPos;
}

function createDropIndicator(editor: Editor) {
    const editorElement = editor.view.dom;
    const indicator = document.createElement("div");
    indicator.className = "pointer-events-none absolute left-0 z-20 h-[0.4rem] bg-[#3b82f6]";
    indicator.style.width = `${editorElement.clientWidth}px`;
    editorElement.parentElement?.appendChild(indicator);

    return indicator;
}

function updateDropIndicator(editor: Editor, indicator: HTMLElement, targetPos: number | null) {
    if (targetPos === null) {
        indicator.style.display = "none";
        return;
    }

    const coords = editor.view.coordsAtPos(targetPos);
    const editorRect = editor.view.dom.getBoundingClientRect();
    const parentElement = indicator.offsetParent instanceof HTMLElement ? indicator.offsetParent : editor.view.dom.parentElement;

    if (!parentElement) {
        indicator.style.display = "none";
        return;
    }

    const parentRect = parentElement.getBoundingClientRect();

    indicator.style.display = "block";
    indicator.style.top = `${coords.top - parentRect.top + parentElement.scrollTop}px`;
    indicator.style.left = `${editorRect.left - parentRect.left}px`;
    indicator.style.width = `${editorRect.width}px`;
}

export function startImageDrag({
    editor,
    event,
    getFromPos,
    captureElement,
    onDragStateChange,
    onComplete,
    onSelect,
}: {
    editor: Editor;
    event: React.PointerEvent;
    getFromPos: () => number | null;
    captureElement: HTMLElement;
    onDragStateChange?: (isDragging: boolean) => void;
    onComplete?: () => void;
    onSelect?: (position: number) => void;
}): DragSession {
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    let isDragging = false;
    let isFinished = false;
    let dropIndicator: HTMLElement | null = null;
    let latestTargetPos: number | null = null;

    function resetDragVisualState() {
        onDragStateChange?.(false);
    }

    function cleanup() {
        if (isFinished) {
            return;
        }

        isFinished = true;
        dropIndicator?.remove();
        dropIndicator = null;
        resetDragVisualState();
        onComplete?.();

        try {
            if (captureElement.hasPointerCapture(pointerId)) {
                captureElement.releasePointerCapture(pointerId);
            }
        } catch {
            // DOM이 교체된 뒤에는 pointer capture 해제가 실패할 수 있다.
        }

        captureElement.removeEventListener("lostpointercapture", handlePointerCancel);
        document.removeEventListener("pointermove", handlePointerMove, true);
        document.removeEventListener("pointerup", handlePointerUp, true);
        document.removeEventListener("pointercancel", handlePointerCancel, true);
        window.removeEventListener("blur", handlePointerCancel);
    }

    function finishDrag(shouldMove: boolean) {
        if (isFinished) {
            return;
        }

        resetDragVisualState();

        const fromPos = getFromPos();

        if (shouldMove && isDragging && latestTargetPos !== null && typeof fromPos === "number") {
            moveImageNode(editor, fromPos, latestTargetPos);
        } else if (!isDragging && typeof fromPos === "number") {
            onSelect?.(fromPos);
        }

        cleanup();
    }

    function handlePointerMove(moveEvent: PointerEvent) {
        if (isFinished || moveEvent.pointerId !== pointerId) {
            return;
        }

        if (!isDragging) {
            const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);

            if (distance < DRAG_THRESHOLD_PX) {
                return;
            }

            isDragging = true;
            moveEvent.preventDefault();
            captureElement.setPointerCapture(pointerId);
            captureElement.addEventListener("lostpointercapture", handlePointerCancel);
            dropIndicator = createDropIndicator(editor);
            onDragStateChange?.(true);
        }

        const fromPos = getFromPos();
        const nodeSize = typeof fromPos === "number" ? (editor.state.doc.nodeAt(fromPos)?.nodeSize ?? 0) : 0;
        latestTargetPos = getTopLevelDropPosition(editor, moveEvent.clientX, moveEvent.clientY);

        if (typeof fromPos !== "number" || nodeSize < 1 || latestTargetPos === null || !canMoveImageTo(editor, fromPos, nodeSize, latestTargetPos)) {
            latestTargetPos = null;
        }

        if (dropIndicator) {
            updateDropIndicator(editor, dropIndicator, latestTargetPos);
        }
    }

    function handlePointerUp(moveEvent: PointerEvent) {
        if (moveEvent.pointerId !== pointerId) {
            return;
        }

        finishDrag(true);
    }

    function handlePointerCancel() {
        finishDrag(false);
    }

    document.addEventListener("pointermove", handlePointerMove, true);
    document.addEventListener("pointerup", handlePointerUp, true);
    document.addEventListener("pointercancel", handlePointerCancel, true);
    window.addEventListener("blur", handlePointerCancel);

    return { cleanup };
}
