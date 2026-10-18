"use client";

import { motion } from "motion/react";

interface TextShimmerProps {
    children: string;
    as?: React.ElementType;
    className?: string;
    duration?: number; // seconds
    style?: React.CSSProperties;
    repeat?: number;
    color?: {
        start: string;
        end: string;
    };
}

const TextShimmer = ({
    children,
    as: Component = "span",
    className = "",
    style = {},
    color = {
        start: "var(--color-brand-500)",
        end: "rgba(0,0,0,1)",
    },
    repeat = Infinity,
    duration = 2,
}: TextShimmerProps) => {
    const MotionComponent = motion(Component);

    return (
        <MotionComponent
            className={`inline-block relative text-transparent bg-clip-text [background-size:200%_100%] ${className}`}
            initial={{ backgroundPosition: "-100% 0" }}
            animate={{ backgroundPosition: "100% 0" }}
            transition={{
                repeat,
                duration,
                ease: "linear",
            }}
            style={{
                ...style,
                backgroundImage: `linear-gradient(45deg, ${color.start} 0%, ${color.end} 50%, ${color.start} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
            }}
        >
            {children}
        </MotionComponent>
    );
};

export default TextShimmer;
