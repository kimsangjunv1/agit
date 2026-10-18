"use client";
import { createContext, useContext, type ReactNode } from "react";
import useCommentManager from "./useCommentManager";
type CommentManagerValue = ReturnType<typeof useCommentManager>;
const Context = createContext<CommentManagerValue | null>(null);
export function CommentManagerPageProvider({ children }: { children: ReactNode }) {
    const value = useCommentManager();
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCommentManagerProvider() {
    const value = useContext(Context);
    if (!value) throw new Error("useCommentManagerProvider must be used within CommentManagerPageProvider");
    return value;
}
