"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";

import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { PAGE_REVEAL_COVER_DURATION, PAGE_REVEAL_COVER_EASE, PAGE_REVEAL_READY_TIMEOUT, PAGE_REVEAL_UNCOVER_DURATION, PAGE_REVEAL_UNCOVER_EASE } from "@/shared/constants/pageTransition";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import IconComponent from "./IconComponent";

const CLIP_FORWARD = {
    hidden: "inset(0 100% 0 0)",
    covered: "inset(0 0 0 0)",
    revealed: "inset(0 0 0 100%)",
} as const;

const CLIP_BACK = {
    hidden: "inset(0 0 0 100%)",
    covered: "inset(0 0 0 0)",
    revealed: "inset(0 100% 0 0)",
} as const;

const PageRevealOverlay = () => {
    const router = useRouter();
    const pathname = usePathname();
    const reducedMotion = useReducedMotion();
    const pathnameAtNavStart = useRef(pathname);
    const hasExecutedNavigation = useRef(false);
    const hasStartedInitialReveal = useRef(false);

    const {
        transitionPhase,
        transitionDirection,
        pendingNavigation,
        isPageContentVisible,
        pageReadinessBlockers,
        setTransitionPhase,
        setIsPageContentVisible,
        beginInitialReveal,
        completeRouteTransition,
        resetPageReadiness,
    } = useLayoutStore();

    const hasPageReadinessBlockers = Object.keys(pageReadinessBlockers).length > 0;

    const isForward = transitionDirection === "forward";
    const clip = isForward ? CLIP_FORWARD : CLIP_BACK;
    const isActive = transitionPhase !== "idle";
    const isInitialCovering = transitionPhase === "covering" && pendingNavigation === null;

    const executeNavigation = () => {
        if (!pendingNavigation) return;

        pathnameAtNavStart.current = pathname;

        const { type, url } = pendingNavigation;

        if (type === "push" && url) {
            router.push(url);
            return;
        }

        if (type === "replace" && url) {
            router.replace(url);
            return;
        }

        if (type === "back") {
            router.back();
        }
    };

    useEffect(() => {
        if (hasStartedInitialReveal.current) return;

        hasStartedInitialReveal.current = true;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReducedMotion) {
            setIsPageContentVisible(true);
            completeRouteTransition();
            return;
        }

        beginInitialReveal();
    }, [beginInitialReveal, completeRouteTransition, setIsPageContentVisible]);

    useEffect(() => {
        if (transitionPhase === "idle") {
            hasExecutedNavigation.current = false;
        }
    }, [transitionPhase]);

    useEffect(() => {
        if (transitionPhase !== "covering" || !pendingNavigation || !reducedMotion || hasExecutedNavigation.current) {
            return;
        }

        hasExecutedNavigation.current = true;
        executeNavigation();
        setTransitionPhase("navigating");
    }, [transitionPhase, pendingNavigation, reducedMotion, pathname, setTransitionPhase]);

    useEffect(() => {
        if (transitionPhase !== "navigating") return;

        if (pathname === pathnameAtNavStart.current) return;

        resetPageReadiness();

        if (reducedMotion) {
            setTransitionPhase("waiting");
            return;
        }

        setTransitionPhase("waiting");
    }, [pathname, transitionPhase, reducedMotion, setTransitionPhase, resetPageReadiness]);

    useEffect(() => {
        if (transitionPhase !== "waiting") return;
        if (hasPageReadinessBlockers) return;

        if (reducedMotion) {
            completeRouteTransition();
            return;
        }

        setTransitionPhase("revealing");
    }, [transitionPhase, hasPageReadinessBlockers, reducedMotion, setTransitionPhase, completeRouteTransition]);

    useEffect(() => {
        if (transitionPhase !== "waiting") return;

        const timer = window.setTimeout(() => {
            if (reducedMotion) {
                completeRouteTransition();
                return;
            }

            setTransitionPhase("revealing");
        }, PAGE_REVEAL_READY_TIMEOUT);

        return () => window.clearTimeout(timer);
    }, [transitionPhase, reducedMotion, setTransitionPhase, completeRouteTransition]);

    const clipTarget =
        transitionPhase === "covering" || transitionPhase === "waiting" || transitionPhase === "navigating" ? clip.covered : transitionPhase === "revealing" ? clip.revealed : clip.covered;

    const clipInitial = transitionPhase === "revealing" ? clip.covered : clip.hidden;

    const isCovering = transitionPhase === "covering";
    const duration = reducedMotion ? 0 : isCovering ? PAGE_REVEAL_COVER_DURATION : PAGE_REVEAL_UNCOVER_DURATION;
    const ease = isCovering ? PAGE_REVEAL_COVER_EASE : PAGE_REVEAL_UNCOVER_EASE;

    return (
        <>
            {!isPageContentVisible ? (
                <div
                    aria-hidden
                    className="fixed inset-0 z-[1000000000] bg-white pointer-events-none"
                />
            ) : null}

            {isActive ? (
                <motion.div
                    aria-hidden
                    className="fixed inset-0 z-[1000000001] bg-black pointer-events-auto flex items-center justify-center"
                    initial={{ clipPath: clipInitial }}
                    animate={{ clipPath: clipTarget }}
                    transition={{
                        duration,
                        ease,
                    }}
                    onAnimationComplete={() => {
                        if (reducedMotion) return;

                        if (transitionPhase === "covering" && !hasExecutedNavigation.current) {
                            if (pendingNavigation) {
                                hasExecutedNavigation.current = true;
                                executeNavigation();
                                setTransitionPhase("navigating");
                                return;
                            }

                            if (isInitialCovering) {
                                setIsPageContentVisible(true);
                                setTransitionPhase("revealing");
                            }

                            return;
                        }

                        if (transitionPhase === "revealing") {
                            completeRouteTransition();
                        }
                    }}
                >
                    <IconComponent
                        type="graphic-logo-horizontal"
                        alt="아지트"
                        width={256}
                        height={52}
                        // width={138}
                        // height={52}
                        className="invert"
                    />
                </motion.div>
            ) : null}
        </>
    );
};

export default PageRevealOverlay;
