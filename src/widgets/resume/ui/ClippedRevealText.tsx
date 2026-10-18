"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";

import { RENEWAL_REVEAL_EASE } from "@/entities/resume/constants/resumeRenewalData";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";

type ClippedRevealBlockProps = {
    children: ReactNode;
    revealed: boolean;
    delay?: number;
    className?: string;
};

const CLIP_HIDDEN = "inset(0 100% 0 0)";
const CLIP_VISIBLE = "inset(0 0 0 0)";

/** clip reveal — clip-path로 다줄 텍스트 높이에 맞게 클리핑 */
export const ClippedRevealBlock = ({ children, revealed, delay = 0, className = "" }: ClippedRevealBlockProps) => {
    const reducedMotion = useReducedMotion();
    const visible = reducedMotion || revealed;

    return (
        <div className={`shrink-0 ${className}`}>
            <motion.div
                initial={false}
                animate={visible ? { clipPath: CLIP_VISIBLE, x: 0 } : { clipPath: CLIP_HIDDEN, x: "100%" }}
                transition={{
                    duration: reducedMotion ? 0 : visible ? 0.85 : 0.45,
                    ease: RENEWAL_REVEAL_EASE,
                    delay: visible ? delay : 0,
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};

const ClippedRevealText = ClippedRevealBlock;

export default ClippedRevealText;
