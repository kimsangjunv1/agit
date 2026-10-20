import HomeViewModeNav from "@/features/browseArchive/ui/HomeViewModeNav";
import { getPostRouteFlags } from "@/features/managePost";
import useNavigate from "@/shared/hooks/useNavigate";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import { AnimatePresence } from "motion/react";
import React from "react";

const RouteFunction = () => {
    const { isMobile, isMobileMenuOpen, setIsMobileMenuOpen } = useLayoutStore();

    const { currentPathName, pushToUrl } = useNavigate();
    const { IS_ROUTE_HOME, IS_ROUTE_RESUME, IS_ROUTE_POST_VIEW, IS_ROUTE_POST_EDIT, IS_ROUTE_POST_CREATE } = getPostRouteFlags(currentPathName);

    return (
        <section
            className={`fixed ${IS_ROUTE_POST_VIEW ? "bottom-[calc(8rem+env(safe-area-inset-bottom))] tablet:bottom-[5.2rem]" : "bottom-[5.2rem]"} left-[5.2rem] ${IS_ROUTE_HOME ? "right-[5.2rem]" : ""} opacity-[0.5] flex min-w-0 flex-1 items-start justify-start gap-[1.6rem]`}
        >
            <AnimatePresence mode="popLayout">
                {IS_ROUTE_HOME && !isMobile && <HomeViewModeNav variant="header" />}

                {(IS_ROUTE_POST_VIEW || IS_ROUTE_POST_EDIT) && (
                    <div
                        key="post-header-actions"
                        id="post-header-actions"
                        className="w-full min-w-0"
                    />
                )}

                {IS_ROUTE_RESUME && <p>resume</p>}
                {IS_ROUTE_POST_CREATE && (
                    <section
                        key="post-create-header"
                        className="flex flex-col items-start gap-[1.2rem]"
                    >
                        <p>create</p>
                        <div id="post-create-header-actions" />
                    </section>
                )}
            </AnimatePresence>
        </section>
    );
};

export default RouteFunction;
