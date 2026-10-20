"use client";

import { useEffect, useState, type RefObject } from "react";

import type { PostTocItem } from "@/entities/post/lib/postToc";

type PostTocNavProps = {
    items: PostTocItem[];
    scrollViewportRef?: RefObject<HTMLDivElement | null>;
};

const PostTocNav = ({ items, scrollViewportRef }: PostTocNavProps) => {
    const [activeId, setActiveId] = useState(items[0]?.id ?? "");
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setActiveId(items[0]?.id ?? "");
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

    if (items.length === 0) return null;

    return (
        <nav
            aria-label="글 목차"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`fixed top-[50%] right-[2.0rem] transform translate-y-[-50%] z-[110] ${
                isHovered ? "w-[28rem] rounded-[1.2rem] border border-[var(--color-gray-200)] bg-[var(--color-surface)] p-[2.4rem] shadow-[var(--shadow-normal)]" : "w-[3.2rem] bg-transparent p-0"
            }`}
        >
            <ul className={`flex flex-col ${isHovered ? "gap-[0.4rem]" : "items-end gap-[0.8rem]"}`}>
                {items.map((item) => {
                    const isActive = activeId === item.id;
                    const isMain = item.level === 1;

                    if (!isHovered) {
                        return (
                            <li
                                key={item.id}
                                className="flex w-full justify-end"
                            >
                                <button
                                    type="button"
                                    aria-label={item.label}
                                    onClick={() => handleClick(item.id)}
                                    className={`block h-[0.2rem] shrink-0 transition-opacity ${isMain ? "w-[2.4rem]" : "w-[1.2rem]"} ${isActive ? "bg-[#ff4321]" : "bg-[var(--color-border)]"}`}
                                />
                            </li>
                        );
                    }

                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => handleClick(item.id)}
                                className={`w-full text-left transition-colors ${
                                    isMain
                                        ? `rounded-[0.8rem] px-[1.2rem] py-[0.8rem] text-[1.6rem] font-bold leading-[1.4] ${
                                              isActive
                                                  ? "border border-[var(--color-blue-500)] text-[var(--color-blue-500)]"
                                                  : "border border-transparent text-[var(--color-gray-700)] hover:text-[var(--color-gray-1000)]"
                                          }`
                                        : `truncate px-[1.2rem] py-[0.4rem] pl-[2.4rem] text-[1.6rem] leading-[1.4] ${
                                              isActive ? "text-[var(--color-gray-1000)]" : "text-[var(--color-gray-500)] hover:text-[var(--color-gray-800)]"
                                          }`
                                }`}
                            >
                                {item.label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default PostTocNav;
