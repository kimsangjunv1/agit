"use client";

import { AnimatePresence, motion } from "motion/react";

import UI from "@/shared/ui/common/UIComponent";
import TextShimmer from "@/shared/ui/common/TextShimmerComponent";
import { useGetCategoryListQuery } from "@/entities/category/api/category.query";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";

const springTransition = {
    type: "spring" as const,
    mass: 0.1,
    stiffness: 100,
    damping: 10,
};

type HomeViewModeNavProps = {
    variant: "header" | "floating";
};

const HomeViewModeNav = ({ variant }: HomeViewModeNavProps) => {
    const { mainViewMode, setMainViewMode, categoryFilter, setCategoryFilter, setIsSearchOpen } = useLayoutStore();
    const { data: getCategoryListData } = useGetCategoryListQuery();

    const isFloating = variant === "floating";
    const activeTextClass = isFloating ? "text-white" : "text-black";
    const inactiveTextClass = isFloating ? "text-white/50" : "text-[#00000050]";
    const dividerClass = isFloating ? "h-[1.6rem] w-[0.4rem] bg-white/30 shrink-0" : "h-[1.6rem] w-[0.1rem] bg-[var(--color-gray-400)] shrink-0";
    const buttonTextClass = isFloating ? "font-extrabold text-[2rem]" : "font-extrabold text-[2.4rem] whitespace-nowrap";

    return (
        <section className={isFloating ? "fixed z-100 left-1/2 -translate-x-1/2 bottom-[calc(1.6rem+env(safe-area-inset-bottom))] w-full" : "flex items-center"}>
            <section className={`${isFloating ? "gap-[0.4rem] max-w-[var(--size-pc)] px-[2rem] mx-auto pt-[var(--header-height)]" : "gap-[2.4rem]"} flex items-center justify-center`}>
                <AnimatePresence mode="popLayout">
                    <UI.Button
                        key="search"
                        onClick={() => setIsSearchOpen(true)}
                        className={isFloating ? "bg-black w-[6.4rem] h-[5.2rem] text-white rounded-full" : `${activeTextClass} ${buttonTextClass}`}
                    >
                        <span className="sr-only">검색</span>
                        <MaterialIcon
                            name="search"
                            size={24}
                        />
                    </UI.Button>

                    <section className={`${isFloating ? "bg-black rounded-full h-[5.2rem] px-[2rem]" : ""} flex items-center gap-[1.6rem]`}>
                        <UI.Button
                            key="latest"
                            onClick={() => {
                                window.scrollTo({ top: 0, left: 0 });
                                setMainViewMode(1);
                            }}
                            className={`${activeTextClass} text-[2rem] font-bold shrink-0`}
                        >
                            <span className={buttonTextClass}>최신글</span>
                            {/* {isFloating ? (
                                <span className={buttonTextClass}>최신글</span>
                            ) : (
                                <TextShimmer
                                    as="h2"
                                    duration={3}
                                    style={{
                                        color: "#000000",
                                        fontSize: "3.2rem",
                                    }}
                                    color={{
                                        start: "#000000",
                                        end: "#9393a0",
                                    }}
                                    className="font-extrabold text-[2.4rem]"
                                >
                                    최신글
                                </TextShimmer>
                            )} */}
                        </UI.Button>

                        <div
                            key="hr"
                            className={dividerClass}
                        />

                        {mainViewMode === 1 && (
                            <motion.section
                                key="slider"
                                initial={{ opacity: 0, transform: "scale(0.8)" }}
                                animate={{ opacity: 1, transform: "scale(1)" }}
                                exit={{ opacity: 0, transform: "scale(0.8)" }}
                                transition={springTransition}
                                className="flex gap-[1.6rem] justify-center shrink-0"
                            >
                                <UI.Button
                                    onClick={() => setMainViewMode(2)}
                                    className={`${inactiveTextClass} ${buttonTextClass}`}
                                >
                                    카테고리
                                </UI.Button>
                            </motion.section>
                        )}

                        {mainViewMode === 2 && (
                            <motion.section
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={springTransition}
                                className={`${isFloating ? "overflow-x-auto max-w-full scrollbar-hide flex gap-[0.8rem]" : "flex gap-[1.6rem] justify-center"}`}
                            >
                                <motion.section
                                    key="category-all"
                                    initial={{ opacity: 0, transform: "scale(0.8)" }}
                                    animate={{ opacity: 1, transform: "scale(1)" }}
                                    exit={{ opacity: 0, transform: "scale(0.8)" }}
                                    transition={springTransition}
                                    onClick={() => setCategoryFilter(999)}
                                    className={`flex gap-[1.6rem] shrink-0 ${categoryFilter === 999 ? activeTextClass : inactiveTextClass}`}
                                >
                                    <UI.Button className={buttonTextClass}>전체</UI.Button>
                                </motion.section>
                                {getCategoryListData?.result
                                    ?.filter((e) => e.is_enabled)
                                    .map((e, i) => (
                                        <motion.section
                                            key={`${e.idx}-${i}`}
                                            initial={{ opacity: 0, transform: "scale(0.8)" }}
                                            animate={{ opacity: 1, transform: "scale(1)" }}
                                            exit={{ opacity: 0, transform: "scale(0.8)" }}
                                            transition={{
                                                delay: 0.05 * (i + 1),
                                                ...springTransition,
                                            }}
                                            onClick={() => setCategoryFilter(e.idx)}
                                            className={`flex gap-[1.6rem] shrink-0 ${categoryFilter === e.idx ? activeTextClass : inactiveTextClass}`}
                                        >
                                            <UI.Button className={buttonTextClass}>{e.title}</UI.Button>
                                        </motion.section>
                                    ))}
                            </motion.section>
                        )}
                    </section>
                </AnimatePresence>
            </section>
        </section>
    );
};

export default HomeViewModeNav;
