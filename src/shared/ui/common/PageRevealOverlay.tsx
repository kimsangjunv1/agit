"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";

import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import {
    PAGE_REVEAL_COVER_DURATION,
    PAGE_REVEAL_COVER_EASE,
    PAGE_REVEAL_LOGO_READY_HOLD,
    PAGE_REVEAL_LOGO_SPIN_DURATION,
    PAGE_REVEAL_LOGO_SPIN_EASE,
    PAGE_REVEAL_LOGO_STEP_DEG,
    PAGE_REVEAL_LOGO_STEP_INTERVAL,
    PAGE_REVEAL_READY_SETTLE_MS,
    PAGE_REVEAL_READY_TIMEOUT,
    PAGE_REVEAL_UNCOVER_DURATION,
    PAGE_REVEAL_UNCOVER_EASE,
    PAGE_SLIDE_DURATION,
} from "@/shared/constants/pageTransition";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import { capturePageTransitionSnapshot } from "@/shared/lib/pageTransitionSnapshot";
import IconComponent from "./IconComponent";
import PageLoadProgress from "./PageLoadProgress";

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
    const hasFinishedInitialReady = useRef(false);
    const pendingLogoReady = useRef(false);
    const logoStepTimerRef = useRef<number | null>(null);
    const activeViewTransition = useRef<ViewTransition | null>(null);
    const outgoingSnapshot = useRef<HTMLDivElement | null>(null);
    const [isInitialLogoReady, setIsInitialLogoReady] = useState(false);
    const [logoRotateDeg, setLogoRotateDeg] = useState(PAGE_REVEAL_LOGO_STEP_DEG);

    const {
        transitionPhase,
        pendingNavigation,
        isPageContentVisible,
        pageReadinessBlockers,
        pageReadinessTasks,
        pageReadinessId,
        isPageReadinessComplete,
        setTransitionPhase,
        setIsPageContentVisible,
        beginInitialReveal,
        completeRouteTransition,
        resetPageReadiness,
        completePageReadiness,
    } = useLayoutStore();

    const hasPageReadinessBlockers = Object.keys(pageReadinessBlockers).length > 0;

    const clip = CLIP_FORWARD;
    const isInitialReveal = transitionPhase !== "idle" && pendingNavigation === null;
    const isInitialCovering = transitionPhase === "covering" && pendingNavigation === null;
    const isRouteTransitioning = pendingNavigation !== null;
    const isRoutePreparing = isRouteTransitioning && (transitionPhase === "covering" || transitionPhase === "navigating" || transitionPhase === "waiting");
    const shouldSpinLogo = isInitialReveal && !isInitialLogoReady && !reducedMotion;

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
        completePageReadiness();

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
    }, [reducedMotion, setTransitionPhase, finishTransition, completePageReadiness]);

    const finishInitialReady = useCallback(() => {
        if (hasFinishedInitialReady.current) return;
        if (useLayoutStore.getState().pendingNavigation !== null) return;

        hasFinishedInitialReady.current = true;
        completePageReadiness();

        // 돌고 있던 한 바퀴는 끝까지 마친 뒤 색을 바꿔요.
        if (reducedMotion) {
            setIsInitialLogoReady(true);
            return;
        }

        pendingLogoReady.current = true;
    }, [completePageReadiness, reducedMotion]);

    const completeReadyPhase = useCallback(() => {
        if (useLayoutStore.getState().pendingNavigation === null) {
            finishInitialReady();
            return;
        }

        revealPage();
    }, [finishInitialReady, revealPage]);

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

        // task가 아직 없으면 마운트·등록 타이밍을 잠깐 기다리고, 있으면 바로 확인해요.
        const hasReadinessTasks = Object.keys(pageReadinessTasks).length > 0;
        const timer = window.setTimeout(
            () => {
                if (Object.keys(useLayoutStore.getState().pageReadinessBlockers).length === 0) {
                    completeReadyPhase();
                }
            },
            hasReadinessTasks ? 0 : PAGE_REVEAL_READY_SETTLE_MS,
        );

        return () => window.clearTimeout(timer);
    }, [transitionPhase, hasPageReadinessBlockers, pageReadinessTasks, completeReadyPhase]);

    useEffect(() => {
        if (transitionPhase !== "navigating" && transitionPhase !== "waiting") return;

        // blocker가 남아 있으면 이미지·데이터 실측을 우선하고, 신호 없이 멈춘 경우만 강제 종료해요.
        const timer = window.setTimeout(() => {
            const state = useLayoutStore.getState();
            if (state.transitionPhase === "waiting" && Object.keys(state.pageReadinessBlockers).length > 0) {
                return;
            }

            completeReadyPhase();
        }, PAGE_REVEAL_READY_TIMEOUT);

        return () => window.clearTimeout(timer);
    }, [transitionPhase, completeReadyPhase]);

    useEffect(() => {
        if (!isInitialLogoReady) return;
        if (transitionPhase !== "waiting") return;
        if (pendingNavigation !== null) return;

        const timer = window.setTimeout(
            () => {
                setTransitionPhase("revealing");
            },
            reducedMotion ? 0 : PAGE_REVEAL_LOGO_READY_HOLD * 1000,
        );

        return () => window.clearTimeout(timer);
    }, [isInitialLogoReady, transitionPhase, pendingNavigation, reducedMotion, setTransitionPhase]);

    useEffect(
        () => () => {
            if (logoStepTimerRef.current !== null) {
                window.clearTimeout(logoStepTimerRef.current);
            }
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
    const duration = reducedMotion ? 0 : isCovering ? PAGE_REVEAL_COVER_DURATION : transitionPhase === "revealing" ? PAGE_REVEAL_UNCOVER_DURATION : 0;
    const ease = isCovering ? PAGE_REVEAL_COVER_EASE : PAGE_REVEAL_UNCOVER_EASE;

    return (
        <>
            {/* 전환 도중 고정 레이어를 제거하면 본문 애니메이션도 중단돼요. */}
            <div
                data-page-transition-fixed="progress"
                className="fixed inset-x-0 top-0 z-[1000000002] h-[0.4rem] overflow-hidden pointer-events-none"
            >
                <AnimatePresence
                    initial={false}
                    custom={isPageReadinessComplete}
                >
                    {isRoutePreparing ? (
                        <PageLoadProgress
                            key={pageReadinessId}
                            reducedMotion={reducedMotion}
                        />
                    ) : null}
                </AnimatePresence>
            </div>

            {!isPageContentVisible ? (
                <div
                    aria-hidden
                    className="fixed inset-0 z-[1000000000] bg-[##000000] pointer-events-none"
                />
            ) : null}

            {isInitialReveal ? (
                <motion.div
                    aria-hidden
                    className="fixed inset-0 z-[1000000001] bg-[#000000] pointer-events-auto flex items-center justify-center"
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
                                resetPageReadiness();
                                setTransitionPhase("waiting");
                            }

                            return;
                        }

                        if (transitionPhase === "revealing") {
                            completeRouteTransition();
                        }
                    }}
                >
                    <motion.div
                        className="flex items-center justify-center"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: logoRotateDeg }}
                        transition={
                            shouldSpinLogo
                                ? {
                                      duration: PAGE_REVEAL_LOGO_SPIN_DURATION,
                                      ease: PAGE_REVEAL_LOGO_SPIN_EASE,
                                  }
                                : { duration: 0 }
                        }
                        onAnimationComplete={() => {
                            if (!shouldSpinLogo) return;

                            if (pendingLogoReady.current) {
                                setIsInitialLogoReady(true);
                                return;
                            }

                            const holdMs = Math.max(0, (PAGE_REVEAL_LOGO_STEP_INTERVAL - PAGE_REVEAL_LOGO_SPIN_DURATION) * 1000);
                            if (logoStepTimerRef.current !== null) {
                                window.clearTimeout(logoStepTimerRef.current);
                            }
                            logoStepTimerRef.current = window.setTimeout(() => {
                                logoStepTimerRef.current = null;
                                if (pendingLogoReady.current) {
                                    setIsInitialLogoReady(true);
                                    return;
                                }
                                setLogoRotateDeg((deg) => deg + PAGE_REVEAL_LOGO_STEP_DEG);
                            }, holdMs);
                        }}
                    >
                        <IconComponent
                            type="graphic-logo-horizontal"
                            alt="아지트"
                            width={256}
                            height={52}
                            className={`transition-colors duration-300 ${isInitialLogoReady ? "text-[#ff4321]" : "text-white"}`}
                        />
                    </motion.div>
                </motion.div>
            ) : null}
        </>
    );
};

export default PageRevealOverlay;
