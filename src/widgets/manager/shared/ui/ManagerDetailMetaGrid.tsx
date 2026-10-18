import type { ReactNode } from "react";

export type ManagerDetailMetaItem = {
    label: string;
    value: ReactNode;
};

type ManagerDetailMetaGridProps = {
    items: ManagerDetailMetaItem[];
    className?: string;
};

const ManagerDetailMetaGrid = ({ items, className = "" }: ManagerDetailMetaGridProps) => {
    return (
        <dl className={`grid grid-cols-[minmax(8rem,12rem)_1fr] gap-x-[2.4rem] gap-y-[1.2rem] ${className}`}>
            {items.map((item) => (
                <div
                    key={item.label}
                    className="contents"
                >
                    <dt className="text-[1.2rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-500)]">{item.label}</dt>
                    <dd className="min-w-0 break-words text-[1.2rem] text-[var(--color-gray-800)]">{item.value}</dd>
                </div>
            ))}
        </dl>
    );
};

export default ManagerDetailMetaGrid;
