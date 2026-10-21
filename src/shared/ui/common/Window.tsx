"use client";

import { AnimatePresence, motion, useDragControls, useMotionValue, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";
import { type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject, useEffect, useRef, useState } from "react";

const FADE_EASE = [0.4, 0, 0.2, 1] as const;
const EDGE_INSET_REM = 2;
const MIN_WINDOW_SIZE = 160;

let nextLayer = 1_500_000;

type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type WindowBox = {
    left: number;
    top: number;
    width: number;
    height: number;
};

type ContentFrame = {
    aspect: number;
};

type WindowProps = {
    children: ReactNode;
    openOnContentClick?: boolean;
    className?: string;
};

const RESIZE_HANDLES: { edge: ResizeEdge; className: string }[] = [
    { edge: "n", className: "top-0 right-[1.2rem] left-[1.2rem] z-20 h-[0.8rem] cursor-ns-resize" },
    { edge: "s", className: "right-[1.2rem] bottom-0 left-[1.2rem] z-20 h-[0.8rem] cursor-ns-resize" },
    { edge: "e", className: "top-[1.2rem] right-0 bottom-[1.2rem] z-20 w-[0.8rem] cursor-ew-resize" },
    { edge: "w", className: "top-[1.2rem] bottom-[1.2rem] left-0 z-20 w-[0.8rem] cursor-ew-resize" },
    { edge: "nw", className: "top-0 left-0 z-30 size-[1.2rem] cursor-nwse-resize" },
    { edge: "ne", className: "top-0 right-0 z-30 size-[1.2rem] cursor-nesw-resize" },
    { edge: "sw", className: "bottom-0 left-0 z-30 size-[1.2rem] cursor-nesw-resize" },
    { edge: "se", className: "right-0 bottom-0 z-30 size-[1.2rem] cursor-nwse-resize" },
];

const readRemSize = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;

const readInset = () => readRemSize() * EDGE_INSET_REM;

const readTabletWidth = () => {
    const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--size-tablet"));
    return Number.isFinite(value) && value > 0 ? value : 768;
};

const initialBox = (aspect: number): WindowBox => {
    const inset = readInset();
    const maxWidth = Math.max(1, window.innerWidth - inset * 2);
    const maxHeight = Math.max(1, window.innerHeight - inset * 2);
    let width = Math.min(readTabletWidth(), maxWidth);
    let height = width * aspect;

    if (height > maxHeight) {
        height = maxHeight;
        width = height / aspect;
    }

    return {
        width,
        height,
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2,
    };
};

const clampBox = (box: WindowBox): WindowBox => {
    const inset = readInset();
    const maxWidth = Math.max(1, window.innerWidth - inset * 2);
    const maxHeight = Math.max(1, window.innerHeight - inset * 2);
    const width = Math.min(box.width, maxWidth);
    const height = Math.min(box.height, maxHeight);

    return {
        width,
        height,
        left: Math.min(Math.max(box.left, inset), window.innerWidth - inset - width),
        top: Math.min(Math.max(box.top, inset), window.innerHeight - inset - height),
    };
};

const resizeBox = (start: WindowBox, edge: ResizeEdge, dx: number, dy: number): WindowBox => {
    const inset = readInset();
    const rightLimit = window.innerWidth - inset;
    const bottomLimit = window.innerHeight - inset;
    let left = start.left;
    let top = start.top;
    let right = start.left + start.width;
    let bottom = start.top + start.height;

    if (edge.includes("e")) right = Math.min(rightLimit, Math.max(left + MIN_WINDOW_SIZE, start.left + start.width + dx));
    if (edge.includes("s")) bottom = Math.min(bottomLimit, Math.max(top + MIN_WINDOW_SIZE, start.top + start.height + dy));
    if (edge.includes("w")) left = Math.max(inset, Math.min(right - MIN_WINDOW_SIZE, start.left + dx));
    if (edge.includes("n")) top = Math.max(inset, Math.min(bottom - MIN_WINDOW_SIZE, start.top + dy));

    return {
        left,
        top,
        width: right - left,
        height: bottom - top,
    };
};

const PipIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 -960 960 960"
        width="24"
        aria-hidden
    >
        <path
            d="M80-520v-80h144L52-772l56-56 172 172v-144h80v280H80Zm80 360q-33 0-56.5-23.5T80-240v-200h80v200h320v80H160Zm640-280v-280H440v-80h360q33 0 56.5 23.5T880-720v280h-80ZM560-160v-200h320v200H560Z"
            fill="#1f1f1f"
        />
    </svg>
);

const CloseIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
    >
        <path
            d="m8 8 8 8m-8 0 8-8"
            stroke="#1f1f1f"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </svg>
);

const roundButtonClassName = "absolute top-[0.4rem] right-[0.4rem] z-10 flex size-[3.2rem] items-center justify-center rounded-full bg-white shadow-[0_0.4rem_1.2rem_#00000040]";

type WindowPanelProps = {
    frame: ContentFrame;
    layer: number;
    boundsRef: RefObject<HTMLDivElement | null>;
    onClose: () => void;
    children: ReactNode;
};

const WindowPanel = ({ frame, layer, boundsRef, onClose, children }: WindowPanelProps) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const dragControls = useDragControls();
    const reducedMotion = useReducedMotion();
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const [box, setBox] = useState(() => initialBox(frame.aspect));
    const resizeSession = useRef<{ edge: ResizeEdge; start: WindowBox; originX: number; originY: number; pointerId: number } | null>(null);

    useEffect(() => {
        const clampToViewport = () => setBox((current) => clampBox(current));
        window.addEventListener("resize", clampToViewport);
        return () => window.removeEventListener("resize", clampToViewport);
    }, []);

    const bakeDragOffset = () => {
        const panel = panelRef.current;
        if (!panel) return box;
        const rect = panel.getBoundingClientRect();
        panel.style.left = `${rect.left}px`;
        panel.style.top = `${rect.top}px`;
        x.set(0);
        y.set(0);
        const next = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        setBox(next);
        return next;
    };

    const startResize = (edge: ResizeEdge, event: ReactPointerEvent<HTMLElement>) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const start = bakeDragOffset();
        resizeSession.current = { edge, start, originX: event.clientX, originY: event.clientY, pointerId: event.pointerId };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const moveResize = (event: ReactPointerEvent<HTMLElement>) => {
        const session = resizeSession.current;
        if (!session || event.pointerId !== session.pointerId || (event.buttons & 1) === 0) return;
        setBox(resizeBox(session.start, session.edge, event.clientX - session.originX, event.clientY - session.originY));
    };

    const endResize = (event: ReactPointerEvent<HTMLElement>) => {
        if (resizeSession.current?.pointerId !== event.pointerId) return;
        resizeSession.current = null;
    };

    return (
        <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label="창"
            data-ui-window
            drag
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={boundsRef}
            dragElastic={0.35}
            dragMomentum={false}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 15 }}
            onPointerDown={(event) => {
                if (event.button !== 0) return;
                if ((event.target as HTMLElement).closest("[data-window-close]")) return;
                dragControls.start(event);
            }}
            className="group/window fixed cursor-grab touch-none overflow-hidden rounded-[1.4rem] border border-solid border-[#ffffff30] active:cursor-grabbing"
            style={{
                width: box.width,
                height: box.height,
                left: box.left,
                top: box.top,
                zIndex: layer,
                x,
                y,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: FADE_EASE }}
        >
            <div className="h-full w-full overflow-hidden [&_img]:pointer-events-none [&_img]:!m-0 [&_img]:!block [&_img]:!h-full [&_img]:!w-full [&_img]:!max-w-none [&_img]:!rounded-none [&_img]:!object-cover [&_img]:!shadow-none">
                {children}
            </div>

            {RESIZE_HANDLES.map((handle) => (
                <div
                    key={handle.edge}
                    data-window-resize={handle.edge}
                    className={`absolute touch-none ${handle.className}`}
                    onPointerDown={(event) => startResize(handle.edge, event)}
                    onPointerMove={moveResize}
                    onPointerUp={endResize}
                    onPointerCancel={endResize}
                />
            ))}

            <button
                type="button"
                aria-label="닫기"
                data-window-close
                className={`${roundButtonClassName} opacity-50 transition-opacity duration-200 group-hover/window:opacity-100`}
                onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    event.stopPropagation();
                }}
                onClick={(event) => {
                    event.stopPropagation();
                    onClose();
                }}
            >
                <CloseIcon />
            </button>
        </motion.div>
    );
};

