"use client";

import { useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent, type PointerEvent, type RefObject } from "react";

export type ScrollbarProps = HTMLAttributes<HTMLDivElement> & {
    direction?: "vertical" | "horizontal";
    viewportRef?: RefObject<HTMLDivElement | null>;
    viewportClassName?: string;
    contentClassName?: string;
    trackClassName?: string;
    thumbClassName?: string;
    viewportProps?: Omit<HTMLAttributes<HTMLDivElement>, "children" | "className">;
    thickness?: number;
    minThumbSize?: number;
    /** true면 상호작용 후 일정 시간이 지나면 스크롤바를 숨깁니다. */
    autoHide?: boolean;
    /** autoHide 시 숨기기까지 대기 시간(초). 기본 1초. */
    autoHideDelay?: number;
};

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

const measure = (viewport: HTMLDivElement, track: HTMLDivElement, vertical: boolean, minThumbSize: number) => {
    const viewportSize = vertical ? viewport.clientHeight : viewport.clientWidth;
    const contentSize = vertical ? viewport.scrollHeight : viewport.scrollWidth;
    const trackSize = vertical ? track.clientHeight : track.clientWidth;
    const maxScroll = Math.max(0, contentSize - viewportSize);
    const position = clamp(vertical ? viewport.scrollTop : viewport.scrollLeft, maxScroll);
    const thumbSize = Math.min(trackSize, Math.max(Math.max(1, minThumbSize), (viewportSize / Math.max(1, contentSize)) * trackSize));

    return { viewportSize, maxScroll, position, thumbSize, travel: Math.max(0, trackSize - thumbSize) };
};

