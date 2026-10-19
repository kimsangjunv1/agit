"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import type { PostNavAction } from "@/features/managePost/lib/postNavigationActions";
import type { PostNavVisibility } from "@/features/managePost/lib/postPermissions";
import UI from "@/shared/ui/common/UIComponent";
import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";
import { getPostRouteFlags } from "../lib/postRoute";
import useNavigate from "@/shared/hooks/useNavigate";
import { usePostNavigationActions } from "../hooks/usePostNavigationActions";
import { useParams } from "next/navigation";
import { useScrollProgressBar } from "@/shared/hooks/useScrollProgress";
import { usePostReadingSettingsStore } from "@/shared/stores/usePostReadingSettingsStore";

type PostNavigationActionsProps = PostNavVisibility & {
    likeCount: number;
    alreadyLiked?: boolean;
    isDeletePending: boolean;
    onAction: (action: PostNavAction) => void;
};

type NavButtonProps = {
    title: string;
    icon: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
};
const rollingTransition = {
    duration: 0.45,
    ease: [0.22, 1, 0.36, 1] as const,
};
const FONT_SCALE_OPTIONS = [0.9, 1, 1.15, 1.3] as const;
const LINE_HEIGHT_OPTIONS = [1.4, 1.6, 1.8, 2] as const;

const NavDivider = () => <div className="h-full w-[0.4rem] shrink-0 bg-[#ffffff20]" />;

const NavButton = ({ title, icon, onClick, disabled, className = "" }: NavButtonProps) => (
    <UI.Button
        type="button"
        disabled={disabled}
        className={`flex shrink-0 items-center justify-center gap-[0.8rem] px-[1.2rem] backdrop-blur-2xl transition-colors disabled:opacity-60 ${className}`}
        onClick={onClick}
    >
        <span className="sr-only">{title}</span>
        {icon}
        {/* <p className="whitespace-nowrap text-[1.8rem] text-white">{title}</p> */}
    </UI.Button>
);

const ReadingSettingControl = ({
    label,
    value,
    onDecrease,
    onIncrease,
    decreaseDisabled,
    increaseDisabled,
}: {
    label: string;
    value: string;
    onDecrease: () => void;
    onIncrease: () => void;
    decreaseDisabled: boolean;
    increaseDisabled: boolean;
}) => (
    <div className="flex min-w-0 flex-1 mobile:flex-col pc:flex-row items-center justify-center px-[0.8rem]">
        <p className="whitespace-nowrap text-[1.2rem] text-white/60">{label}</p>

        <section className="flex items-center">
            <UI.Button
                type="button"
                aria-label={`${label} 줄이기`}
                disabled={decreaseDisabled}
                className="flex h-[3.2rem] w-[3.2rem] shrink-0 items-center justify-center rounded-full text-[2rem] text-white transition-colors bg-[#1e1e1e] hover:bg-white/10 disabled:opacity-30 rounded-full"
                onClick={onDecrease}
            >
                <span className="sr-only">{label} 줄이기</span>
                <MaterialIcon
                    name="remove"
                    size={20}
                />
            </UI.Button>
            <strong className="min-w-[4rem] text-center text-[1.6rem] text-white">{value}</strong>
            <UI.Button
                type="button"
                aria-label={`${label} 늘리기`}
                disabled={increaseDisabled}
                className="flex h-[3.2rem] w-[3.2rem] shrink-0 items-center justify-center rounded-full text-[2rem] text-white transition-colors bg-[#1e1e1e] hover:bg-white/10 disabled:opacity-30 rounded-full"
                onClick={onIncrease}
            >
                <span className="sr-only">{label} 늘리기</span>
                <MaterialIcon
                    name="add"
                    size={20}
                />
            </UI.Button>
        </section>
    </div>
);

