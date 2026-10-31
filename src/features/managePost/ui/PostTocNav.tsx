"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";

import type { PostTocItem } from "@/entities/post/lib/postToc";

type PostTocNavProps = {
    items: PostTocItem[];
    scrollViewportRef?: RefObject<HTMLDivElement | null>;
};

const MAIN_BASE_WIDTH = 28;
const SUB_BASE_WIDTH = 14;
const MAIN_EXPAND = 52;
const SUB_EXPAND = 26;
const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
const BAR_TRANSITION = { duration: 0.3, ease: MOTION_EASE };
const LAYOUT_TRANSITION = { duration: 0.3, ease: MOTION_EASE };

const getBaseWidth = (level: PostTocItem["level"]) => (level === 1 ? MAIN_BASE_WIDTH : SUB_BASE_WIDTH);
const getExpandWidth = (level: PostTocItem["level"]) => (level === 1 ? MAIN_EXPAND : SUB_EXPAND);

const PostTocNav = ({ items, scrollViewportRef }: PostTocNavProps) => {
    const reducedMotion = useReducedMotion();
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const [activeId, setActiveId] = useState(items[0]?.id ?? "");
    const [pointerY, setPointerY] = useState<number | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [focusedId, setFocusedId] = useState<string | null>(null);

    useEffect(() => {
        setActiveId(items[0]?.id ?? "");
        itemRefs.current = itemRefs.current.slice(0, items.length);
    }, [items]);

    useEffect(() => {
        const sections = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);

        if (sections.length === 0) return;

        let rafId = 0;
        let pendingId: string | null = null;

        const flushActiveId = () => {
            rafId = 0;
            const nextId = pendingId;
            pendingId = null;
            if (nextId) setActiveId((prev) => (prev === nextId ? prev : nextId));
        };

        const root = scrollViewportRef?.current ?? null;
        const handleIntersections: IntersectionObserverCallback = (entries) => {
            const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (visible[0]?.target.id) {
                pendingId = visible[0].target.id;

                if (!rafId) {
                    rafId = requestAnimationFrame(flushActiveId);
                }
            }
        };
        let observer: IntersectionObserver;
        const observeSections = () => {
            observer?.disconnect();
            const height = root?.clientHeight ?? window.innerHeight;
            observer = new IntersectionObserver(handleIntersections, {
                root,
                rootMargin: `-${height * 0.35}px 0px -${height * 0.45}px 0px`,
                threshold: [0, 1],
            });
            sections.forEach((section) => observer.observe(section));
        };

        observeSections();
        window.addEventListener("resize", observeSections);

        return () => {
            cancelAnimationFrame(rafId);
            observer.disconnect();
            window.removeEventListener("resize", observeSections);
        };
    }, [items, scrollViewportRef]);

    const handleClick = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveId(id);
    };

    const getReferenceY = () => {
        if (pointerY != null) return pointerY;

        const focusIndex = focusedId ? items.findIndex((item) => item.id === focusedId) : -1;
        if (focusIndex < 0) return null;

        const focused = itemRefs.current[focusIndex];
        if (!focused) return null;

        const bounds = focused.getBoundingClientRect();
        return bounds.top + bounds.height / 2;
    };

    const getBarWidth = (index: number, level: PostTocItem["level"]) => {
        const base = getBaseWidth(level);
        if (reducedMotion) return base;

        const referenceY = getReferenceY();
        if (referenceY == null) return base;

        const item = itemRefs.current[index];
        if (!item) return base;

        const bounds = item.getBoundingClientRect();
        const center = bounds.top + bounds.height / 2;
        const distance = (referenceY - center) / 100;
        return base + getExpandWidth(level) * Math.exp(-distance * distance);
    };

    if (items.length === 0) return null;

    const motionTransition = reducedMotion ? { duration: 0 } : BAR_TRANSITION;
    const layoutTransition = reducedMotion ? { duration: 0 } : LAYOUT_TRANSITION;

    return (
        <nav
            aria-label="글 목차"
            onPointerMove={(event) => setPointerY(event.clientY)}
            onPointerLeave={() => {
                setPointerY(null);
                setHoveredId(null);
            }}
            className="fixed top-1/2 right-[2rem] z-[110] hidden w-[22.4rem] -translate-y-1/2 text-[var(--color-text-primary)] pc:block"
        >
            <LayoutGroup id="post-toc-nav">
                <ol className="flex flex-col">
                    {items.map((item, index) => {
                        const isActive = activeId === item.id;
                        const isHighlighted = hoveredId === item.id || focusedId === item.id;

                        return (
                            <li key={item.id}>
                                <button
                                    ref={(node) => {
                                        itemRefs.current[index] = node;
                                    }}
                                    type="button"
                                    aria-label={`${item.label} 문단으로 이동`}
                                    aria-current={isActive ? "location" : undefined}
                                    onClick={() => handleClick(item.id)}
                                    onPointerEnter={() => setHoveredId(item.id)}
                                    onPointerLeave={() => setHoveredId((prev) => (prev === item.id ? null : prev))}
                                    onFocus={() => setFocusedId(item.id)}
                                    onBlur={() => setFocusedId((prev) => (prev === item.id ? null : prev))}
                                    className="flex h-[2.4rem] w-full items-center justify-end gap-[0.8rem] rounded-[0.2rem] focus-visible:outline-[0.2rem] focus-visible:outline-offset-[0.4rem] focus-visible:outline-current"
                                >
                                    <AnimatePresence initial={false}>
                                        {isHighlighted ? (
                                            <motion.span
                                                key={`${item.id}-label`}
                                                layout="position"
                                                initial={reducedMotion ? false : { opacity: 0, x: 8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={reducedMotion ? undefined : { opacity: 0, x: 8 }}
                                                transition={{ ...motionTransition, layout: layoutTransition }}
                                                aria-hidden="true"
                                                className={`min-w-0 max-w-[14.4rem] truncate text-right text-[1.4rem] font-semibold leading-[1.4] tracking-[-0.04em] ${
                                                    isActive ? "text-[#ff4321]" : "text-[var(--color-text-primary)]"
                                                }`}
                                            >
                                                {item.label}
                                            </motion.span>
                                        ) : null}
                                    </AnimatePresence>
                                    <motion.span
                                        layout
                                        aria-hidden="true"
                                        className={`block h-[0.4rem] shrink-0 ${
                                            isActive || isHighlighted
                                                ? "bg-[#ff4321] opacity-100"
                                                : "bg-current opacity-20"
                                        }`}
                                        initial={false}
                                        animate={{ width: getBarWidth(index, item.level) }}
                                        transition={{ ...motionTransition, layout: layoutTransition }}
                                    />
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </LayoutGroup>
        </nav>
    );
};

export default PostTocNav;
