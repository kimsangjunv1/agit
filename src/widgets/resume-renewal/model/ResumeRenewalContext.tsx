"use client";

import { createContext, useContext, type ReactNode } from "react";

import useResumeRenewalScroll from "./useResumeRenewalScroll";

type ResumeRenewalPageContextValue = ReturnType<typeof useResumeRenewalScroll>;

const ResumeRenewalPageContext = createContext<ResumeRenewalPageContextValue | null>(null);

export function ResumeRenewalPageProvider({ children }: { children: ReactNode }) {
    const scroll = useResumeRenewalScroll();

    return <ResumeRenewalPageContext.Provider value={scroll}>{children}</ResumeRenewalPageContext.Provider>;
}

export function useResumeRenewalProvider() {
    const context = useContext(ResumeRenewalPageContext);

    if (!context) {
        throw new Error("useResumeRenewalProvider must be used within ResumeRenewalPageProvider");
    }

    return context;
}
