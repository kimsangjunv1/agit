"use client";

import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";
import { type ReactNode, type RefObject, useMemo, useRef, useState } from "react";

const FADE_EASE = [0.4, 0, 0.2, 1] as const;
const EDGE_INSET_REM = 2;
const BORDER_WIDTH = 1;

let nextLayer = 1_500_000;

type ContentFrame = {
    width: number;
    height: number;
};

type WindowProps = {
    children: ReactNode;
    openOnContentClick?: boolean;
    className?: string;
};

const readRemSize = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;

const fitToViewport = (width: number, height: number) => {
    const inset = readRemSize() * EDGE_INSET_REM;
    const maxWidth = Math.max(BORDER_WIDTH * 2 + 1, window.innerWidth - inset * 2);
    const maxHeight = Math.max(BORDER_WIDTH * 2 + 1, window.innerHeight - inset * 2);
    const boxScale = Math.min(1, maxWidth / width, maxHeight / height);
    const boxWidth = Math.max(BORDER_WIDTH * 2 + 1, width * boxScale);
    const boxHeight = Math.max(BORDER_WIDTH * 2 + 1, height * boxScale);
    const scale = Math.min((boxWidth - BORDER_WIDTH * 2) / width, (boxHeight - BORDER_WIDTH * 2) / height);

    return {
        scale,
        width: boxWidth,
        height: boxHeight,
        left: (window.innerWidth - boxWidth) / 2,
        top: (window.innerHeight - boxHeight) / 2,
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
    const dragControls = useDragControls();
    const reducedMotion = useReducedMotion();
    const placement = useMemo(() => fitToViewport(frame.width, frame.height), [frame.width, frame.height]);

    return (
        <motion.div
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
                if ((event.target as HTMLElement).closest("[data-window-close]")) return;
                dragControls.start(event);
            }}
            className="fixed cursor-grab touch-none overflow-hidden rounded-[1.4rem] border border-solid border-[#ffffff30] active:cursor-grabbing"
            style={{
                width: placement.width,
                height: placement.height,
                left: placement.left,
                top: placement.top,
                zIndex: layer,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: FADE_EASE }}
        >
            <div
                className="pointer-events-none absolute top-0 left-0 origin-top-left [&_img]:h-full [&_img]:w-full [&_img]:rounded-none [&_img]:object-cover [&_img]:shadow-none"
                style={{
                    width: frame.width,
                    height: frame.height,
                    transform: `scale(${placement.scale})`,
                }}
            >
                {children}
            </div>

            <button
                type="button"
                aria-label="닫기"
                data-window-close
                className={roundButtonClassName}
                onPointerDown={(event) => event.stopPropagation()}
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

const Window = ({ children, openOnContentClick = false, className }: WindowProps) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [frame, setFrame] = useState<ContentFrame | null>(null);
    const [layer, setLayer] = useState(nextLayer);

    const openWindow = () => {
        if (open) return;

        const rect = contentRef.current?.getBoundingClientRect();
        if (!rect || rect.width < 1 || rect.height < 1) return;

        nextLayer += 1;
        setLayer(nextLayer);
        setFrame({ width: rect.width, height: rect.height });
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
