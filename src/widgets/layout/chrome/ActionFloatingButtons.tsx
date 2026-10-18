"use client";

import { useSession } from "next-auth/react";
import { motion } from "motion/react";

import UI from "@/shared/ui/common/UIComponent";
import IconComponent from "@/shared/ui/common/IconComponent";
import useNavigate from "@/shared/hooks/useNavigate";
import { getPostRouteFlags } from "@/features/managePost";

const springTransition = {
    type: "spring" as const,
    mass: 0.1,
    stiffness: 100,
    damping: 10,
};

const ActionFloatingButtons = () => {
    const { data: session } = useSession();
    const { currentPathName, pushToUrl } = useNavigate();

    const { IS_ROUTE_POST } = getPostRouteFlags(currentPathName);
    const IS_ROUTE_MANAGER = currentPathName.startsWith("/manager");
    const IS_ROUTE_LOGIN = currentPathName.startsWith("/login");

    const isAdmin = session?.user.role === "admin";
    const shouldRender = !!session && !IS_ROUTE_POST && !IS_ROUTE_MANAGER && !IS_ROUTE_LOGIN;

    if (!shouldRender) {
        return null;
    }

    return (
        <motion.div
            className="flex flex-col items-center gap-[1.2rem]"
            initial={{ opacity: 0, y: "2rem", scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={springTransition}
        >
            {isAdmin ? (
                <UI.Button
                    type="button"
                    onClick={() => pushToUrl("/manager")}
                    className="flex items-center justify-center w-[4.8rem] h-[4.8rem] rounded-full bg-[#ffffffd1] backdrop-blur-md shadow-[var(--shadow-normal)] transition-colors hover:bg-white"
                >
                    <span className="sr-only">관리자 페이지 이동</span>
                    <IconComponent
                        type="outlined-chart"
                        alt=""
                        width={24}
                        height={24}
                    />
                </UI.Button>
            ) : null}

            <UI.Button
                type="button"
                onClick={() => pushToUrl("/post/create")}
                className="flex items-center justify-center w-[4.8rem] h-[4.8rem] rounded-full bg-[#ffffffd1] backdrop-blur-md shadow-[var(--shadow-normal)] transition-colors hover:bg-white"
            >
                <span className="sr-only">새로운 아티클 생성하기</span>
                <IconComponent
                    type="outlined-edit"
                    alt=""
                    width={24}
                    height={24}
                />
            </UI.Button>
        </motion.div>
    );
};

export default ActionFloatingButtons;
