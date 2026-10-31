"use client";

import React, { Fragment, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion, usePresence } from "motion/react";

import { PAGE_REVEAL_COVER_DURATION, PAGE_REVEAL_COVER_EASE, PAGE_REVEAL_UNCOVER_DURATION, PAGE_REVEAL_UNCOVER_EASE } from "@/shared/constants/pageTransition";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import { useServiceStore } from "@/shared/stores/useServiceStore";

import UI from "../common/UIComponent";
import IconComponent from "../common/IconComponent";

import useNavigate from "@/shared/hooks/useNavigate";
import { headerMenuList } from "@/shared/constants/lists/configServiceList";

const CLIP_MENU = {
    hidden: "inset(0 0 0 100%)",
    visible: "inset(0 0 0 0)",
    exit: "inset(0 0 0 100%)",
} as const;

const MobileMenu = () => {
    const reducedMotion = useReducedMotion();
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useLayoutStore();
    const { data: session } = useSession();
    const { pushToUrl, currentPathName } = useNavigate();
    const { reset } = useServiceStore();

    const logout = () => {
        signOut({ callbackUrl: "/login" });
        reset();
    };

    useEffect(() => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    }, [currentPathName]);

    return (
        <Fragment>
            {/* 모바일 메뉴 */}
            <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                    <motion.article
                        data-page-transition-fixed="sidebar"
                        className="mobile flex flex-col justify-center items-center gap-[1.6rem] fixed top-0 right-0 h-[100svh] bg-black z-[100000000]"
                        initial={{ clipPath: CLIP_MENU.hidden }}
                        animate={{ clipPath: CLIP_MENU.visible }}
                        exit={{
                            clipPath: CLIP_MENU.exit,
                            transition: {
                                duration: reducedMotion ? 0 : PAGE_REVEAL_UNCOVER_DURATION,
                                ease: PAGE_REVEAL_UNCOVER_EASE,
                            },
                        }}
                        transition={{
                            duration: reducedMotion ? 0 : PAGE_REVEAL_COVER_DURATION,
                            ease: PAGE_REVEAL_COVER_EASE,
                        }}
                    >
                        <SidebarTransitionPresence />
                        <UI.Button
                            className="hamburger w-full p-[2.0rem] flex items-center z-[10000]"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <IconComponent
                                type="graphic-arrow-up"
                                alt="나가기"
                                className="rotate-270 invert"
                                width={32}
                                height={32}
                            />
                            <p className="text-inherit text-[2.4rem]">Close.</p>
                        </UI.Button>
                        {/* 목록 */}
                        <section className="mobile-inner px-[2.4rem] py-[2.4rem] w-full h-full flex flex-col items-start justify-between">
                            <section className="flex flex-col items-start">

                                {headerMenuList.map((e, i) => (
                                    <div
                                        key={`${e}-${i}-${isMobileMenuOpen}`}
                                        className="h-[4.8rem] overflow-hidden"
                                    >
                                        <motion.div
                                            initial={{ y: "4.8rem" }}
                                            animate={{ y: "0rem" }}
                                            transition={{
                                                delay: reducedMotion ? 0 : 0.1 * (i + 1),
                                                duration: reducedMotion ? 0 : PAGE_REVEAL_COVER_DURATION,
                                                ease: PAGE_REVEAL_COVER_EASE,
                                            }}
                                        >
                                            <Item
                                                href={e.route}
                                                title={e.title}
                                            />
                                        </motion.div>
                                    </div>
                                ))}

                                <div
                                    key={`static-1-${isMobileMenuOpen}`}
                                    className="w-full h-auto overflow-hidden"
                                >
                                    <motion.div
                                        className="w-full bg-[#ffffff]/30 my-[1.6rem] h-[0.1rem]"
                                        initial={{ y: "4.8rem" }}
                                        animate={{ y: "0rem" }}
                                        transition={{
                                            delay: reducedMotion ? 0 : 0.1 * (headerMenuList.length + 1),
                                            duration: reducedMotion ? 0 : PAGE_REVEAL_COVER_DURATION,
                                            ease: PAGE_REVEAL_COVER_EASE,
                                        }}
                                    />
                                </div>

                                <div
                                    key={`static-2-${isMobileMenuOpen}`}
                                    className="h-[4.8rem] overflow-hidden"
                                >
                                    <motion.div
                                        initial={{ y: "4.8rem" }}
                                        animate={{ y: "0rem" }}
                                        transition={{
                                            delay: reducedMotion ? 0 : 0.1 * (headerMenuList.length + 2),
                                            duration: reducedMotion ? 0 : PAGE_REVEAL_COVER_DURATION,
                                            ease: PAGE_REVEAL_COVER_EASE,
                                        }}
                                    >
                                        {session ? (
                                            <UI.Button
                                                onClick={() => logout()}
                                                className="flex justify-center text-center gap-[0.4rem] w-full items-center text-[2.4rem] font-semibold whitespace-nowrap py-[1.2rem] text-[var(--color-text-primary)]"
                                            >
                                                로그아웃
                                            </UI.Button>
                                        ) : (
                                            <UI.Button
                                                onClick={() => pushToUrl("/login")}
                                                className="flex justify-center text-center gap-[0.4rem] w-full items-center text-[2.4rem] font-semibold whitespace-nowrap py-[1.2rem] text-[#ff4321]"
                                            >
                                                로그인
                                            </UI.Button>
                                        )}
                                    </motion.div>
                                </div>
                            </section>

                            <section className="flex justify-between items-end w-full">
                                <section className="flex flex-col gap-[1.6rem] items-start">
                                    <IconComponent
                                        type="graphic-logo-horizontal"
                                        alt="로고"
                                        height={72}
                                        width={72}
                                        className="invert"
                                    />

                                    <p className="text-[var(--color-text-primary)]">© kimsangjunv1. All rights reserved.</p>
                                </section>

                                <UI.Button
                                    className="flex items-center gap-[0.8rem]"
                                    onClick={() => pushToUrl("https://github.com/kimsangjunv1")}
                                >
                                    <IconComponent
                                        type="graphic-logo-github"
                                        alt="깃허브"
                                        width={32}
                                        className="invert"
                                    />
                                </UI.Button>
                            </section>
                        </section>
                        {/* 목록 END */}
                    </motion.article>
                ) : null}
            </AnimatePresence>
            {/* 모바일 메뉴 END */}
        </Fragment>
    );
};

const SidebarTransitionPresence = () => {
    const [isPresent, safeToRemove] = usePresence();
    const transitionPhase = useLayoutStore((state) => state.transitionPhase);

    useEffect(() => {
        // 전환 중 요소를 제거하면 브라우저가 본문 애니메이션도 중단해요.
        if (!isPresent && transitionPhase === "idle") safeToRemove?.();
    }, [isPresent, transitionPhase, safeToRemove]);

    return null;
};

const Item = ({ title, href }: { title: string; href: string }) => {
    const { pushToUrl } = useNavigate();
    const { setIsMobileMenuOpen } = useLayoutStore();
    return (
        <UI.Button
            type="button"
            className="flex justify-center text-center gap-[0.4rem] w-full items-center text-[2.4rem] whitespace-nowrap py-[1.2rem] text-[var(--color-text-primary)]"
            onClick={() => {
                setIsMobileMenuOpen(false);
                pushToUrl(href);
            }}
        >
            {title}
        </UI.Button>
    );
};

export default MobileMenu;
