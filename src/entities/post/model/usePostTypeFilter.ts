"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { getPostTypeFilter, type PostTypeFilter } from "./postSettings";

export const usePostTypeFilter = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const postType = getPostTypeFilter(searchParams.get("type"));
    const mainViewMode = postType !== "all" || searchParams.get("view") === "list" ? 2 : 1;
    const category = Number(searchParams.get("category"));
    const categoryFilter = postType === "article" && Number.isSafeInteger(category) && category > 0 ? category : null;

    const navigate = (type: PostTypeFilter, latest = false, categoryIdx?: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (type === "all") params.delete("type");
        else params.set("type", type);
        if (!latest && type === "all") params.set("view", "list");
        else params.delete("view");
        if (type === "article" && categoryIdx) params.set("category", String(categoryIdx));
        else params.delete("category");
        params.delete("page");
        const query = params.toString();
        window.history.pushState(null, "", `${pathname}${query ? `?${query}` : ""}`);
    };

    return {
        postType,
        mainViewMode,
        categoryFilter,
        setPostType: (type: PostTypeFilter) => navigate(type),
        setCategory: (idx: number) => navigate("article", false, idx),
        showLatest: () => navigate("all", true),
    };
};
