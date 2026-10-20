"use client";

import { useGetCategoryListQuery } from "@/entities/category/api/category.query";
import { useGetPostTypesQuery } from "@/entities/postType/api/postType.query";
import { usePostTypeFilter } from "@/entities/post/model/usePostTypeFilter";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import UI from "@/shared/ui/common/UIComponent";

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
    const textClass = (active: boolean) => (active ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]");

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
                    className={`${buttonClass} ${textClass(true)}`}
                >
                    search
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
                    전체
                </UI.Button>
                {postTypes?.result?.map((type) => (
                    <UI.Button
                        key={type.code}
                        onClick={() => setPostType(type.code)}
                        aria-pressed={postType === type.code}
                        className={`${buttonClass} ${textClass(postType === type.code)}`}
                    >
                        {type.title}
                    </UI.Button>
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
            {postType === "article" ? (
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
        </section>
    );
};

export default HomeViewModeNav;
