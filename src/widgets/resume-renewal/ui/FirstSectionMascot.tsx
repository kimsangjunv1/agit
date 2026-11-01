"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

import { useLayoutStore } from "@/shared/stores/useLayoutStore";

const MASCOT_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const MASCOT_BACK_ARM_MAX_DEG = 55;
const MASCOT_FRONT_ARM_MAX_DEG = 25;
const MASCOT_FACE_MAX_DEG = 10;
const MASCOT_ANGLE_SOFTNESS = 1.15;

const mapSoftAngle = (normalized: number, maxDeg: number) => maxDeg * Math.tanh(normalized * MASCOT_ANGLE_SOFTNESS);

const FirstSectionMascot = ({ isSectionVisible }: { isSectionVisible: boolean }) => {
    const bodyRef = useRef<HTMLDivElement | null>(null);
    const reducedMotion = useReducedMotion();
    const canPlayIntro = useLayoutStore((state) => state.isPageContentVisible && state.transitionPhase === "idle");
    const introHidden = { y: "100%" };
    const introVisible = { y: 0 };
    const shouldRise = canPlayIntro && isSectionVisible;
    const backArmTarget = useMotionValue(0);
    const faceTarget = useMotionValue(0);
    const frontArmTarget = useMotionValue(0);
    // 뒤팔(가장 빠름) → 얼굴 → 앞팔(가장 느림)
    const backArmRotate = useSpring(backArmTarget, {
        stiffness: reducedMotion ? 1000 : 150,
        damping: reducedMotion ? 80 : 22,
        mass: 0.42,
    });
    const faceRotate = useSpring(faceTarget, {
        stiffness: reducedMotion ? 1000 : 145,
        damping: reducedMotion ? 80 : 25,
        mass: 0.55,
    });
    const frontArmRotate = useSpring(frontArmTarget, {
        stiffness: reducedMotion ? 1000 : 95,
        damping: reducedMotion ? 80 : 28,
        mass: 0.72,
    });

    useEffect(() => {
        if (reducedMotion) {
            backArmTarget.set(0);
            faceTarget.set(0);
            frontArmTarget.set(0);
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            const body = bodyRef.current;
            if (!body) return;

            const bounds = body.getBoundingClientRect();
            const centerX = bounds.left + bounds.width * 0.42;
            const normalized = (event.clientX - centerX) / Math.max(bounds.width * 0.75, 1);
            backArmTarget.set(mapSoftAngle(normalized, MASCOT_BACK_ARM_MAX_DEG));
            faceTarget.set(mapSoftAngle(normalized, MASCOT_FACE_MAX_DEG));
            frontArmTarget.set(mapSoftAngle(normalized, MASCOT_FRONT_ARM_MAX_DEG));
        };

        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        return () => window.removeEventListener("pointermove", handlePointerMove);
    }, [backArmTarget, faceTarget, frontArmTarget, reducedMotion]);

    return (
        <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 left-[-72px] bottom-[-72px] z-0 flex justify-start"
            initial={reducedMotion ? false : introHidden}
            animate={shouldRise ? introVisible : introHidden}
            transition={{
                duration: reducedMotion ? 0 : 0.9,
                ease: MASCOT_REVEAL_EASE,
            }}
        >
            <div
                ref={bodyRef}
                className="relative w-[50%] select-none"
            >
                <motion.img
                    src="/images/picture/img-resume-renewal-mascot-hand-back.svg"
                    alt=""
                    width={127}
                    height={128}
                    draggable={false}
                    className="absolute bottom-[30%] left-[60%] z-0 h-auto w-[38%] origin-bottom"
                    style={{ rotate: backArmRotate }}
                />
                <motion.div
                    className="relative z-[1] absolute bottom-[-10%] left-[-10%]"
                    // className="relative z-[1] origin-bottom"
                    style={{ rotate: faceRotate }}
                >
                    <Image
                        src="/images/picture/img-resume-renewal-mascot.svg"
                        alt=""
                        width={369}
                        height={319}
                        priority
                        className="h-auto w-full"
                    />
                </motion.div>
                <motion.img
                    src="/images/picture/img-resume-renewal-mascot-hand-front.svg"
                    alt=""
                    width={127}
                    height={125}
                    draggable={false}
                    className="absolute bottom-[4%] left-[40%] z-[2] h-auto w-[40%] origin-bottom"
                    style={{ rotate: frontArmRotate }}
                />
            </div>
        </motion.div>
    );
};

export default FirstSectionMascot;
