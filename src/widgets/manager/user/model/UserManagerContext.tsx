"use client";
import { createContext, useContext, type ReactNode } from "react";
import useUserManager from "./useUserManager";
type UserManagerValue = ReturnType<typeof useUserManager>;
const Context = createContext<UserManagerValue | null>(null);
export function UserManagerPageProvider({ children }: { children: ReactNode }) {
    const value = useUserManager();
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useUserManagerProvider() {
    const value = useContext(Context);
    if (!value) throw new Error("useUserManagerProvider must be used within UserManagerPageProvider");
    return value;
}
