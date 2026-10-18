"use client";

import { useEffect, useState } from "react";

import type { PostTocItem } from "@/entities/post/lib/postToc";

type PostTocNavProps = {
    items: PostTocItem[];
};

const PostTocNav = ({ items }: PostTocNavProps) => {
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

            if (pendingId) {
                setActiveId((prev) => (prev === pendingId ? prev : pendingId!));
                pendingId = null;
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible[0]?.target.id) {
                    pendingId = visible[0].target.id;

                    if (!rafId) {
                        rafId = requestAnimationFrame(flushActiveId);
                    }
                }
            },
            { rootMargin: "-35% 0px -45% 0px", threshold: [0, 1] },
        );

        sections.forEach((section) => observer.observe(section));

        return () => {
            cancelAnimationFrame(rafId);
            observer.disconnect();
        };
    }, [items]);

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
            className={`hidden pc:block fixed top-[50%] right-0 transform translate-y-[-50%] z-40 ${
                isHovered ? "w-[28rem] rounded-[1.2rem] border border-[var(--color-gray-200)] bg-white p-[2.4rem] shadow-[var(--shadow-normal)]" : "w-[3.2rem] bg-transparent p-0"
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
                                    className={`block h-[0.4rem] shrink-0 rounded-full bg-[var(--color-gray-1000)] transition-opacity ${isMain ? "w-[2.4rem]" : "w-[1.2rem]"} ${isActive ? "opacity-100" : "opacity-50"}`}
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
