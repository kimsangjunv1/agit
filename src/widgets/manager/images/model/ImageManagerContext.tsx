"use client";
import { createContext, useContext, type ReactNode } from "react";
import useImageManager from "./useImageManager";
type ImageManagerValue = ReturnType<typeof useImageManager>;
const Context = createContext<ImageManagerValue | null>(null);
export function ImageManagerPageProvider({ children }: { children: ReactNode }) {
    const value = useImageManager();
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useImageManagerProvider() {
    const value = useContext(Context);
    if (!value) throw new Error("useImageManagerProvider must be used within ImageManagerPageProvider");
    return value;
}
