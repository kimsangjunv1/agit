import type { ReactNode } from "react";

type ManagerListPaneHeaderProps = {
    title: string;
    count?: number;
    description?: string;
    filter?: ReactNode;
    action?: ReactNode;
    className?: string;
};

const ManagerListPaneHeader = ({ title, count, description, filter, action, className = "" }: ManagerListPaneHeaderProps) => {
    return (
        <header className={`border-b border-[var(--color-gray-300)] bg-[var(--color-gray-50)] p-[2rem] ${className}`}>
            <div className="flex items-start justify-between gap-[1.6rem]">
                <div className="min-w-0">
                    <div className="flex items-center gap-[0.8rem]">
                        <h2 className="truncate text-[2rem] font-bold text-[var(--color-gray-900)]">{title}</h2>
                        {count !== undefined && <span className="shrink-0 text-[1.2rem] font-semibold tabular-nums text-[var(--color-gray-500)]">{count}</span>}
                    </div>
                    {description && <p className="mt-[0.4rem] text-[1.2rem] leading-[1.6] text-[var(--color-gray-500)]">{description}</p>}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
            {filter && <div className="mt-[1.6rem]">{filter}</div>}
        </header>
    );
};

export default ManagerListPaneHeader;
