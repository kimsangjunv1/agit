"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "motion/react";

import DynamicIsland from "@/shared/ui/common/DynamicIsland";

const VIEWPORT_GAP = 12;
const TRIGGER_GAP = 8;
const MIN_PANEL_SIZE = 48;

type FloatingSelectorProps = {
    ariaLabel: string;
    trigger: ReactNode;
    triggerClassName?: string;
    children: ReactNode;
    align?: "start" | "end";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

type PanelPosition = {
    placement: "above" | "below";
    maxWidth: number;
    maxHeight: number;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
};

const rangesOverlap = (current: PanelPosition | null, next: PanelPosition) =>
    current?.placement === next.placement
    && current.maxWidth === next.maxWidth
    && current.maxHeight === next.maxHeight
    && current.left === next.left
    && current.right === next.right
    && current.top === next.top
    && current.bottom === next.bottom;

const FloatingSelector = ({ ariaLabel, trigger, triggerClassName = "", children, align = "start", open: openProp, onOpenChange }: FloatingSelectorProps) => {
    const panelId = useId();
    const anchorRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const [position, setPosition] = useState<PanelPosition | null>(null);
    const open = openProp ?? uncontrolledOpen;

    const setOpen = useCallback((next: boolean) => {
        onOpenChange?.(next);
        if (openProp === undefined) setUncontrolledOpen(next);
    }, [onOpenChange, openProp]);

    useLayoutEffect(() => {
        if (!open) return;
        const update = () => {
            const anchor = anchorRef.current;
            if (!anchor) return;
            const rect = anchor.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom - TRIGGER_GAP - VIEWPORT_GAP;
            const spaceAbove = rect.top - TRIGGER_GAP - VIEWPORT_GAP;
            const placement = spaceBelow >= spaceAbove ? "below" : "above";
            const availableHeight = Math.max(0, placement === "below" ? spaceBelow : spaceAbove);
            const maxHeight = Math.max(MIN_PANEL_SIZE, availableHeight);

            let left: number | undefined;
            let right: number | undefined;
            let maxWidth: number;
            if (align === "end") {
                right = Math.max(VIEWPORT_GAP, viewportWidth - rect.right);
                maxWidth = Math.max(MIN_PANEL_SIZE, viewportWidth - right - VIEWPORT_GAP);
            } else {
                left = Math.max(VIEWPORT_GAP, rect.left);
                maxWidth = Math.max(MIN_PANEL_SIZE, viewportWidth - left - VIEWPORT_GAP);
            }
            maxWidth = Math.min(maxWidth, viewportWidth - VIEWPORT_GAP * 2);

            const next: PanelPosition = placement === "below"
                ? { placement, maxWidth, maxHeight, left, right, top: rect.bottom + TRIGGER_GAP }
                : { placement, maxWidth, maxHeight, left, right, bottom: viewportHeight - rect.top + TRIGGER_GAP };
            setPosition((current) => (rangesOverlap(current, next) ? current : next));
        };

        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        window.visualViewport?.addEventListener("resize", update);
        window.visualViewport?.addEventListener("scroll", update);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
            window.visualViewport?.removeEventListener("resize", update);
            window.visualViewport?.removeEventListener("scroll", update);
        };
    }, [align, open]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return;
            setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open, setOpen]);

    const closeOnChoice = (event: MouseEvent<HTMLDivElement>) => {
        const target = event.target;
        if (target instanceof Element && target.closest("button, label, a, [role='option']")) setOpen(false);
    };

    return (
        <div ref={anchorRef} className="inline-flex">
            <button
                type="button"
                aria-label={ariaLabel}
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                aria-haspopup="dialog"
                className={`inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand-500)] ${triggerClassName}`}
                onClick={() => setOpen(!open)}
            >
                {trigger}
            </button>
            {typeof document !== "undefined" && position
                ? createPortal(
                    <AnimatePresence>
                        {open ? (
                            <div
                                key="panel"
                                ref={panelRef}
                                className="fixed z-[140]"
                                style={{ left: position.left, right: position.right, top: position.top, bottom: position.bottom }}
                            >
                                <DynamicIsland
                                    key={position.placement}
                                    ariaLabel={ariaLabel}
                                    placement={position.placement === "below" ? "top" : "bottom"}
                                    maxWidth={position.maxWidth}
                                    maxHeight={position.maxHeight}
                                >
                                    <div id={panelId} onClick={closeOnChoice}>
                                        {children}
                                    </div>
                                </DynamicIsland>
                            </div>
                        ) : null}
                    </AnimatePresence>,
                    document.body,
                )
                : null}
        </div>
    );
};

export default FloatingSelector;
