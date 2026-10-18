"use client";
import { createContext, useContext, type ReactNode } from "react";
import usePostCreate from "./usePostCreate";
const Context = createContext<ReturnType<typeof usePostCreate> | null>(null);
export function PostCreatePageProvider({ children }: { children: ReactNode }) {
    const value = usePostCreate();
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePostCreateProvider() {
    const value = useContext(Context);
    if (!value) throw new Error("usePostCreateProvider must be used within PostCreatePageProvider");
    return value;
}
