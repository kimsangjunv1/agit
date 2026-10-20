"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ManagerListItemCardProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    children: ReactNode;
    isSelected?: boolean;
};

const ManagerListItemCard = ({ children, className = "", isSelected = false, type = "button", ...props }: ManagerListItemCardProps) => {
    return (
        <button
            {...props}
            type={type}
            aria-pressed={isSelected}
            className={`w-full rounded-[0.8rem] border p-[1.2rem] text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-500)] ${
                isSelected ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]" : "border-[var(--color-gray-300)] bg-[var(--color-surface)] hover:border-[var(--color-gray-400)]"
            } ${className}`}
        >
            {children}
        </button>
    );
};

export default ManagerListItemCard;
