"use client";

import { Fragment, useState } from "react";

import UI from "@/shared/ui/common/UIComponent";
import IconComponent from "@/shared/ui/common/IconComponent";

import useNavigate from "@/shared/hooks/useNavigate";
import { getPostRouteFlags } from "@/features/managePost";

import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import Marquee from "@/shared/ui/layout/Marquee";
import { useSession } from "next-auth/react";

const Header = () => {
    const [showMenu, setShowMenu] = useState(false);
    const { data: session } = useSession();
    const isAdmin = session?.user.role === "admin";

    const { isMobileMenuOpen, setIsMobileMenuOpen } = useLayoutStore();
    const { currentPathName, pushToUrl } = useNavigate();
    const { IS_ROUTE_POST_VIEW } = getPostRouteFlags(currentPathName);

    const IS_ROUTE_MANAGER = currentPathName.startsWith("/manager");

    return (
        <header
            data-page-transition-fixed="header"
            className={`fixed left-0 z-[1000000] mx-auto w-[100svw] ${IS_ROUTE_POST_VIEW || IS_ROUTE_MANAGER ? "pointer-events-none" : ""}`}
        >
            {/* <div className="relative mx-auto flex gap-[2.4rem] h-[12.8rem] w-full items-start p-[5.2rem]"> */}
            <div className={`relative mx-auto flex gap-[2.4rem] justify-between w-full items-start ${IS_ROUTE_MANAGER ? "px-[2rem] py-[1.6rem]" : "p-[5.2rem]"}`}>
                <section className="pointer-events-auto min-w-0 flex items-start gap-[3.2rem]">
                    <section className="flex flex-col gap-[2.4rem]">
                        <button
                            type="button"
                            onClick={() => pushToUrl("/")}
                            className="flex justify-start items-start gap-[1.2rem]"
                        >
                            <IconComponent
                                type={`graphic-logo-horizontal`}
                                alt={"아지트"}
                                width={140}
                                height={44}
                                className="mobile:h-[calc(1.6rem*2.2)] mobile:w-[calc(1.6rem*7)] pc:h-[4rem] pc:w-auto"
                            />
                            <section className="flex flex-col gap-[0.4rem]">
                                <p className="text-[1.8rem]">agit.</p>
                                <Marquee
                                    content={"Career"}
                                    duration={2}
                                    className={{
                                        container: "border p-[0.2rem]",
                                        marquee: "gap-[0.4rem] text-inherit text-[1.2rem]",
                                    }}
                                />
                            </section>
                        </button>

                        <section className={`${IS_ROUTE_MANAGER ? "hidden" : "flex"} flex-col items-start gap-[1.2rem]`}>
                            <p>Github</p>
                            <p>LinkedIn</p>

                            {isAdmin ? (
                                <Fragment>
                                    <div className="h-[0.1rem] w-[2.4rem] bg-[var(--color-border)]" />
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
                </section>

                {/* 모바일 버튼 */}
                <button
                    className="hamburger pointer-events-auto relative w-[2.4rem] h-[2.4rem] text-[2.4rem] z-[10000]"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <div
                        className={`w-full h-[0.2rem] bg-current absolute left-[50%] transform -translate-x-1/2 -translate-y-1/2 transition-[top,rotate,translate,transform] duration-250 ease-[var(--interaction-easing)] ${
                            showMenu ? "top-[calc(50%-0rem)] rotate-[225deg]" : "top-[calc(50%-0.8rem)] rotate-0"
                        }`}
                    />
                    <div
                        className={`w-full h-[0.2rem] bg-current absolute left-[50%] transform -translate-x-1/2 -translate-y-1/2 transition-[top,rotate,translate,transform] duration-250 ease-[var(--interaction-easing)] ${
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
