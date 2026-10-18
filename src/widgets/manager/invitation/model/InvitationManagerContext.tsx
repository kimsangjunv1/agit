"use client";
import { createContext, useContext, type ReactNode } from "react";
import useInvitationManager from "./useInvitationManager";
type InvitationManagerValue = ReturnType<typeof useInvitationManager>;
const Context = createContext<InvitationManagerValue | null>(null);
export function InvitationManagerPageProvider({ children }: { children: ReactNode }) {
    const value = useInvitationManager();
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useInvitationManagerProvider() {
    const value = useContext(Context);
    if (!value) throw new Error("useInvitationManagerProvider must be used within InvitationManagerPageProvider");
    return value;
}
