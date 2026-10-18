"use client";

import { createContext, useContext, type ReactNode } from "react";

import useSearch from "./useSearch";

type HydrationPageContextValue = ReturnType<typeof useSearch>;

const HydrationPageContext = createContext<HydrationPageContextValue | null>(null);

export function HydrationPageProvider({ children }: { children: ReactNode }) {
    const search = useSearch();

    return <HydrationPageContext.Provider value={search}>{children}</HydrationPageContext.Provider>;
}

export function useHydrationProvider() {
    const context = useContext(HydrationPageContext);

    if (!context) {
        throw new Error("useHydrationProvider must be used within HydrationPageProvider");
    }

    return context;
}
