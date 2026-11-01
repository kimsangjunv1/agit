"use client";
import { createContext, useContext, type ReactNode } from "react";
import usePostTypeManager from "./usePostTypeManager";
type PostTypeManagerValue = ReturnType<typeof usePostTypeManager>;
const Context = createContext<PostTypeManagerValue | null>(null);
export function PostTypeManagerPageProvider({ children }: { children: ReactNode }) {
    const value = usePostTypeManager();
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePostTypeManagerProvider() {
    const value = useContext(Context);
    if (!value) throw new Error("usePostTypeManagerProvider must be used within PostTypeManagerPageProvider");
    return value;
}
