"use client";

import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import useNavigate from "@/shared/hooks/useNavigate";

const useManagerSelection = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { replaceToUrl } = useNavigate();
    const selectedItem = searchParams.get("item");

    const setSelectedItem = useCallback(
        (item: string | number | null) => {
            const nextSearchParams = new URLSearchParams(searchParams.toString());

            if (item === null) {
                nextSearchParams.delete("item");
            } else {
                nextSearchParams.set("item", String(item));
            }

            const query = nextSearchParams.toString();
            replaceToUrl(query ? `${pathname}?${query}` : pathname, false);
        },
        [pathname, replaceToUrl, searchParams],
    );

    return { selectedItem, setSelectedItem };
};

export default useManagerSelection;