type WindowPortalProps = {
    open: boolean;
    frame: ContentFrame;
    layer: number;
    onClose: () => void;
    children: ReactNode;
};

const WindowPortal = ({ open, frame, layer, onClose, children }: WindowPortalProps) => {
    const boundsRef = useRef<HTMLDivElement>(null);

    return createPortal(
        <>
            <div
                ref={boundsRef}
                aria-hidden
                className="pointer-events-none fixed inset-[2rem]"
            />
            <AnimatePresence>
                {open ? (
                    <WindowPanel
                        key="panel"
                        frame={frame}
                        layer={layer}
                        boundsRef={boundsRef}
                        onClose={onClose}
                    >
                        {children}
                    </WindowPanel>
                ) : null}
            </AnimatePresence>
        </>,
        document.body,
    );
};

const readContentAspect = (content: HTMLElement, fallback: DOMRect) => {
    const image = content.querySelector("img");
    if (image && image.naturalWidth > 0 && image.naturalHeight > 0) {
        return image.naturalHeight / image.naturalWidth;
    }

    const rendered = image?.getBoundingClientRect() ?? fallback;
    if (rendered.width < 1 || rendered.height < 1) return null;
    return rendered.height / rendered.width;
};

const Window = ({ children, openOnContentClick = false, className }: WindowProps) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [frame, setFrame] = useState<ContentFrame | null>(null);
    const [layer, setLayer] = useState(nextLayer);

    const openWindow = () => {
        if (open) return;

        const content = contentRef.current;
        const rect = content?.getBoundingClientRect();
        if (!content || !rect || rect.width < 1 || rect.height < 1) return;

        const aspect = readContentAspect(content, rect);
        if (!aspect) return;

        nextLayer += 1;
        setLayer(nextLayer);
        setFrame({ aspect });
        setOpen(true);
    };

    return (
        <div className={`group relative ${className ?? ""}`}>
            <div
                ref={contentRef}
                className={`[&_img]:block ${openOnContentClick ? "cursor-pointer" : ""}`}
                role={openOnContentClick ? "button" : undefined}
                tabIndex={openOnContentClick ? 0 : undefined}
                onClick={
                    openOnContentClick
                        ? (event) => {
                              event.stopPropagation();
                              openWindow();
                          }
                        : undefined
                }
                onKeyDown={
                    openOnContentClick
                        ? (event) => {
                              if (event.key !== "Enter" && event.key !== " ") return;
                              event.preventDefault();
                              openWindow();
                          }
                        : undefined
                }
            >
                {children}
            </div>

            <button
                type="button"
                aria-label="창으로 열기"
                className={`${roundButtonClassName} pointer-events-none opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100`}
                onClick={(event) => {
                    event.stopPropagation();
                    openWindow();
                }}
            >
                <PipIcon />
            </button>

            {frame ? (
                <WindowPortal
                    open={open}
                    frame={frame}
                    layer={layer}
                    onClose={() => setOpen(false)}
                >
                    {children}
                </WindowPortal>
            ) : null}
        </div>
    );
};

export default Window;
