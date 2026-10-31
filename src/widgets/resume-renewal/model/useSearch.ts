"use client";

import { useCallback, useState } from "react";

const useSearch = () => {
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(1);

    const reset = useCallback(() => {
        setKeyword("");
        setPage(1);
    }, []);

    const search = useCallback(() => {
        setPage(1);
    }, []);

    return {
        keyword,
        page,
        setKeyword,
        setPage,
        reset,
        search,
    };
};

export default useSearch;
