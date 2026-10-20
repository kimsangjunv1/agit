"use client";

import { useGetCategoryListQuery } from "@/entities/category/api/category.query";
import { useGetPostTypesQuery } from "@/entities/postType/api/postType.query";
import { usePostTypeFilter } from "@/entities/post/model/usePostTypeFilter";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import UI from "@/shared/ui/common/UIComponent";
import { Fragment } from "react";

type HomeViewModeNavProps = {
    variant: "header" | "floating";
};

const HomeViewModeNav = ({ variant }: HomeViewModeNavProps) => {
    const setIsSearchOpen = useLayoutStore((state) => state.setIsSearchOpen);
    const { data: categories } = useGetCategoryListQuery();
    const { data: postTypes, isError, refetch } = useGetPostTypesQuery();
    const { postType, mainViewMode, categoryFilter, setPostType, setCategory, showLatest } = usePostTypeFilter();
    const isFloating = variant === "floating";
    const buttonClass = "shrink-0 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4";
    const textClass = (active: boolean) => (active ? "text-red-500" : "text-[var(--color-text-muted)]");

    return (
        <section
            className={
                isFloating
                    ? "fixed z-100 left-0 bottom-[calc(1.6rem+env(safe-area-inset-bottom))] flex w-full flex-col-reverse items-center gap-[1.2rem] px-[1.6rem]"
                    : "flex min-w-0 max-w-full flex-col-reverse items-start gap-[1.2rem]"
            }
        >
            <nav
                aria-label="글 목록 메뉴"
                className={`flex max-w-full items-center gap-[1.6rem] overflow-x-auto scrollbar-hide ${isFloating ? "rounded-full bg-[var(--color-surface-floating)] px-[2rem] py-[1.2rem] text-[1.6rem]" : "text-[2rem]"}`}
            >
                <UI.Button
                    onClick={() => setIsSearchOpen(true)}
                    className={`${buttonClass} ${textClass(false)}`}
                >
                    <span className="sr-only">검색</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="currentColor"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                    </svg>
                </UI.Button>
                <UI.Button
                    onClick={() => {
                        window.scrollTo({ top: 0, left: 0 });
                        document.querySelector<HTMLDivElement>("main [data-scrollbar-viewport]")?.scrollTo({ top: 0, left: 0 });
                        showLatest();
                    }}
                    aria-pressed={mainViewMode === 1}
                    className={`${buttonClass} ${textClass(mainViewMode === 1)}`}
                >
                    New
                </UI.Button>
                <div className="h-[1.6rem] w-px shrink-0 bg-[var(--color-border)]" />
                <UI.Button
                    onClick={() => setPostType("all")}
                    aria-pressed={mainViewMode === 2 && postType === "all"}
                    className={`${buttonClass} ${textClass(mainViewMode === 2 && postType === "all")}`}
                >
                    All
                </UI.Button>
                {postTypes?.result?.map((type) => (
                    <Fragment key={type.code}>
                        <UI.Button
                            // key={type.code}
                            onClick={() => setPostType(type.code)}
                            aria-pressed={postType === type.code}
                            className={`${buttonClass} ${textClass(postType === type.code)}`}
                        >
                            {type.title}
                        </UI.Button>

                        {type.code === "article" && postType === "article" ? (
                            <nav
                                aria-label="일반 글 카테고리"
                                className={`flex max-w-full items-center gap-[1.6rem] overflow-x-auto text-[1.6rem] scrollbar-hide ${isFloating ? "rounded-[1.6rem] bg-[var(--color-surface-floating)] px-[2rem] py-[1.2rem]" : ""}`}
                            >
                                {categories?.result
                                    ?.filter((category) => category.is_enabled)
                                    .map((category) => (
                                        <UI.Button
                                            key={category.idx}
                                            onClick={() => setCategory(category.idx)}
                                            aria-pressed={categoryFilter === category.idx}
                                            className={`${buttonClass} ${textClass(categoryFilter === category.idx)}`}
                                        >
                                            {category.title}
                                        </UI.Button>
                                    ))}
                            </nav>
                        ) : null}
                    </Fragment>
                ))}

                {isError ? (
                    <UI.Button
                        onClick={() => refetch()}
                        className={buttonClass}
                    >
                        종류 다시 불러오기
                    </UI.Button>
                ) : null}
            </nav>
        </section>
    );
};

export default HomeViewModeNav;
