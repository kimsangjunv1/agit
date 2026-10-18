"use client";

import { ReactNode } from "react";

import Modal from "@/shared/ui/layout/Modal";

export default function PopupProvider({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
            <Modal />
        </>
    );
}
