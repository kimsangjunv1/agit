"use client";
import { createContext, useContext, type ReactNode } from "react";
import type usePostDetail from "./usePostDetail";
type Value = ReturnType<typeof usePostDetail>;
const Context = createContext<Value | null>(null);
export function PostDetailPageProvider({ children, value }: { children: ReactNode; value: Value }) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePostDetailProvider() {
    const value = useContext(Context);
    if (!value) throw new Error("usePostDetailProvider must be used within PostDetailPageProvider");
    return value;
}
