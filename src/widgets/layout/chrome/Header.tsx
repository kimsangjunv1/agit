"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import UI from "@/shared/ui/common/UIComponent";
import IconComponent from "@/shared/ui/common/IconComponent";
import TextShimmer from "@/shared/ui/common/TextShimmerComponent";

import useNavigate from "@/shared/hooks/useNavigate";
import { getPostRouteFlags } from "@/features/managePost";

import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import HomeViewModeNav from "@/features/browseArchive/ui/HomeViewModeNav";
import Marquee from "@/shared/ui/layout/Marquee";

const Header = () => {
    const [showMenu, setShowMenu] = useState(false);

    const { isMobile, isMobileMenuOpen, setIsMobileMenuOpen } = useLayoutStore();
    const { currentPathName, pushToUrl } = useNavigate();
    const { IS_ROUTE_POST } = getPostRouteFlags(currentPathName);
    const IS_ROUTE_HOME = currentPathName === "/";
    const IS_ROUTE_RESUME = currentPathName === "/resume";

    if (IS_ROUTE_POST) return null;

    return (
        <header className="fixed left-0 z-[100] mx-auto h-[var(--header-height)] w-[100svw]">
            {/* <header className="fixed left-0 z-[100] mx-auto h-[var(--header-height)] w-full after:absolute after:top-0 after:left-0 after:-z-[1] after:mx-auto after:h-[var(--header-height)] after:w-full after:backdrop-blur-[20px] after:content-[''] after:[mask-image:linear-gradient(rgb(0,0,0),rgb(0,0,0)_0%,rgb(0,0,0)_20%,rgba(0,0,0,0))]"> */}
            <div className="relative mx-auto flex h-full w-full mobile:max-w-[calc(100dvw-(1.6rem*2))] tablet:max-w-[var(--size-pc)] items-center pc:h-full px-[2rem]">
                {/* <div className="relative mx-auto flex h-full w-full mobile:max-w-[calc(100dvw-(1.6rem*2))] tablet:max-w-[calc(100dvw-(2.0rem*2))] items-center pc:h-full px-[2.0rem]"> */}
                <section className="menu flex gap-[4.8rem]">
                    <button
                        type="button"
                        onClick={() => pushToUrl("/")}
                    >
                        <IconComponent
                            type={`graphic-logo-horizontal`}
                            alt={"아지트"}
                            width={140}
                            height={44}
                            className="mobile:h-[calc(1.6rem*2.2)] mobile:w-[calc(1.6rem*7)] pc:h-[4rem] pc:w-auto"
                        />
                    </button>

                    <section className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] flex items-center justify-center gap-[1.6rem]">
                        <AnimatePresence mode="popLayout">
                            {IS_ROUTE_HOME && !isMobile && <HomeViewModeNav variant="header" />}

                            {IS_ROUTE_RESUME && (
                                <motion.section
                                    key={"resume_title"}
                                    initial={{ opacity: 0, transform: "scale(0.8)" }}
                                    animate={{ opacity: 1, transform: "scale(1)" }}
                                    exit={{ opacity: 0, transform: "scale(0.8)" }}
                                    transition={{
                                        type: "spring",
                                        mass: 0.1,
                                        stiffness: 100,
                                        damping: 10,
                                    }}
                                    className="flex gap-[1.6rem] flex-1 justify-center"
                                >
                                    <TextShimmer
                                        as="h2"
                                        duration={3}
                                        style={{
                                            color: "#000000",
                                            fontSize: "2.4rem",
                                        }}
                                        color={{
                                            start: "#000000",
                                            end: "#9393a0",
                                        }}
                                        className="font-extrabold"
                                    >
                                        RESUME
                                    </TextShimmer>
                                </motion.section>
                            )}
                        </AnimatePresence>
                    </section>
                </section>

                {/* <section className="absolute right-[calc(1.6rem*3)]">
                    <Marquee
                        content={"현재 구직중이에요"}
                        duration={10}
                        className={{
                            container: "bg-black rounded-full p-[0.8rem]",
                            marquee: "gap-[1.2rem] text-white font-bold",
                        }}
                    />
                </section> */}

                {/* 모바일 버튼 */}
                <button
                    className="hamburger w-[2.4rem] h-[1.2rem] absolute top-[50%] right-[2rem] transform translate-x-[0] translate-y-[-50%] text-[2.4rem] z-[10000]"
                    // className="hamburger w-[1.6rem] h-[1.6rem] px-[4.0rem] py-[2.0rem] absolute top-[50%] right-0 transform translate-x-[0] translate-y-[-50%] text-[2.4rem] z-[10000]"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <div
                        // className={`w-[2.4rem] h-[0.3rem] bg-[var(--color-gray-1000)] absolute left-[50%] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                        //     showMenu ? "top-[calc(50%-0rem)] rotate-[225deg]" : "top-[calc(50%-0.8rem)] rotate-0"
                        // }`}
                        className={`w-full h-[0.4rem] bg-[var(--color-gray-1000)] absolute left-[50%] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                            showMenu ? "top-[calc(50%-0rem)] rotate-[225deg]" : "top-[calc(50%-0.8rem)] rotate-0"
                        }`}
                    />
                    <div
                        className={`w-full h-[0.4rem] bg-[var(--color-gray-1000)] absolute left-[50%] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                            showMenu ? "top-[calc(50%+0rem)] rotate-[135deg]" : "top-[calc(50%+0.8rem)] rotate-0"
                        }`}
                    />
                </button>
                {/* 모바일 버튼 END */}
            </div>
        </header>
    );
};

export default Header;
