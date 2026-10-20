"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { getPostTypeFilter, type PostTypeFilter } from "./postSettings";

export const usePostTypeFilter = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const postType = getPostTypeFilter(searchParams.get("type"));

    const setPostType = (type: PostTypeFilter) => {
        const params = new URLSearchParams(searchParams.toString());
        if (type === "all") params.delete("type");
        else params.set("type", type);
        params.delete("page");
        const query = params.toString();
        window.history.pushState(null, "", `${pathname}${query ? `?${query}` : ""}`);
    };

    return { postType, setPostType };
};
