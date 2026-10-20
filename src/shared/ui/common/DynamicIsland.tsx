"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type DynamicIslandProps = {
    children: ReactNode;
    ariaLabel: string;
    className?: string;
};

const CIRCLE_SIZE = 48;
const springTransition = { type: "spring", stiffness: 380, damping: 30, mass: 0.7 } as const;

const DynamicIsland = ({ children, ariaLabel, className = "" }: DynamicIslandProps) => {
    const reducedMotion = useReducedMotion();
    const contentRef = useRef<HTMLDivElement>(null);
    const [phase, setPhase] = useState<"drop" | "expand" | "ready">("drop");
    const [size, setSize] = useState({ width: CIRCLE_SIZE, height: CIRCLE_SIZE });
    const isExpanded = phase !== "drop";
    const isContentVisible = phase === "ready";

    useLayoutEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        const measure = () => {
            const width = Math.max(CIRCLE_SIZE, content.offsetWidth);
            const height = Math.max(CIRCLE_SIZE, content.offsetHeight);
            setSize((previous) => (previous.width === width && previous.height === height ? previous : { width, height }));
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(content);
        return () => observer.disconnect();
    }, []);

    return (
        <motion.div
            role="group"
            aria-label={ariaLabel}
            className={`overflow-hidden rounded-full bg-[var(--color-surface-floating)] text-[var(--color-text-primary)] shadow-[0_0.8rem_3.2rem_#00000026] ${className}`}
            initial={{ y: -80, opacity: 0, width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
            animate={{ y: 0, opacity: 1, width: isExpanded ? size.width : CIRCLE_SIZE, height: isExpanded ? size.height : CIRCLE_SIZE }}
            transition={reducedMotion ? { duration: 0 } : springTransition}
            onAnimationComplete={() => setPhase((current) => (current === "drop" ? "expand" : "ready"))}
        >
            <motion.div
                ref={contentRef}
                className="relative w-max max-w-[calc(100vw-2.4rem)] p-[0.8rem]"
                inert={!isContentVisible}
                aria-hidden={!isContentVisible}
                initial={false}
                animate={{ opacity: isContentVisible ? 1 : 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.15 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
};

export default DynamicIsland;
