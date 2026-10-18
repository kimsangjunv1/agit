"use client";

const ManagerListSkeleton = ({ count = 3 }: { count?: number }) => (
    <div className="flex flex-col w-full gap-[1.2rem]">
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className="h-[8rem] w-full rounded-[1.2rem] bg-[var(--color-gray-100)] animate-pulse"
            />
        ))}
    </div>
);

export default ManagerListSkeleton;