const Scrollbar = ({
    children,
    direction = "vertical",
    viewportRef,
    className = "",
    viewportClassName = "",
    contentClassName = "",
    trackClassName = "bg-[var(--color-gray-300)]/40",
    thumbClassName = "bg-[var(--color-gray-600)] hover:bg-[var(--color-gray-900)] data-[dragging=true]:bg-[var(--color-gray-900)]",
    viewportProps,
    thickness = 8,
    minThumbSize = 24,
    autoHide = false,
    autoHideDelay = 1,
    "aria-label": ariaLabel,
    ...rootProps
}: ScrollbarProps) => {
    const internalViewportRef = useRef<HTMLDivElement | null>(null);
    const scrollRef = viewportRef ?? internalViewportRef;
    const contentRef = useRef<HTMLDivElement | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const thumbRef = useRef<HTMLDivElement | null>(null);
    const dragRef = useRef<{ pointerId: number; start: number; scroll: number } | null>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isHoveringRef = useRef(false);
    const isDraggingRef = useRef(false);
    const showBarRef = useRef<() => void>(() => undefined);
    const [hasOverflow, setHasOverflow] = useState(false);
    const [isBarVisible, setIsBarVisible] = useState(!autoHide);
    const generatedId = useId();
    const viewportId = viewportProps?.id ?? generatedId;
    const vertical = direction === "vertical";
    const label = ariaLabel ?? (vertical ? "세로 스크롤" : "가로 스크롤");
    const barVisible = !autoHide || isBarVisible;

    const clearHideTimeout = () => {
        if (hideTimeoutRef.current === null) return;
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
    };

    const isHoldingBar = () => isHoveringRef.current || isDraggingRef.current;

    const scheduleHide = () => {
        if (!autoHide) return;
        clearHideTimeout();
        if (isHoldingBar()) return;
        hideTimeoutRef.current = setTimeout(
            () => {
                setIsBarVisible(false);
                hideTimeoutRef.current = null;
            },
            Math.max(0, autoHideDelay) * 1000,
        );
    };

    const showBar = () => {
        if (!autoHide) return;
        setIsBarVisible(true);
        scheduleHide();
    };

    showBarRef.current = showBar;

    useEffect(() => {
        if (!autoHide) {
            clearHideTimeout();
            setIsBarVisible(true);
            return;
        }

        setIsBarVisible(false);
        return () => clearHideTimeout();
    }, [autoHide, autoHideDelay]);

    useEffect(() => {
        const viewport = scrollRef.current;
        const content = contentRef.current;
        const track = trackRef.current;
        const thumb = thumbRef.current;

        if (!viewport || !content || !track || !thumb) return;

        let frame: number | null = null;
        const update = () => {
            frame = null;
            const { viewportSize, maxScroll, position, thumbSize, travel } = measure(viewport, track, vertical, minThumbSize);
            const offset = maxScroll > 0 ? (position / maxScroll) * travel : 0;

            // 스크롤할 때는 손잡이만 갱신해 콘텐츠의 React 렌더링을 피합니다.
            thumb.style.width = vertical ? "100%" : `${thumbSize}px`;
            thumb.style.height = vertical ? `${thumbSize}px` : "100%";
            thumb.style.transform = vertical ? `translate3d(0, ${offset}px, 0)` : `translate3d(${offset}px, 0, 0)`;
            thumb.setAttribute("aria-valuemax", `${maxScroll}`);
            thumb.setAttribute("aria-valuenow", `${Math.round(position)}`);
            setHasOverflow(viewportSize > 0 && maxScroll > 1);
        };
        const scheduleUpdate = () => {
            if (frame === null) frame = requestAnimationFrame(update);
        };
        const handleScroll = () => {
            showBarRef.current();
            scheduleUpdate();
        };
        const handleWheel = (event: WheelEvent) => {
            if (vertical || event.ctrlKey || event.defaultPrevented) return;

            const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
            const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1;
            const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
            const next = clamp(viewport.scrollLeft + delta * unit, maxScroll);

            if (next === viewport.scrollLeft) return;

            event.preventDefault();
            viewport.scrollLeft = next;
        };

        const observer = new ResizeObserver(scheduleUpdate);
        observer.observe(viewport);
        observer.observe(content);
        observer.observe(track);
        viewport.addEventListener("scroll", handleScroll, { passive: true });
        if (!vertical) viewport.addEventListener("wheel", handleWheel, { passive: false });
        scheduleUpdate();

        return () => {
            observer.disconnect();
            viewport.removeEventListener("scroll", handleScroll);
            viewport.removeEventListener("wheel", handleWheel);
            if (frame !== null) cancelAnimationFrame(frame);
        };
    }, [scrollRef, vertical, minThumbSize]);

    const setScroll = (position: number) => {
        const viewport = scrollRef.current;
        if (!viewport) return;

        if (vertical) viewport.scrollTop = position;
        else viewport.scrollLeft = position;
    };

    const handleTrackPointerEnter = () => {
        if (!autoHide) return;
        isHoveringRef.current = true;
        showBar();
        clearHideTimeout();
    };

    const handleTrackPointerLeave = () => {
        if (!autoHide) return;
        isHoveringRef.current = false;
        scheduleHide();
    };

    const handleTrackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        const viewport = scrollRef.current;
        const track = trackRef.current;
        if (event.button !== 0 || !viewport || !track || !hasOverflow) return;

        event.preventDefault();
        showBar();
        thumbRef.current?.focus({ preventScroll: true });
        const { maxScroll, thumbSize, travel } = measure(viewport, track, vertical, minThumbSize);
        const bounds = track.getBoundingClientRect();
        const position = vertical ? event.clientY - bounds.top : event.clientX - bounds.left;
        if (travel > 0) setScroll((clamp(position - thumbSize / 2, travel) / travel) * maxScroll);
    };

    const handleThumbPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        const viewport = scrollRef.current;
        if (event.button !== 0 || !viewport || !hasOverflow) return;

        event.preventDefault();
        event.stopPropagation();
        isDraggingRef.current = true;
        showBar();
        clearHideTimeout();
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.dataset.dragging = "true";
        dragRef.current = {
            pointerId: event.pointerId,
            start: vertical ? event.clientY : event.clientX,
            scroll: vertical ? viewport.scrollTop : viewport.scrollLeft,
        };
    };

    const handleThumbPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        const viewport = scrollRef.current;
        const track = trackRef.current;
        if (!drag || drag.pointerId !== event.pointerId || !viewport || !track) return;

        const { maxScroll, travel } = measure(viewport, track, vertical, minThumbSize);
        const delta = (vertical ? event.clientY : event.clientX) - drag.start;
        if (travel > 0) setScroll(clamp(drag.scroll + (delta / travel) * maxScroll, maxScroll));
    };

    const endDrag = (event: PointerEvent<HTMLDivElement>) => {
        if (dragRef.current?.pointerId !== event.pointerId) return;

        dragRef.current = null;
        isDraggingRef.current = false;
        delete event.currentTarget.dataset.dragging;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        scheduleHide();
    };

    const handleThumbKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const viewport = scrollRef.current;
        const track = trackRef.current;
        if (!viewport || !track || !hasOverflow) return;

        const { maxScroll, position, viewportSize } = measure(viewport, track, vertical, minThumbSize);
        const page = viewportSize * 0.9;
        let next: number;

        switch (event.key) {
            case "Home":
                next = 0;
                break;
            case "End":
                next = maxScroll;
                break;
            case "PageUp":
                next = position - page;
                break;
            case "PageDown":
                next = position + page;
                break;
            case " ":
                next = position + (event.shiftKey ? -page : page);
                break;
            default:
                if (event.key === (vertical ? "ArrowUp" : "ArrowLeft")) next = position - 40;
                else if (event.key === (vertical ? "ArrowDown" : "ArrowRight")) next = position + 40;
                else return;
        }

        event.preventDefault();
        showBar();
        setScroll(clamp(next, maxScroll));
    };

    return (
        <div
            {...rootProps}
            data-scrollbar={direction}
            className={`relative min-h-0 min-w-0 ${className}`}
        >
            <div
                role="region"
                aria-label={`${label} 영역`}
                tabIndex={0}
                {...viewportProps}
                id={viewportId}
                ref={scrollRef}
                data-scrollbar-viewport=""
                data-lenis-prevent="true"
                className={`relative [scrollbar-width:none] [&::-webkit-scrollbar]:hidden h-full w-full min-h-0 min-w-0 ${vertical ? "overflow-y-auto overflow-x-hidden" : "overflow-x-auto overflow-y-hidden"} ${viewportClassName}`}
            >
                <div
                    ref={contentRef}
                    data-scrollbar-content=""
                    className={`min-h-full min-w-full ${vertical ? "w-full" : "w-max"} ${contentClassName}`}
                >
                    {children}
                </div>
            </div>
            <div
                ref={trackRef}
                data-scrollbar-track=""
                data-visible={hasOverflow && barVisible ? "true" : "false"}
                aria-hidden={!hasOverflow || !barVisible}
                className={`absolute z-10 touch-none select-none transition-[opacity,transform] duration-200 ease-out will-change-[opacity,transform] ${vertical ? "inset-y-[1.2rem] right-[0.8rem] origin-right" : "inset-x-[1.2rem] bottom-[calc(0.8rem+env(safe-area-inset-bottom))] origin-bottom"} ${hasOverflow ? "" : "invisible pointer-events-none"} ${hasOverflow && !barVisible ? "pointer-events-none" : ""} ${trackClassName}`}
                style={{
                    ...(vertical ? { width: Math.max(1, thickness) } : { height: Math.max(1, thickness) }),
                    opacity: hasOverflow && barVisible ? 1 : 0,
                    transform: hasOverflow && barVisible ? "scale(1)" : "scale(0.95)",
                }}
                onPointerDown={handleTrackPointerDown}
                onPointerEnter={handleTrackPointerEnter}
                onPointerLeave={handleTrackPointerLeave}
            >
                <div
                    ref={thumbRef}
                    data-scrollbar-thumb=""
                    role="scrollbar"
                    aria-label={label}
                    aria-controls={viewportId}
                    aria-orientation={direction}
                    aria-valuemin={0}
                    aria-valuemax={0}
                    aria-valuenow={0}
                    tabIndex={hasOverflow ? 0 : -1}
                    className={`absolute top-0 left-0 cursor-grab touch-none will-change-transform active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gray-900)] ${thumbClassName}`}
                    onPointerDown={handleThumbPointerDown}
                    onPointerMove={handleThumbPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onLostPointerCapture={endDrag}
                    onKeyDown={handleThumbKeyDown}
                />
            </div>
        </div>
    );
};

export default Scrollbar;
