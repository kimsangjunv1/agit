"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface MainProps {
    children: ReactNode;
    id?: string;
    className?: {
        container: string;
        inner: string;
    };
}

const Main = ({ children, id = "main", className }: MainProps) => {
    const pathname = usePathname();
    const containerClass = className?.container || "";
    const innerClass = className?.inner || "";

    return (
        <main
            id={id}
            className={`${containerClass} w-full min-h-[100svh] mx-auto`}
        >
            <div
                className={`main-inner ${innerClass} min-h-[100svh] m-auto w-full flex flex-col items-start justify-between flex-1`}
                key={pathname}
            >
                {children}
            </div>
        </main>
    );
};

export default Main;
