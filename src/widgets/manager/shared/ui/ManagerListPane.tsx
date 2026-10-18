"use client";
import useManagerSelection from "../model/useManagerSelection";
import type { ReactNode } from "react";

type ManagerListPaneProps = {
    children: ReactNode;
    className?: string;
};

const ManagerListPane = ({ children, className = "" }: ManagerListPaneProps) => {
    const { selectedItem } = useManagerSelection();
    return (
        <section
            aria-label="관리 항목 목록"
            data-manager-pane="list"
            className={`min-h-0 min-w-0 overflow-y-auto border-r border-[var(--color-gray-300)] bg-[var(--color-gray-50)] ${selectedItem ? "hidden pc:block" : "block"} ${className}`}
        >
            {children}
        </section>
    );
};

export default ManagerListPane;
