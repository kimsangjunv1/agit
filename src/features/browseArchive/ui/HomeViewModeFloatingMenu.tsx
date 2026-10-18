"use client";

import { motion } from "motion/react";

import { useLayoutStore } from "@/shared/stores/useLayoutStore";

import HomeViewModeNav from "./HomeViewModeNav";

const springTransition = {
    type: "spring" as const,
    mass: 0.1,
    stiffness: 100,
    damping: 10,
};

const HomeViewModeFloatingMenu = () => {
    const { isMobile } = useLayoutStore();

    if (!isMobile) {
        return null;
    }

    return (
        // <motion.nav
        //     aria-label="홈 뷰 모드 메뉴"
        //     className="fixed z-100 left-1/2 -translate-x-1/2 bottom-[calc(1.6rem+env(safe-area-inset-bottom))] flex items-center gap-[0.8rem] px-[2.0rem] py-[1.6rem] rounded-full bg-black backdrop-blur-md shadow-[var(--shadow-normal)] max-w-[calc(100dvw-3.2rem)]"
        //     initial={{ opacity: 0, y: "2rem", scale: 0.9 }}
        //     animate={{ opacity: 1, y: 0, scale: 1 }}
        //     transition={springTransition}
        // >
        // </motion.nav>
        <HomeViewModeNav variant="floating" />
    );
};

export default HomeViewModeFloatingMenu;
