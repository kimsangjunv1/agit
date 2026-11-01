"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { useLayoutStore } from "@/shared/stores/useLayoutStore";

import { useResumeRenewalProvider } from "../model/ResumeRenewalContext";

const MASCOT_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

const StickyMascot = () => {
    const { isFirstSectionVisible } = useResumeRenewalProvider();
    const reducedMotion = useReducedMotion();
    const canShowPage = useLayoutStore((state) => state.isPageContentVisible && state.transitionPhase === "idle" && !state.isMobileMenuOpen);
    const shouldShow = canShowPage && !isFirstSectionVisible;

    return (
        <div className="pointer-events-none fixed right-[1.6rem] bottom-0 z-[110] w-[min(28vw,18rem)]">
            <AnimatePresence>
                {shouldShow ? (
                    <motion.div
                        key="sticky-mascot"
                        aria-hidden
                        className="relative w-full"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <motion.div
                            className="relative z-0"
                            variants={{
                                hidden: { y: "120%" },
                                visible: { y: 0 },
                            }}
                            transition={{
                                duration: reducedMotion ? 0 : 0.55,
                                ease: MASCOT_REVEAL_EASE,
                            }}
                        >
                            <Image
                                src="/images/picture/img-resume-renewal-mascot-sticky.svg"
                                alt=""
                                width={512}
                                height={512}
                                priority={false}
                                className="h-auto w-full select-none"
                            />
                        </motion.div>
                        <motion.img
                            src="/images/picture/img-resume-renewal-mascot-sticky-hands.svg"
                            alt=""
                            width={356}
                            height={107}
                            draggable={false}
                            className="absolute bottom-0 left-1/2 z-10 h-auto w-[62%] -translate-x-1/2 select-none"
                            variants={{
                                hidden: { y: "160%" },
                                visible: { y: "48%" },
                            }}
                            transition={{
                                duration: reducedMotion ? 0 : 0.78,
                                ease: MASCOT_REVEAL_EASE,
                                delay: reducedMotion ? 0 : 0.06,
                            }}
                        />
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

export default StickyMascot;
