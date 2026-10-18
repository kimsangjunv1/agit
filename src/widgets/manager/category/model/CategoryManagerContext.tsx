"use client";
import { createContext, useContext, type ReactNode } from "react";
import useCategoryManager from "./useCategoryManager";
type CategoryManagerValue = ReturnType<typeof useCategoryManager>;
const Context = createContext<CategoryManagerValue | null>(null);
export function CategoryManagerPageProvider({ children }: { children: ReactNode }) {
    const value = useCategoryManager();
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCategoryManagerProvider() {
    const value = useContext(Context);
    if (!value) throw new Error("useCategoryManagerProvider must be used within CategoryManagerPageProvider");
    return value;
}