const PostNavigationActions = ({ showShare, showLike, showComments, showToc, showReading, showEdit, showDelete, likeCount, alreadyLiked, isDeletePending, onAction }: PostNavigationActionsProps) => {
    const params = useParams();
    const postIdx = parseInt(params?.id as string);
    const progressBarRef = useRef<HTMLDivElement>(null);
    useScrollProgressBar(progressBarRef);

    const { currentPathName, pushToUrl } = useNavigate();
    const isLiked = alreadyLiked ?? false;
    const likeLabel = likeCount > 0 ? `좋아요 ${likeCount}` : "좋아요";

    const { IS_ROUTE_POST, IS_ROUTE_POST_VIEW, IS_ROUTE_POST_EDIT, IS_ROUTE_POST_CREATE } = getPostRouteFlags(currentPathName);
    const { postTitle, tocItems } = usePostNavigationActions({
        postIdx,
        isView: IS_ROUTE_POST_VIEW,
        isCreate: IS_ROUTE_POST_CREATE,
        isEdit: IS_ROUTE_POST_EDIT,
        pushToUrl,
    });
    const [activeTocLabel, setActiveTocLabel] = useState("");
    const [isReadingSettingsOpen, setIsReadingSettingsOpen] = useState(false);
    const { fontScale, lineHeight, setFontScale, setLineHeight } = usePostReadingSettingsStore();

    useEffect(() => {
        if (!IS_ROUTE_POST_VIEW || tocItems.length === 0) {
            setActiveTocLabel("");
            return;
        }

        let rafId = 0;

        const updateActiveToc = () => {
            rafId = 0;
            const threshold = window.innerHeight * 0.35;
            const activeItem =
                [...tocItems].reverse().find((item) => {
                    const section = document.getElementById(item.id);
                    return section && section.getBoundingClientRect().top <= threshold;
                }) ?? tocItems[0];

            setActiveTocLabel((prev) => (prev === activeItem.label ? prev : activeItem.label));
        };

        const handleScroll = () => {
            if (!rafId) {
                rafId = requestAnimationFrame(updateActiveToc);
            }
        };

        updateActiveToc();
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [IS_ROUTE_POST_VIEW, tocItems]);

    const scrollToTocSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const updateSetting = (options: readonly number[], currentValue: number, direction: -1 | 1, setter: (value: number) => void) => {
        const currentIndex = options.indexOf(currentValue);
        const nextIndex = Math.min(Math.max(currentIndex + direction, 0), options.length - 1);
        setter(options[nextIndex]);
    };

    return (
        <section className={`${!isReadingSettingsOpen ? "" : "overflow-hidden"} relative flex min-w-0 flex-1`}>
            <AnimatePresence initial={false}>
                {!isReadingSettingsOpen ? (
                    <motion.div
                        key="navigation"
                        initial={{ y: "-100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-100%", opacity: 0 }}
                        transition={rollingTransition}
                        className="flex min-w-0 flex-1 flex-col items-start justify-center h-full w-full min-w-0"
                    >
                        {IS_ROUTE_POST_VIEW && (
                            <Fragment>
                                <h2 className="truncate text-[1.4rem] leading-[1.5]">{postTitle}</h2>

                                <div className="flex min-w-0 items-center">
                                    {activeTocLabel ? <p className="truncate mobile:text-[1.6rem] pc:text-[1.8rem] leading-[1.5] font-semibold">{activeTocLabel} 보는 중</p> : null}

                                    {showToc ? (
                                        <UI.DropDown
                                            className={{
                                                container: "shrink-0",
                                                inner: "max-h-[50svh] w-[min(28rem,calc(100vw-2.4rem))] overflow-y-auto text-white",
                                            }}
                                            list={tocItems.map((item) => ({
                                                title: item.label,
                                                value: item.id,
                                                className: `w-full text-left ${item.level === 1 ? "font-bold" : "pl-[2.4rem]"}`,
                                                onClick: () => scrollToTocSection(item.id),
                                            }))}
                                        >
                                            <UI.Button
                                                type="button"
                                                aria-label="목차 열기"
                                                className="flex h-[3.2rem] w-[3.2rem] items-center justify-center"
                                            >
                                                <span className="sr-only">목차 열기</span>
                                                <MaterialIcon
                                                    name="keyboard_arrow_down"
                                                    size={20}
                                                />
                                            </UI.Button>
                                        </UI.DropDown>
                                    ) : null}
                                </div>
                            </Fragment>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="reading-settings"
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={rollingTransition}
                        className="absolute inset-0 flex items-center bg-black"
                    >
                        <ReadingSettingControl
                            label="글자 크기"
                            value={`${Math.round(fontScale * 100)}%`}
                            decreaseDisabled={fontScale === FONT_SCALE_OPTIONS[0]}
                            increaseDisabled={fontScale === FONT_SCALE_OPTIONS[FONT_SCALE_OPTIONS.length - 1]}
                            onDecrease={() => updateSetting(FONT_SCALE_OPTIONS, fontScale, -1, setFontScale)}
                            onIncrease={() => updateSetting(FONT_SCALE_OPTIONS, fontScale, 1, setFontScale)}
                        />
                        <NavDivider />
                        <ReadingSettingControl
                            label="줄 간격"
                            value={lineHeight.toFixed(1)}
                            decreaseDisabled={lineHeight === LINE_HEIGHT_OPTIONS[0]}
                            increaseDisabled={lineHeight === LINE_HEIGHT_OPTIONS[LINE_HEIGHT_OPTIONS.length - 1]}
                            onDecrease={() => updateSetting(LINE_HEIGHT_OPTIONS, lineHeight, -1, setLineHeight)}
                            onIncrease={() => updateSetting(LINE_HEIGHT_OPTIONS, lineHeight, 1, setLineHeight)}
                        />
                        <NavDivider />
                        <UI.Button
                            type="button"
                            aria-label="원래 메뉴로 돌아가기"
                            className="flex h-full shrink-0 items-center justify-center px-[1.2rem] text-white transition-colors hover:bg-white/10"
                            onClick={() => setIsReadingSettingsOpen(false)}
                        >
                            <span className="sr-only">원래 메뉴로 돌아가기</span>
                            <MaterialIcon
                                name="arrow_back"
                                size={20}
                            />
                        </UI.Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default PostNavigationActions;
