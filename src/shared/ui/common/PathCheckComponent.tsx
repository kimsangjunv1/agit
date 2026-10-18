"use client";
import { type ReactNode, useEffect } from "react";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
const PathCheckComponent = ({ children }: { children: ReactNode }) => {
    const setIsMobile = useLayoutStore((state) => state.setIsMobile);
    useEffect(() => {
        const tablet = getComputedStyle(document.documentElement).getPropertyValue("--breakpoint-tablet").trim();
        const query = window.matchMedia(`(min-width: ${tablet})`);
        const update = () => setIsMobile(!query.matches);
        update();
        query.addEventListener("change", update);
        return () => query.removeEventListener("change", update);
    }, [setIsMobile]);
    return children;
};
export default PathCheckComponent;
