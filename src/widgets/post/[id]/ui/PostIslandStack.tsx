"use client";

import { createContext, useContext, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";

const PostIslandVisibilityContext = createContext<boolean | null>(null);
const stackSpring = { type: "spring", stiffness: 380, damping: 30, mass: 0.7 } as const;

export const PostIslandStack = ({ children }: { children: ReactNode }) => {
    const isVisible = useLayoutStore((state) => state.isPageContentVisible && state.transitionPhase === "idle" && !state.isMobileMenuOpen);

    return (
        <PostIslandVisibilityContext.Provider value={isVisible}>
            <LayoutGroup>
                <div className="pointer-events-none fixed bottom-[calc(1.6rem+env(safe-area-inset-bottom))] left-1/2 z-[120] flex w-max -translate-x-1/2 flex-col items-center gap-[0.8rem] overflow-visible">
                    {children}
                </div>
            </LayoutGroup>
        </PostIslandVisibilityContext.Provider>
    );
};

type PostIslandSlotProps = {
    present: boolean;
    children: ReactNode;
};

export const PostIslandSlot = ({ present, children }: PostIslandSlotProps) => {
    const stackVisible = useContext(PostIslandVisibilityContext);
    const reducedMotion = useReducedMotion();

    if (stackVisible === null) {
        throw new Error("PostIslandSlot은 PostIslandStack 안에서만 사용할 수 있습니다.");
    }

    return (
        <AnimatePresence
            mode="popLayout"
            initial={false}
        >
            {present && stackVisible ? (
                <motion.div
                    key="slot"
                    layout="position"
                    initial={false}
                    exit={{ opacity: 0 }}
                    transition={{
                        layout: reducedMotion ? { duration: 0 } : stackSpring,
                        opacity: { duration: reducedMotion ? 0 : 0.15 },
                    }}
                    className="pointer-events-auto relative"
                >
                    {children}
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};
