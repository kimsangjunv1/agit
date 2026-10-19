"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useGetIntegratedSearchQuery } from "@/entities/search/api/search.query";
import { SearchResultItem } from "@/entities/search/model/search.type";
import { PAGE_REVEAL_COVER_DURATION, PAGE_REVEAL_COVER_EASE, PAGE_REVEAL_UNCOVER_DURATION, PAGE_REVEAL_UNCOVER_EASE } from "@/shared/constants/pageTransition";
import useNavigate from "@/shared/hooks/useNavigate";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import IconComponent from "@/shared/ui/common/IconComponent";

const EMPTY_RESULTS: SearchResultItem[] = [];
const CLIP_SEARCH = {
    hidden: "inset(0 0 100% 0)",
    visible: "inset(0 0 0 0)",
    exit: "inset(0 0 100% 0)",
} as const;

const quickActions: { title: string; url: string; badge?: string }[] = [
    { title: "이력서", url: "/resume" },
    { title: "메인", url: "/" },
    // { title: "포스트 관리", url: "/manager/post", badge: "ADMIN" },
    // { title: "카테고리 관리", url: "/manager/category", badge: "ADMIN", active: true },
    // { title: "어드민", url: "/manager", badge: "ADMIN" },
];

const Search = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { pushToUrl } = useNavigate();
    const reducedMotion = useReducedMotion();
    const isSearchOpen = useLayoutStore((state) => state.isSearchOpen);
    const setIsSearchOpen = useLayoutStore((state) => state.setIsSearchOpen);
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const shouldSearch = debouncedKeyword.trim().length >= 2;
    const { data, error, isFetching } = useGetIntegratedSearchQuery(debouncedKeyword, isSearchOpen);
    const results = shouldSearch ? (data?.result ?? EMPTY_RESULTS) : EMPTY_RESULTS;
    const isLoading = isFetching;
    const errorMessage = error?.message ?? "";
    const baseActions = useMemo(() => [...quickActions, { title: "Introduction", url: "/" }, { title: "Installation", url: "/resume" }], []);
    const selectableItems = shouldSearch ? results : baseActions;

    const groupedResults = useMemo(
        () =>
            results.reduce<Record<string, SearchResultItem[]>>((acc, item) => {
                acc[item.group] = [...(acc[item.group] ?? []), item];
                return acc;
            }, {}),
        [results],
    );

    const closeSearch = () => {
        setIsSearchOpen(false);
        setKeyword("");
        setDebouncedKeyword("");
    };

    const moveToUrl = (url: string) => {
        closeSearch();
        pushToUrl(url);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
            closeSearch();
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, Math.max(selectableItems.length - 1, 0)));
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
            return;
        }

        if (event.key === "Enter" && selectableItems[selectedIndex]) {
            event.preventDefault();
            moveToUrl(selectableItems[selectedIndex].url);
        }
    };

    useEffect(() => {
        if (!isSearchOpen) return;

        const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
        return () => window.clearTimeout(timer);
    }, [isSearchOpen]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedKeyword(keyword);
        }, 300);

        return () => window.clearTimeout(timer);
    }, [keyword]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [keyword, results.length]);

    return (
        <AnimatePresence mode="wait">
            {isSearchOpen && (
                <motion.section
                    className="fixed inset-0 z-[100000000] flex items-start justify-center"
                    onClick={closeSearch}
                    onKeyDown={handleKeyDown}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="통합 검색"
                        className="flex max-h-[50svh] max-w-[var(--size-tablet)] w-full flex-col overflow-hidden bg-[#232323] text-white"
                        initial={{ clipPath: CLIP_SEARCH.hidden }}
                        animate={{ clipPath: CLIP_SEARCH.visible }}
                        exit={{
                            clipPath: CLIP_SEARCH.exit,
                            transition: {
                                duration: reducedMotion ? 0 : PAGE_REVEAL_UNCOVER_DURATION,
                                ease: PAGE_REVEAL_UNCOVER_EASE,
                            },
                        }}
                        transition={{
                            duration: reducedMotion ? 0 : PAGE_REVEAL_COVER_DURATION,
                            ease: PAGE_REVEAL_COVER_EASE,
                        }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <section className="flex h-[6.4rem] shrink-0 items-center gap-[1.6rem] border-b border-white/10 px-[1.6rem] tablet:px-[2.4rem]">
                            <span className="relative h-[2rem] w-[2rem] shrink-0 rounded-full border-[0.4rem] border-white/60 after:absolute after:right-[-0.4rem] after:bottom-[-0.4rem] after:h-[0.8rem] after:w-[0.4rem] after:rotate-[-45deg] after:rounded-full after:bg-white/60" />
                            <input
                                ref={inputRef}
                                value={keyword}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => setKeyword(event.target.value)}
                                placeholder="검색어를 입력해주세요"
                                aria-label="검색어"
                                className="h-full min-w-0 flex-1 text-[1.6rem] text-white outline-none placeholder:text-white/50"
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                onClick={closeSearch}
                                aria-label="검색 닫기"
                                className="h-[2.8rem] w-[2.8rem] shrink-0 text-[2.4rem] leading-none text-white/60 hover:text-white"
                            >
                                ×
                            </button>
                        </section>

                        <section className="min-h-0 overflow-y-auto overscroll-contain">
                            {!shouldSearch ? (
                                <>
                                    <p className="p-[2.0rem] text-[1.6rem] text-white/60">Quick Actions</p>
                                    <section className="flex flex-col">
                                        {quickActions.map((action, index) => (
                                            <button
                                                key={action.title}
                                                type="button"
                                                onClick={() => moveToUrl(action.url)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`flex justify-between items-center p-[2rem] text-left text-[1.6rem] text-white transition-colors ${selectedIndex === index ? "bg-white/10" : "hover:bg-white/10"}`}
                                            >
                                                <section>
                                                    <span>{action.title}</span>
                                                    {action.badge && <span className="ml-[1.2rem] bg-[#000000] px-[0.8rem] py-[0.4rem] text-[1.2rem] font-bold text-[#77ff00]">{action.badge}</span>}
                                                </section>

                                                <IconComponent
                                                    type="colored-arrow-below"
                                                    alt="더보기"
                                                    width={24}
                                                    height={24}
                                                    className={`${selectedIndex === index ? "opacity-100" : "opacity-30"} invert rotate-270`}
                                                />
                                            </button>
                                        ))}
                                    </section>

                                    {/* <section className="mt-[1.2rem] border-t border-[#eeeeee] pt-[1.8rem]">
                                        <p className="mb-[1.8rem] text-[1.4rem] text-[#777777]">Getting Started</p>
                                        <button
                                            type="button"
                                            onClick={() => moveToUrl("/")}
                                            onMouseEnter={() => setSelectedIndex(quickActions.length)}
                                            className={`flex h-[4.8rem] w-full items-center rounded-[1.1rem] px-[1.2rem] text-left text-[1.6rem] text-[#171717] ${selectedIndex === quickActions.length ? "bg-[#f5f5f5]" : "hover:bg-[#f5f5f5]"}`}
                                        >
                                            Introduction
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveToUrl("/resume")}
                                            onMouseEnter={() => setSelectedIndex(quickActions.length + 1)}
                                            className={`flex h-[4.8rem] w-full items-center rounded-[1.1rem] px-[1.2rem] text-left text-[1.6rem] text-[#171717] ${selectedIndex === quickActions.length + 1 ? "bg-[#f5f5f5]" : "hover:bg-[#f5f5f5]"}`}
                                        >
                                            Installation
                                        </button>
                                    </section> */}
                                </>
                            ) : (
                                <>
                                    <p className="mb-[2rem] text-[1.6rem] text-white/60">Search Results</p>
                                    {isLoading && <p className="px-[1.2rem] text-[1.6rem] text-white/60">검색 중...</p>}
                                    {errorMessage && <p className="px-[1.2rem] text-[1.6rem] text-[#ff3d00]">{errorMessage}</p>}
                                    {!isLoading && !errorMessage && results.length === 0 && <p className="px-[1.2rem] text-[1.6rem] text-white/60">검색 결과가 없습니다</p>}
                                    {!isLoading &&
                                        Object.entries(groupedResults).map(([group, items]) => (
                                            <section
                                                key={group}
                                                className="mb-[1.6rem]"
                                            >
                                                <p className="mb-[0.8rem] text-[1.6rem] text-white/60">{group}</p>
                                                {items.map((item) => {
                                                    const resultIndex = results.findIndex((result) => result.id === item.id);

                                                    return (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => moveToUrl(item.url)}
                                                            onMouseEnter={() => setSelectedIndex(resultIndex)}
                                                            className={`flex min-h-[5.6rem] w-full flex-col justify-center rounded-[1.2rem] px-[1.2rem] text-left transition-colors ${selectedIndex === resultIndex ? "bg-white/10" : "hover:bg-white/10"}`}
                                                        >
                                                            <span className="line-clamp-1 text-[1.6rem] text-white">{item.title}</span>
                                                            {item.description && <span className="mt-[0.4rem] line-clamp-1 text-[1.2rem] text-white/60">{item.description}</span>}
                                                        </button>
                                                    );
                                                })}
                                            </section>
                                        ))}
                                </>
                            )}
                        </section>

                        <section className="flex h-[6.4rem] shrink-0 items-center gap-[0.4rem] border-t border-white/10 px-[1.6rem] text-[1.2rem] text-white/60 tablet:gap-[0.8rem] tablet:px-[2.4rem] tablet:text-[1.6rem]">
                            <kbd className="rounded-[0.8rem] bg-white/10 px-[0.8rem] py-[0.4rem] text-white/80">↑</kbd>
                            <kbd className="rounded-[0.8rem] bg-white/10 px-[0.8rem] py-[0.4rem] text-white/80">↓</kbd>
                            <span className="mr-[1.2rem]">이동</span>
                            <kbd className="rounded-[0.8rem] bg-white/10 px-[0.8rem] py-[0.4rem] text-white/80">↵</kbd>
                            <span>선택</span>
                            <span className="ml-auto">닫기</span>
                            <kbd className="rounded-[0.8rem] bg-white/10 px-[0.8rem] py-[0.4rem] text-white/80 text-[1.2rem]">ESC</kbd>
                        </section>
                    </motion.div>
                </motion.section>
            )}
        </AnimatePresence>
    );
};

export default Search;
