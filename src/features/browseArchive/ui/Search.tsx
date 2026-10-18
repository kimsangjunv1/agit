"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useGetIntegratedSearchQuery } from "@/entities/search/api/search.query";
import { SearchResultItem } from "@/entities/search/model/search.type";
import useNavigate from "@/shared/hooks/useNavigate";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";

const EMPTY_RESULTS: SearchResultItem[] = [];

const quickActions = [
    { title: "이력서", url: "/resume" },
    { title: "메인", url: "/" },
    { title: "포스트 관리", url: "/manager/post", badge: "ADMIN" },
    { title: "카테고리 관리", url: "/manager/category", badge: "ADMIN", active: true },
    { title: "어드민", url: "/manager", badge: "ADMIN" },
];

const Search = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { pushToUrl } = useNavigate();
    const { isSearchOpen, setIsSearchOpen } = useLayoutStore();
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
        <AnimatePresence>
            {isSearchOpen && (
                <motion.section
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 px-[1.6rem] backdrop-blur-[0.4rem]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeSearch}
                    onKeyDown={handleKeyDown}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="통합 검색"
                        className="w-full max-w-[53.6rem] overflow-hidden border border-[#e9e9e9] bg-white shadow-[0_2.4rem_6.4rem_rgba(0,0,0,0.22)]"
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{ type: "spring", mass: 0.2, stiffness: 180, damping: 18 }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <section className="flex h-[6.4rem] items-center gap-[1.6rem] border-b border-[#eeeeee] px-[2.4rem]">
                            <span className="relative h-[2rem] w-[2rem] shrink-0 rounded-full border-[0.4rem] border-[#676767] after:absolute after:right-[-0.4rem] after:bottom-[-0.4rem] after:h-[0.8rem] after:w-[0.4rem] after:rotate-[-45deg] after:rounded-full after:bg-[#676767]" />
                            <input
                                ref={inputRef}
                                value={keyword}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => setKeyword(event.target.value)}
                                placeholder="Type a command or search..."
                                className="h-full min-w-0 flex-1 text-[1.6rem] text-[#2f2f2f] outline-none placeholder:text-[#5f5f5f]"
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                onClick={closeSearch}
                                aria-label="검색 닫기"
                                className="h-[2.8rem] w-[2.8rem] shrink-0 text-[2.4rem] leading-none text-[#7a7a7a]"
                            >
                                ×
                            </button>
                        </section>

                        <section className="max-h-[49.2rem] min-h-[45.2rem] overflow-y-auto px-[2.4rem] py-[2rem]">
                            {!shouldSearch ? (
                                <>
                                    <p className="mb-[2rem] text-[1.6rem] text-[#777777]">Quick Actions</p>
                                    <section className="flex flex-col">
                                        {quickActions.map((action, index) => (
                                            <button
                                                key={action.title}
                                                type="button"
                                                onClick={() => moveToUrl(action.url)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`flex h-[4.8rem] items-center rounded-[1.2rem] px-[1.2rem] text-left text-[1.6rem] text-[#171717] transition-colors ${selectedIndex === index ? "bg-[#f5f5f5]" : "hover:bg-[#f5f5f5]"}`}
                                            >
                                                <span>{action.title}</span>
                                                {action.badge && <span className="ml-[1.2rem] bg-[#000000] px-[0.8rem] py-[0.4rem] text-[1.2rem] font-bold text-[#77ff00]">{action.badge}</span>}
                                                {selectedIndex === index && <span className="ml-auto text-[2rem] text-[#787878]">›</span>}
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
                                    <p className="mb-[2rem] text-[1.6rem] text-[#777777]">Search Results</p>
                                    {isLoading && <p className="px-[1.2rem] text-[1.6rem] text-[#777777]">검색 중...</p>}
                                    {errorMessage && <p className="px-[1.2rem] text-[1.6rem] text-[#ff3d00]">{errorMessage}</p>}
                                    {!isLoading && !errorMessage && results.length === 0 && <p className="px-[1.2rem] text-[1.6rem] text-[#777777]">검색 결과가 없습니다</p>}
                                    {!isLoading &&
                                        Object.entries(groupedResults).map(([group, items]) => (
                                            <section
                                                key={group}
                                                className="mb-[1.6rem]"
                                            >
                                                <p className="mb-[0.8rem] text-[1.6rem] text-[#777777]">{group}</p>
                                                {items.map((item) => {
                                                    const resultIndex = results.findIndex((result) => result.id === item.id);

                                                    return (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => moveToUrl(item.url)}
                                                            onMouseEnter={() => setSelectedIndex(resultIndex)}
                                                            className={`flex min-h-[5.6rem] w-full flex-col justify-center rounded-[1.2rem] px-[1.2rem] text-left transition-colors ${selectedIndex === resultIndex ? "bg-[#f5f5f5]" : "hover:bg-[#f5f5f5]"}`}
                                                        >
                                                            <span className="line-clamp-1 text-[1.6rem] text-[#171717]">{item.title}</span>
                                                            {item.description && <span className="mt-[0.4rem] line-clamp-1 text-[1.2rem] text-[#777777]">{item.description}</span>}
                                                        </button>
                                                    );
                                                })}
                                            </section>
                                        ))}
                                </>
                            )}
                        </section>

                        <section className="flex h-[6.4rem] items-center gap-[0.8rem] border-t border-[#eeeeee] bg-[#f6f6f6] px-[2.4rem] text-[1.6rem] text-[#5d5d5d]">
                            <kbd className="rounded-[0.8rem] bg-[#e9e9e9] px-[0.8rem] py-[0.4rem] text-[#4e4e4e]">↑</kbd>
                            <kbd className="rounded-[0.8rem] bg-[#e9e9e9] px-[0.8rem] py-[0.4rem] text-[#4e4e4e]">↓</kbd>
                            <span className="mr-[1.2rem]">Navigate</span>
                            <kbd className="rounded-[0.8rem] bg-[#e9e9e9] px-[0.8rem] py-[0.4rem] text-[#4e4e4e]">↵</kbd>
                            <span>Select</span>
                            <span className="ml-auto">Close</span>
                            <kbd className="rounded-[0.8rem] bg-[#e9e9e9] px-[0.8rem] py-[0.4rem] text-[#4e4e4e]">ESC</kbd>
                        </section>
                    </motion.div>
                </motion.section>
            )}
        </AnimatePresence>
    );
};

export default Search;
