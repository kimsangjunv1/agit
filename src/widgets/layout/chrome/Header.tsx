"use client";

import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import UI from "@/shared/ui/common/UIComponent";
import IconComponent from "@/shared/ui/common/IconComponent";
import TextShimmer from "@/shared/ui/common/TextShimmerComponent";

import useNavigate from "@/shared/hooks/useNavigate";
import { getPostRouteFlags } from "@/features/managePost";

import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import HomeViewModeNav from "@/features/browseArchive/ui/HomeViewModeNav";
import Marquee from "@/shared/ui/layout/Marquee";
import ActionFloatingButtons from "./ActionFloatingButtons";
import { useSession } from "next-auth/react";

const Header = () => {
    const [showMenu, setShowMenu] = useState(false);
    const { data: session } = useSession();
    const isAdmin = session?.user.role === "admin";

    const { isMobile, isMobileMenuOpen, setIsMobileMenuOpen } = useLayoutStore();
    const { currentPathName, pushToUrl } = useNavigate();
    const { IS_ROUTE_POST_VIEW } = getPostRouteFlags(currentPathName);

    const IS_ROUTE_HOME = currentPathName === "/";

    const IS_ROUTE_RESUME = currentPathName === "/resume";

    return (
        <header className="fixed left-0 z-[1000000] mx-auto w-[100svw]">
            {/* <div className="relative mx-auto flex gap-[2.4rem] h-[12.8rem] w-full items-start p-[5.2rem]"> */}
            <div className="relative mx-auto flex gap-[2.4rem] w-full items-start p-[5.2rem]">
                <section className="flex-1 flex justify-start items-start gap-[3.2rem]">
                    <section className="flex flex-col gap-[2.4rem]">
                        <button
                            type="button"
                            onClick={() => pushToUrl("/")}
                            className="flex flex-col items-start gap-[1.2rem]"
                        >
                            <IconComponent
                                type={`graphic-logo-horizontal`}
                                alt={"아지트"}
                                width={140}
                                height={44}
                                className="mobile:h-[calc(1.6rem*2.2)] mobile:w-[calc(1.6rem*7)] pc:h-[4rem] pc:w-auto"
                            />
                            <p className="text-[1.8rem]">agit.</p>
                        </button>

                        <div className="h-[0.1rem] w-[2.4rem] bg-[#00000030]" />

                        <section className="flex flex-col items-start gap-[1.2rem]">
                            <p>Github</p>
                            <p>LinkedIn</p>
                            <Marquee
                                content={"Career"}
                                duration={2}
                                className={{
                                    container: "border p-[0.2rem]",
                                    marquee: "gap-[0.4rem] text-black text-[1.2rem]",
                                }}
                            />
                            {isAdmin ? (
                                <Fragment>
                                    <div className="h-[0.1rem] w-[2.4rem] bg-[#00000030]" />
                                    <UI.Button
                                        type="button"
                                        onClick={() => pushToUrl("/manager")}
                                    >
                                        <span>Admin</span>
                                    </UI.Button>

                                    <UI.Button
                                        type="button"
                                        onClick={() => pushToUrl("/post/create")}
                                    >
                                        <span>Create</span>
                                    </UI.Button>
                                </Fragment>
                            ) : null}
                        </section>
                    </section>

                    <section className={`flex items-start justify-start gap-[1.6rem]`}>
                        <AnimatePresence mode="popLayout">
                            {IS_ROUTE_HOME && !isMobile && <HomeViewModeNav variant="header" />}

                            {IS_ROUTE_POST_VIEW && (
                                <div
                                    key="post-header-actions"
                                    id="post-header-actions"
                                    className="w-full min-w-0"
                                />
                            )}

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

                {/* 모바일 버튼 */}
                <button
                    className="hamburger relative w-[2.4rem] h-[2.4rem] text-[2.4rem] z-[10000]"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <div
                        className={`w-full h-[0.2rem] bg-[var(--color-gray-1000)] absolute left-[50%] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                            showMenu ? "top-[calc(50%-0rem)] rotate-[225deg]" : "top-[calc(50%-0.8rem)] rotate-0"
                        }`}
                    />
                    <div
                        className={`w-full h-[0.2rem] bg-[var(--color-gray-1000)] absolute left-[50%] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
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
