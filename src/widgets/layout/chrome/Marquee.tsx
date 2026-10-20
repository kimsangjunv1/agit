"use client";

import { useGetCommentLatestListQuery } from "@/entities/comment/api/comment.query";
import useNavigate from "@/shared/hooks/useNavigate";
import { util } from "@/shared/lib/util";
import { AnimatePresence, motion } from "motion/react";
import { Fragment, useMemo } from "react";

const Marquee = () => {
    const { currentPathName } = useNavigate();
    const { data: getCommentLatestListData, refetch: getCommentLatestListFetch } = useGetCommentLatestListQuery();

    const items = useMemo(
        () =>
            getCommentLatestListData?.result?.map((e, i) => (
                <div
                    key={e.idx}
                    className="flex gap-[0.8rem] px-4"
                >
                    <p className="whitespace-nowrap text-[var(--color-text-primary)]">{util.string.getCurrentDate(e.created_at)}</p>
                    <p className="font-bold text-[var(--color-text-primary)] whitespace-nowrap">{e.author}</p>
                    <p className="font-bold whitespace-nowrap text-[var(--color-brand-500)]">{e.msg}</p>
                </div>
            )),
        [getCommentLatestListData?.result],
    );

    const RENDERING = currentPathName === "/" || currentPathName === "/profile";

    return (
        <AnimatePresence mode="wait">
            {RENDERING ? (
                <motion.div
                    key={"marquee"}
                    className="fixed bottom-0 left-0 w-full overflow-hidden py-[1.2rem] z-10 bg-[var(--color-surface-floating)]"
                    // initial={{ y: 100 }}
                    // exit={{ y: 100 }}
                    // animate={{ y: 0 }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{
                        delay: 0.1 * 1,
                        type: "spring",
                        mass: 0.1,
                        stiffness: 100,
                        damping: 10,
                    }}
                >
                    <motion.div
                        className="flex gap-[3.2rem] flex-nowrap"
                        animate={{ x: ["0%", "-100%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 30, // 속도 조절
                        }}
                    >
                        {/* 같은 내용 두 번 렌더링 (loop 효과) */}
                        {items}
                        {items}
                    </motion.div>
                </motion.div>
            ) : (
                ""
            )}
        </AnimatePresence>
    );
};

export default Marquee;
