"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";

import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { PAGE_REVEAL_COVER_DURATION, PAGE_REVEAL_COVER_EASE, PAGE_REVEAL_READY_TIMEOUT, PAGE_REVEAL_UNCOVER_DURATION, PAGE_REVEAL_UNCOVER_EASE, PAGE_SLIDE_DURATION } from "@/shared/constants/pageTransition";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import { capturePageTransitionSnapshot } from "@/shared/lib/pageTransitionSnapshot";
import IconComponent from "./IconComponent";

const CLIP_FORWARD = {
    hidden: "inset(0 100% 0 0)",
    covered: "inset(0 0 0 0)",
    revealed: "inset(0 0 0 100%)",
} as const;

const PageRevealOverlay = () => {
    const router = useRouter();
    const pathname = usePathname();
    const reducedMotion = useReducedMotion();
    const lenis = useLenis();
    const pathnameAtNavStart = useRef(pathname);
    const hasExecutedNavigation = useRef(false);
    const hasStartedInitialReveal = useRef(false);
    const activeViewTransition = useRef<ViewTransition | null>(null);
    const outgoingSnapshot = useRef<HTMLDivElement | null>(null);

    const {
        transitionPhase,
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

    const clip = CLIP_FORWARD;
    const isInitialReveal = transitionPhase !== "idle" && pendingNavigation === null;
    const isInitialCovering = transitionPhase === "covering" && pendingNavigation === null;
    const isRouteTransitioning = pendingNavigation !== null;
    const isRoutePreparing = isRouteTransitioning && (transitionPhase === "covering" || transitionPhase === "navigating" || transitionPhase === "waiting");

    useEffect(() => {
        if (!lenis || !isRouteTransitioning) return;

        lenis.stop();
        return () => lenis.start();
    }, [lenis, isRouteTransitioning]);

    const finishTransition = useCallback(() => {
        outgoingSnapshot.current?.remove();
        outgoingSnapshot.current = null;
        activeViewTransition.current = null;
        const root = document.documentElement;
        delete root.dataset.pageTransition;
        delete root.dataset.pageTransitionPreparing;
        root.style.removeProperty("--page-slide-duration");
        completeRouteTransition();
    }, [completeRouteTransition]);

    const revealPage = useCallback(() => {
        if (!outgoingSnapshot.current || reducedMotion || !document.startViewTransition) {
            finishTransition();
            return;
        }

        setTransitionPhase("revealing");

        // 데이터 준비는 미리 마치고, 브라우저 전환 안에서는 화면만 교체해요.
        const transition = document.startViewTransition(() => {
            outgoingSnapshot.current?.remove();
            outgoingSnapshot.current = null;
            delete document.documentElement.dataset.pageTransitionPreparing;
        });
        activeViewTransition.current = transition;
        void transition.ready.catch(() => {});
        void transition.finished.then(finishTransition, finishTransition);
    }, [reducedMotion, setTransitionPhase, finishTransition]);

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
        if (transitionPhase !== "covering" || !pendingNavigation || hasExecutedNavigation.current) {
            return;
        }

        hasExecutedNavigation.current = true;

        if (!reducedMotion && typeof document.startViewTransition === "function") {
            outgoingSnapshot.current = capturePageTransitionSnapshot();
            if (outgoingSnapshot.current) {
                const root = document.documentElement;
                root.dataset.pageTransition = "slide";
                root.dataset.pageTransitionPreparing = "";
                root.style.setProperty("--page-slide-duration", `${PAGE_SLIDE_DURATION}s`);
            }
        }

        resetPageReadiness();
        setTransitionPhase("navigating");
        executeNavigation();
    }, [transitionPhase, pendingNavigation, reducedMotion, pathname, setTransitionPhase, resetPageReadiness]);

    useEffect(() => {
        if (transitionPhase !== "navigating") return;

        if (pathname === pathnameAtNavStart.current) return;

        setTransitionPhase("waiting");
    }, [pathname, transitionPhase, setTransitionPhase]);

    useEffect(() => {
        if (transitionPhase !== "waiting") return;
        if (hasPageReadinessBlockers) return;

        // 목적지의 layout effect에서 등록한 blocker까지 확인한 뒤 화면을 교체해요.
        const timer = window.setTimeout(() => {
            if (Object.keys(useLayoutStore.getState().pageReadinessBlockers).length === 0) {
                revealPage();
            }
        }, 0);

        return () => window.clearTimeout(timer);
    }, [transitionPhase, hasPageReadinessBlockers, revealPage]);

    useEffect(() => {
        if (transitionPhase !== "navigating" && transitionPhase !== "waiting") return;

        const timer = window.setTimeout(revealPage, PAGE_REVEAL_READY_TIMEOUT);

        return () => window.clearTimeout(timer);
    }, [transitionPhase, revealPage]);

    useEffect(
        () => () => {
            activeViewTransition.current?.skipTransition();
            outgoingSnapshot.current?.remove();
            delete document.documentElement.dataset.pageTransition;
            delete document.documentElement.dataset.pageTransitionPreparing;
            document.documentElement.style.removeProperty("--page-slide-duration");
        },
        [],
    );

    const clipTarget =
        transitionPhase === "covering" || transitionPhase === "waiting" || transitionPhase === "navigating" ? clip.covered : transitionPhase === "revealing" ? clip.revealed : clip.covered;

    const clipInitial = transitionPhase === "revealing" ? clip.covered : clip.hidden;

    const isCovering = transitionPhase === "covering";
    const duration = reducedMotion ? 0 : isCovering ? PAGE_REVEAL_COVER_DURATION : PAGE_REVEAL_UNCOVER_DURATION;
    const ease = isCovering ? PAGE_REVEAL_COVER_EASE : PAGE_REVEAL_UNCOVER_EASE;

    return (
        <>
            {/* 전환 도중 고정 레이어를 제거하면 본문 애니메이션도 중단돼요. */}
            <div
                data-page-transition-fixed="progress"
                className="fixed inset-x-0 top-0 z-[1000000002] h-[3px] overflow-hidden pointer-events-none"
            >
                <AnimatePresence initial={false}>
                    {isRoutePreparing ? (
                        <motion.div
                            key="page-progress"
                            role="progressbar"
                            aria-label="다음 페이지 준비 중"
                            className="h-full w-full"
                            exit={{ opacity: 0 }}
                            transition={{ delay: reducedMotion ? 0 : 0.15, duration: reducedMotion ? 0 : 0.15 }}
                        >
                            <motion.div
                                className="h-full w-full origin-left bg-[var(--color-brand-500)]"
                                initial={{ scaleX: 0.3, x: "0%" }}
                                animate={{ scaleX: 0.3, x: reducedMotion ? "0%" : ["0%", "100%"] }}
                                transition={{ x: { duration: 1.2, repeat: Infinity, ease: "linear" } }}
                                exit={{
                                    scaleX: 1,
                                    x: "0%",
                                    transition: { duration: reducedMotion ? 0 : 0.15, repeat: 0, ease: "easeOut" },
                                }}
                            />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            {!isPageContentVisible ? (
                <div
                    aria-hidden
                    className="fixed inset-0 z-[1000000000] bg-[var(--color-background-light)] pointer-events-none"
                />
            ) : null}

            {isInitialReveal ? (
                <motion.div
                    aria-hidden
                    className="fixed inset-0 z-[1000000001] bg-[var(--color-surface-floating)] pointer-events-auto flex items-center justify-center"
                    initial={{ clipPath: clipInitial }}
                    animate={{ clipPath: clipTarget }}
                    transition={{
                        duration,
                        ease,
                    }}
                    onAnimationComplete={() => {
                        if (reducedMotion) return;

                        if (transitionPhase === "covering" && !hasExecutedNavigation.current) {
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
