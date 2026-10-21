"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import DynamicIsland from "@/shared/ui/common/DynamicIsland";
import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import { usePostDetailProvider } from "../model/PostDetailContext";

const SCROLL_START_PX = 12;
const COMPLETE_PERCENT = 99;

type ScrollPhase = "top" | "reading" | "complete";

const readingYear = (createDate: string) => {
    const date = new Date(createDate);
    return Number.isNaN(date.getTime()) ? "" : String(date.getFullYear());
};

const DynamicPostController = () => {
    const reducedMotion = useReducedMotion();
    const { scrollViewportRef, title, createDate, next, postId, pushToUrl } = usePostDetailProvider();
    const isVisible = useLayoutStore((state) => state.isPageContentVisible && state.transitionPhase === "idle" && !state.isMobileMenuOpen);
    const gaugeRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const percentRef = useRef(0);
    const [dismissed, setDismissed] = useState(false);
    const [phase, setPhase] = useState<ScrollPhase>("top");

    useEffect(() => {
        const viewport = scrollViewportRef.current;
        if (!viewport) return;

        let frame = 0;
        const paint = () => {
            frame = 0;
            const distance = viewport.scrollHeight - viewport.clientHeight;
            const percent = distance <= 0 ? 0 : Math.min(100, Math.max(0, (viewport.scrollTop / distance) * 100));
            const nextPhase: ScrollPhase = percent >= COMPLETE_PERCENT ? "complete" : viewport.scrollTop > SCROLL_START_PX ? "reading" : "top";

            percentRef.current = percent;
            if (gaugeRef.current) gaugeRef.current.style.width = `${percent}%`;
            if (progressRef.current) {
                progressRef.current.setAttribute("aria-valuenow", String(Math.round(percent)));
                progressRef.current.setAttribute("aria-valuetext", `${Math.round(percent)}%`);
            }
            setPhase((current) => (current === nextPhase ? current : nextPhase));
        };

        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(paint);
        };

        paint();
        viewport.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        const observer = new ResizeObserver(onScroll);
        observer.observe(viewport);
        if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);

        return () => {
            cancelAnimationFrame(frame);
            viewport.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            observer.disconnect();
        };
    }, [scrollViewportRef, postId]);

    useLayoutEffect(() => {
        if (!gaugeRef.current && !progressRef.current) return;
        if (gaugeRef.current) gaugeRef.current.style.width = `${percentRef.current}%`;
        if (progressRef.current) {
            progressRef.current.setAttribute("aria-valuenow", String(Math.round(percentRef.current)));
            progressRef.current.setAttribute("aria-valuetext", `${Math.round(percentRef.current)}%`);
        }
    }, [phase, isVisible, dismissed]);

    if (!isVisible || dismissed || phase === "top") return null;

    const canOpenNext = phase === "complete" && Boolean(next);
    const year = readingYear(createDate);
    const label = canOpenNext ? `Next / ${next?.title}` : year ? `${year} / ${title}` : title;

    const scrollToTop = () => {
        scrollViewportRef.current?.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    };

    const openNext = () => {
        if (next) pushToUrl(`/post/${next.idx}`);
    };

    return (
        <div className="fixed bottom-[calc(7.2rem+env(safe-area-inset-bottom))] left-1/2 z-[120] -translate-x-1/2">
            <div
                ref={progressRef}
                role="progressbar"
                aria-label="글 읽기 진행률"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={0}
            >
                <DynamicIsland
                    ariaLabel="글 읽기 진행"
                    placement="bottom"
                    overlay={
                        <div
                            ref={gaugeRef}
                            className="h-full bg-white/20"
                        />
                    }
                >
                    <div className="flex items-center gap-[0.4rem]">
                        <button
                            type="button"
                            aria-label="진행 표시 닫기"
                            className="flex h-[3.2rem] w-[3.2rem] shrink-0 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                            onClick={() => setDismissed(true)}
                        >
                            <MaterialIcon
                                name="close"
                                size={20}
                            />
                        </button>
                        <p className="min-w-0 max-w-[min(32rem,calc(100vw-16rem))] truncate px-[0.4rem] text-[1.4rem] leading-none">{label}</p>
                        <button
                            type="button"
                            aria-label={canOpenNext ? `${next?.title} 다음 글 보기` : "맨 위로"}
                            className="flex h-[3.2rem] w-[3.2rem] shrink-0 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                            onClick={canOpenNext ? openNext : scrollToTop}
                        >
                            <MaterialIcon
                                name={canOpenNext ? "arrow_forward" : "arrow_upward"}
                                size={20}
                            />
                        </button>
                    </div>
                </DynamicIsland>
            </div>
        </div>
    );
};

export default DynamicPostController;
