"use client";

import { createContext, useContext, type ReactNode } from "react";

import useSearch from "./useSearch";

type FivepixelsPageContextValue = ReturnType<typeof useSearch>;

const FivepixelsPageContext = createContext<FivepixelsPageContextValue | null>(null);

export function FivepixelsPageProvider({ children }: { children: ReactNode }) {
    const search = useSearch();

    return <FivepixelsPageContext.Provider value={search}>{children}</FivepixelsPageContext.Provider>;
}

export function useFivepixelsProvider() {
    const context = useContext(FivepixelsPageContext);

    if (!context) {
        throw new Error("useFivepixelsProvider must be used within FivepixelsPageProvider");
    }

    return context;
}
