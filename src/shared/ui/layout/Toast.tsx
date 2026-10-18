"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

import { useToastStore } from "@/shared/stores/useToastStore";
import IconComponent from "@/shared/ui/common/IconComponent";
import { MaterialIcon } from "../common/MaterialIcon";

// 클릭 기능, 시간 세팅, 아이콘 사용 여부
export function Toast() {
    const toastList = useToastStore((state) => state.toastList);
    const removeToastById = useToastStore((state) => state.removeToastById);

    // if (!toastList.length) {
    //     return null;
    // }

    return (
        // <div className="fixed left-[50%] transform translate-x-[-50%] top-[calc(var(--header-height)+3.2rem)] z-[100000000000] grid max-w-[var(--size-pc)] gap-2">
        <div className="fixed left-[50%] transform translate-x-[-50%] top-[calc(1.6rem*3)] z-[100000000000] grid max-w-[var(--size-pc)] gap-2">
            {/* <div className="fixed left-[50%] transform translate-x-[-50%] top-[calc(var(--header-height)+3.2rem)] z-[100000000000] grid w-[min(36rem,calc(100vw-2.4rem))] gap-2"> */}
            <AnimatePresence>
                {toastList.map((toast) => (
                    <motion.div
                        // className={`flex items-start gap-3 rounded-lg border bg-slate-950/95 px-4 py-3 text-sm font-bold text-white shadow-xl backdrop-blur`}
                        className={`flex items-center gap-[1.2rem] bg-black px-[2.4rem_1.2rem] py-[1.2rem] shadow-[0_0_200px_0_#000000]`}
                        key={toast.id}
                        role="status"
                        initial={{ opacity: 0, scale: 0.5, translateY: -100 }}
                        animate={{ opacity: 1, scale: 1, translateY: 0 }}
                        exit={{ opacity: 0, scale: 0.5, translateY: -100 }}
                        transition={{
                            delay: 0.1 * 2,
                            type: "spring",
                            mass: 0.1,
                            stiffness: 100,
                            damping: 10,
                        }}
                    >
                        {/* <div
                            className={`${toast.type === "success" ? "bg-emerald-500" : toast.type === "fail" ? "bg-rose-500" : toast.type === "warning" ? "bg-amber-500" : "bg-slate-700"} w-[0.8rem] h-[0.8rem]`}
                        /> */}
                        <div className="min-w-0 flex-1">
                            <p className="text-[2rem] text-white break-words font-semibold">{toast.msg}</p>
                        </div>

                        <button
                            aria-label="토스트 닫기"
                            className="cursor-pointer text-lg leading-none text-[var(--adaptive-black500)] transition bg-[var(--adaptive-grey300)] w-[2.4rem] h-[2.4rem] rounded-full"
                            onClick={() => removeToastById(toast.id)}
                            type="button"
                        >
                            <MaterialIcon
                                name="close"
                                size={24}
                                className="text-white"
                            />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
