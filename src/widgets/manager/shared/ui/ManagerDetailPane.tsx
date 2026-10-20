"use client";

import type { ReactNode } from "react";

import useManagerSelection from "../model/useManagerSelection";

type ManagerDetailPaneProps = {
    children: ReactNode;
    className?: string;
};

const ManagerDetailPane = ({ children, className = "" }: ManagerDetailPaneProps) => {
    const { selectedItem, setSelectedItem } = useManagerSelection();

    return (
        <section
            aria-label="선택 항목 상세정보"
            data-manager-pane="detail"
            className={`min-h-0 min-w-0 overflow-y-auto bg-[var(--color-surface)] ${selectedItem ? "block" : "hidden pc:block"} ${className}`}
        >
            {selectedItem && (
                <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="m-[1.2rem] rounded-[0.8rem] border border-[var(--color-gray-300)] px-[1.2rem] py-[0.8rem] text-[1.2rem] text-[var(--color-gray-600)] pc:hidden"
                >
                    ← 목록
                </button>
            )}
            {children}
        </section>
    );
};

export default ManagerDetailPane;
