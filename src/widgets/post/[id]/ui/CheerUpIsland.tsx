"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";

import DynamicIsland from "@/shared/ui/common/DynamicIsland";
import { CheerUpIcon } from "@/shared/ui/common/CheerUpIcon";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import { usePostDetailProvider } from "../model/PostDetailContext";

const WORDS = ["좋아요!", "와우", "귿"] as const;
type CheerWord = { id: number; text: string; x: number; rise: number };

const CheerUpIsland = () => {
    const { bodyEndRef, scrollViewportRef, likeCount, cheer } = usePostDetailProvider();
    const isPageVisible = useLayoutStore((state) => state.isPageContentVisible && state.transitionPhase === "idle" && !state.isMobileMenuOpen);
    const reducedMotion = useReducedMotion();
    const pulse = useAnimationControls();
    const wordId = useRef(0);
    const [hasReachedEnd, setHasReachedEnd] = useState(false);
    const [words, setWords] = useState<CheerWord[]>([]);

    useEffect(() => {
        const viewport = scrollViewportRef.current;
        const end = bodyEndRef.current;
        if (!viewport || !end || hasReachedEnd) return;

        let frame = 0;
        const measure = () => {
            frame = 0;
            // 본문을 빠르게 지나쳐 댓글로 이동한 경우도 도달로 처리합니다.
            if (end.getBoundingClientRect().bottom <= viewport.getBoundingClientRect().bottom) setHasReachedEnd(true);
        };
        const scheduleMeasure = () => {
            if (!frame) frame = requestAnimationFrame(measure);
        };
        const observer = new ResizeObserver(scheduleMeasure);
        observer.observe(viewport);
        if (end.parentElement) observer.observe(end.parentElement);
        viewport.addEventListener("scroll", scheduleMeasure, { passive: true });
        scheduleMeasure();

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            viewport.removeEventListener("scroll", scheduleMeasure);
        };
    }, [bodyEndRef, scrollViewportRef, hasReachedEnd]);

    const handleCheer = () => {
        if (!cheer()) return;

        if (!reducedMotion) {
            pulse.stop();
            pulse.set({ scale: 0.9 });
            void pulse.start({ scale: [0.9, 1.06, 1], transition: { duration: 0.22, ease: "easeOut" } });
            const word = {
                id: ++wordId.current,
                text: WORDS[Math.floor(Math.random() * WORDS.length)],
                x: Math.random() * 100 - 50,
                rise: 36 + Math.random() * 28,
            };
            setWords((current) => [...current.slice(-23), word]);
        }
    };

    if (!hasReachedEnd || !isPageVisible) return null;

    return (
        <div className="fixed bottom-[calc(13.6rem+env(safe-area-inset-bottom))] left-1/2 z-[121] -translate-x-1/2">
            <div className="relative">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
                    {words.map((word) => (
                        <motion.span
                            key={word.id}
                            className="absolute left-1/2 top-0 whitespace-nowrap text-[8px] font-semibold leading-none text-[var(--color-text-primary)]"
                            initial={{ x: word.x, y: 8, opacity: 0 }}
                            animate={{ y: [8, -word.rise / 2, -word.rise], opacity: [0, 1, 0] }}
                            transition={{ duration: 0.65, ease: "easeOut" }}
                            onAnimationComplete={() => setWords((current) => current.filter((item) => item.id !== word.id))}
                        >
                            {word.text}
                        </motion.span>
                    ))}
                </div>
                <DynamicIsland ariaLabel="Cheer Up" placement="bottom">
                    <motion.button
                        type="button"
                        aria-label={`Cheer Up ${likeCount}회, 여러 번 응원하기`}
                        animate={pulse}
                        whileTap={reducedMotion ? undefined : { scale: 0.9 }}
                        className="flex h-[3.2rem] touch-manipulation select-none items-center gap-[0.8rem] rounded-full px-[1.2rem] text-[1.4rem] leading-none hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                        onClick={handleCheer}
                    >
                        <CheerUpIcon />
                        <span>Cheer Up</span>
                        <span className="tabular-nums text-[var(--color-text-muted)]">{likeCount}</span>
                    </motion.button>
                </DynamicIsland>
            </div>
        </div>
    );
};

export default CheerUpIsland;
