"use client";
import { createContext, useContext, type ReactNode } from "react";
import usePostManager from "./usePostManager";
type PostManagerValue = ReturnType<typeof usePostManager>;
const Context = createContext<PostManagerValue | null>(null);
export function PostManagerPageProvider({ children }: { children: ReactNode }) {
    const value = usePostManager();
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePostManagerProvider() {
    const value = useContext(Context);
    if (!value) throw new Error("usePostManagerProvider must be used within PostManagerPageProvider");
    return value;
}
