"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, usePresence, usePresenceData } from "motion/react";

import { getPageReadinessProgress, useLayoutStore } from "@/shared/stores/useLayoutStore";

const INTRO_PROGRESS = 0.3;
const INTRO_DURATION = 0.8;

const PageLoadProgress = ({ reducedMotion }: { reducedMotion: boolean }) => {
    const tasks = useLayoutStore((state) => state.pageReadinessTasks);
    const phase = useLayoutStore((state) => state.transitionPhase);
    const [isPresent, safeToRemove] = usePresence();
    const completion = Boolean(usePresenceData());
    const [completionAtExit, setCompletionAtExit] = useState<boolean | null>(null);
    const isComplete = completionAtExit ?? completion;
    const [progress, setProgress] = useState(INTRO_PROGRESS);
    const [introComplete, setIntroComplete] = useState(false);
    const [percentage, setPercentage] = useState(0);
    const scale = useMotionValue(0);
    const opacity = useMotionValue(1);

    useMotionValueEvent(scale, "change", (value) => setPercentage(Math.round(value * 100)));

    useEffect(() => {
        let cancelled = false;
        const animation = animate(scale, Math.max(scale.get(), INTRO_PROGRESS), { duration: reducedMotion ? 0 : INTRO_DURATION, ease: "easeOut" });
        void animation.then(() => {
            if (!cancelled) setIntroComplete(true);
        });

        return () => {
            cancelled = true;
            animation.stop();
        };
    }, [scale, reducedMotion]);

    useEffect(() => {
        if (!isPresent) setCompletionAtExit((current) => current ?? completion);
    }, [isPresent, completion]);

    useEffect(() => {
        if (!isPresent) return;

        // 같은 화면에서 등록하는 데이터·이미지 작업을 모은 후 완료 비율을 반영해요.
        const frame = requestAnimationFrame(() => {
            const state = useLayoutStore.getState();
            if (!Object.values(state.pageReadinessTasks).some((task) => task.ready)) return;

            const next = Math.min(0.99, INTRO_PROGRESS + (1 - INTRO_PROGRESS) * getPageReadinessProgress(state));
            setProgress((current) => Math.max(current, next));
        });

        return () => cancelAnimationFrame(frame);
    }, [tasks, phase, isPresent]);

    useEffect(() => {
        // 첫 준비 신호나 완료 신호가 오면 초반 애니메이션을 기다리지 않고 바로 이어가요.
        if (!introComplete && progress === INTRO_PROGRESS && !isComplete && isPresent) return;

        let cancelled = false;
        let fade: ReturnType<typeof animate> | undefined;
        const target = isPresent ? progress : isComplete ? 1 : scale.get();
        const animation = animate(scale, target, { duration: reducedMotion || (!isPresent && !isComplete) ? 0 : 0.3, ease: "easeOut" });

        void animation.then(() => {
            if (cancelled || isPresent) return;

            fade = animate(opacity, 0, {
                delay: reducedMotion || !isComplete ? 0 : 0.12,
                duration: reducedMotion ? 0 : 0.15,
                onComplete: () => {
                    if (!cancelled) safeToRemove?.();
                },
            });
        });

        return () => {
            cancelled = true;
            animation.stop();
            fade?.stop();
        };
    }, [introComplete, progress, isPresent, isComplete, reducedMotion, scale, opacity, safeToRemove]);

    return (
        <motion.div
            role="progressbar"
            aria-label="페이지 준비 진행률"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            className="absolute inset-0 h-full w-full bg-[var(--color-border)]"
            style={{ opacity }}
        >
            <motion.div
                className="h-full w-full origin-left bg-[#ff4321]"
                style={{ scaleX: scale }}
            />
        </motion.div>
    );
};

export default PageLoadProgress;
