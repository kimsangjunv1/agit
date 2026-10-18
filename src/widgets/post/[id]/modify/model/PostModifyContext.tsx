"use client";
import { createContext, useContext, type ReactNode } from "react";
import usePostModify from "./usePostModify";
const Context = createContext<ReturnType<typeof usePostModify> | null>(null);
export function PostModifyPageProvider({ children, id }: { children: ReactNode; id: string }) {
    const value = usePostModify(id);
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePostModifyProvider() {
    const value = useContext(Context);
    if (!value) throw new Error("usePostModifyProvider must be used within PostModifyPageProvider");
    return value;
}
