import type { ReactNode } from "react";

type ManagerDetailPaneHeaderProps = {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
};

const ManagerDetailPaneHeader = ({ title, description, action, className = "" }: ManagerDetailPaneHeaderProps) => {
    return (
        <header className={`flex items-start justify-between gap-[2rem] border-b border-[var(--color-gray-300)] p-[2.4rem] ${className}`}>
            <div className="min-w-0">
                <p className="text-[1.2rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Detail</p>
                <h2 className="mt-[0.8rem] break-words text-[2.4rem] font-bold text-[var(--color-gray-900)]">{title}</h2>
                {description && <p className="mt-[0.8rem] text-[1.2rem] leading-[1.7] text-[var(--color-gray-500)]">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </header>
    );
};

export default ManagerDetailPaneHeader;
