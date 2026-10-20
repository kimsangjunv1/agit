"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode, type Ref, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

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
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import DynamicIsland from "@/shared/ui/common/DynamicIsland";

type PostNavigationActionsProps = PostNavVisibility & {
    likeCount: number;
    alreadyLiked?: boolean;
    isDeletePending: boolean;
    onAction: (action: PostNavAction) => void;
    scrollViewportRef?: RefObject<HTMLDivElement | null>;
};

type NavButtonProps = {
    title: string;
    icon: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    buttonRef?: Ref<HTMLButtonElement>;
    pressed?: boolean;
};
const FONT_SCALE_OPTIONS = [0.9, 1, 1.15, 1.3] as const;
const LINE_HEIGHT_OPTIONS = [1.4, 1.5, 1.8, 2] as const;

const NavDivider = () => (
    <div
        aria-hidden
        className="h-[1.6rem] w-px shrink-0 bg-white/20"
    />
);

const NavButton = ({ title, icon, onClick, disabled, className = "", buttonRef, pressed }: NavButtonProps) => (
    <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-pressed={pressed}
        className={`flex h-[3.2rem] w-[3.6rem] shrink-0 items-center justify-center overflow-hidden rounded-full px-[0.8rem] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:opacity-60 ${className}`}
        onClick={onClick}
    >
        <span className="sr-only">{title}</span>
        {icon}
    </button>
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
    <div className="flex min-w-0 flex-1 items-center justify-center px-[0.4rem]">
        <p className="sr-only pc:not-sr-only whitespace-nowrap text-[1.2rem] text-[var(--color-text-muted)]">{label}</p>

        <section className="flex items-center">
            <button
                type="button"
                aria-label={`${label} 줄이기`}
                disabled={decreaseDisabled}
                className="flex h-[3.2rem] w-[3.2rem] shrink-0 items-center justify-center rounded-full text-[2rem] text-[var(--color-text-primary)] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-current disabled:opacity-30"
                onClick={onDecrease}
            >
                <span className="sr-only">{label} 줄이기</span>
                <MaterialIcon
                    name="remove"
                    size={20}
                />
            </button>
            <strong className="min-w-[3.6rem] text-center text-[1.6rem] text-[var(--color-text-primary)]">{value}</strong>
            <button
                type="button"
                aria-label={`${label} 늘리기`}
                disabled={increaseDisabled}
                className="flex h-[3.2rem] w-[3.2rem] shrink-0 items-center justify-center rounded-full text-[2rem] text-[var(--color-text-primary)] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-current disabled:opacity-30"
                onClick={onIncrease}
            >
                <span className="sr-only">{label} 늘리기</span>
                <MaterialIcon
                    name="add"
                    size={20}
                />
            </button>
        </section>
    </div>
);

const PostNavigationActions = ({
    showShare,
    showLike,
    showComments,
    showToc,
    showReading,
    showEdit,
    showDelete,
    likeCount,
    alreadyLiked,
    isDeletePending,
    onAction,
    scrollViewportRef,
}: PostNavigationActionsProps) => {
    const reducedMotion = useReducedMotion();
    const shouldShowIsland = useLayoutStore((state) => state.isPageContentVisible && state.transitionPhase === "idle");
    const params = useParams();
    const postIdx = parseInt(params?.id as string);
    const progressBarRef = useRef<HTMLDivElement>(null);
    useScrollProgressBar(progressBarRef, scrollViewportRef);

    const { currentPathName, pushToUrl } = useNavigate();
    const isLiked = alreadyLiked ?? false;
    const likeLabel = likeCount > 0 ? `Cheer Up ${likeCount}` : "Cheer Up";

    const { IS_ROUTE_POST_VIEW, IS_ROUTE_POST_EDIT, IS_ROUTE_POST_CREATE } = getPostRouteFlags(currentPathName);
    const { postTitle, tocItems } = usePostNavigationActions({
        postIdx,
        isView: IS_ROUTE_POST_VIEW,
        isCreate: IS_ROUTE_POST_CREATE,
        isEdit: IS_ROUTE_POST_EDIT,
        pushToUrl,
    });
    const [activeTocLabel, setActiveTocLabel] = useState("");
    const [isReadingSettingsOpen, setIsReadingSettingsOpen] = useState(false);
    const readingButtonRef = useRef<HTMLButtonElement>(null);
    const readingSettingsRef = useRef<HTMLDivElement>(null);
    const shouldRestoreReadingFocus = useRef(false);
    const { fontScale, lineHeight, setFontScale, setLineHeight } = usePostReadingSettingsStore();

    useEffect(() => {
        if (isReadingSettingsOpen) {
            readingSettingsRef.current?.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus({ preventScroll: true });
        } else if (shouldRestoreReadingFocus.current) {
            readingButtonRef.current?.focus({ preventScroll: true });
            shouldRestoreReadingFocus.current = false;
        }
    }, [isReadingSettingsOpen]);

    const closeReadingSettings = () => {
        shouldRestoreReadingFocus.current = true;
        setIsReadingSettingsOpen(false);
    };

    useEffect(() => {
        if (!IS_ROUTE_POST_VIEW || tocItems.length === 0) {
            setActiveTocLabel("");
            return;
        }

        let rafId = 0;
        const scrollElement = scrollViewportRef?.current;
        const scrollTarget = scrollElement ?? window;

        const updateActiveToc = () => {
            rafId = 0;
            const threshold = scrollElement ? scrollElement.getBoundingClientRect().top + scrollElement.clientHeight * 0.35 : window.innerHeight * 0.35;
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
        scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll);
        const observer = new ResizeObserver(handleScroll);
        if (scrollElement) {
            observer.observe(scrollElement);
            if (scrollElement.firstElementChild) observer.observe(scrollElement.firstElementChild);
        }

        return () => {
            cancelAnimationFrame(rafId);
            scrollTarget.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
            observer.disconnect();
        };
    }, [IS_ROUTE_POST_VIEW, tocItems, scrollViewportRef]);

    const scrollToTocSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const updateSetting = (options: readonly number[], currentValue: number, direction: -1 | 1, setter: (value: number) => void) => {
        const currentIndex = options.indexOf(currentValue);
        const nextIndex = Math.min(Math.max(currentIndex + direction, 0), options.length - 1);
        setter(options[nextIndex]);
    };

    return (
        <section className="relative flex min-w-0 flex-1 flex-col">
            {IS_ROUTE_POST_VIEW && (
                <Fragment>
                    <h2 className="truncate text-[1.4rem] leading-[1.5]">{postTitle}</h2>

                    <div className="flex min-w-0 items-center">
                        {activeTocLabel ? <p className="truncate mobile:text-[1.6rem] pc:text-[1.8rem] leading-[1.5] font-semibold">{activeTocLabel} 보는 중</p> : null}

                        {showToc ? (
                            <UI.DropDown
                                className={{
                                    container: "shrink-0",
                                    inner: "max-h-[50svh] w-[min(28rem,calc(100vw-2.4rem))] overflow-y-auto text-[var(--color-text-primary)]",
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

                    <div className="pointer-events-none w-[12.8rem] bg-[var(--color-border-strong)] h-[0.2rem]">
                        <div
                            ref={progressBarRef}
                            className="h-full w-0 will-change-[width]"
                        />
                    </div>
                </Fragment>
            )}

            <section className="flex items-center gap-[0.4rem] text-[var(--color-text-primary)]">
                {showEdit ? (
                    <NavButton
                        title="수정하기"
                        icon={
                            <MaterialIcon
                                name="edit"
                                size={20}
                            />
                        }
                        onClick={() => onAction("edit")}
                    />
                ) : null}

                {showEdit && showDelete ? <NavDivider /> : null}

                {showDelete ? (
                    <NavButton
                        title="게시물 삭제하기"
                        disabled={isDeletePending}
                        className="bg-[var(--color-danger-surface)] hover:bg-[var(--color-danger-surface)]"
                        icon={
                            <MaterialIcon
                                name="delete"
                                size={20}
                            />
                        }
                        onClick={() => onAction("delete")}
                    />
                ) : null}
            </section>

            <div className="fixed left-1/2 top-[0.4rem] z-[1] -translate-x-1/2">
                {IS_ROUTE_POST_VIEW && shouldShowIsland ? (
                    <DynamicIsland ariaLabel="글 도구">
                        <AnimatePresence
                            initial={false}
                            mode="popLayout"
                        >
                            {isReadingSettingsOpen ? (
                                <motion.div
                                    key="reading-settings"
                                    ref={readingSettingsRef}
                                    role="group"
                                    aria-label="읽기 설정"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: reducedMotion ? 0 : 0.15 }}
                                    className="flex items-center gap-[0.4rem]"
                                    onKeyDown={(event) => {
                                        if (event.key === "Escape") {
                                            event.stopPropagation();
                                            closeReadingSettings();
                                        }
                                    }}
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
                                    <NavButton
                                        title="원래 메뉴로 돌아가기"
                                        icon={
                                            <MaterialIcon
                                                name="arrow_back"
                                                size={20}
                                            />
                                        }
                                        onClick={closeReadingSettings}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="actions"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: reducedMotion ? 0 : 0.15 }}
                                    className="flex items-center gap-[0.4rem]"
                                >
                                    {showShare ? (
                                        <NavButton
                                            title="링크 복사"
                                            icon={
                                                <MaterialIcon
                                                    name="content_copy"
                                                    size={20}
                                                />
                                            }
                                            onClick={() => onAction("share")}
                                        />
                                    ) : null}
                                    {showLike ? (
                                        <NavButton
                                            title={likeLabel}
                                            pressed={isLiked}
                                            className={isLiked ? "bg-[#00ff61] text-[var(--color-on-accent)]" : ""}
                                            icon={
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width={20}
                                                    height={20}
                                                    viewBox="0 -960 960 960"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                    focusable="false"
                                                >
                                                    <path d="m80-80 200-560 360 360L80-80Zm502-378-42-42 224-224q32-32 77-32t77 32l24 24-42 42-24-24q-14-14-35-14t-35 14L582-458ZM422-618l-42-42 24-24q14-14 14-34t-14-34l-26-26 42-42 26 26q32 32 32 76t-32 76l-24 24Zm80 80-42-42 144-144q14-14 14-35t-14-35l-64-64 42-42 64 64q32 32 32 77t-32 77L502-538Zm160 160-42-42 64-64q32-32 77-32t77 32l64 64-42 42-64-64q-14-14-35-14t-35 14l-64 64Z" />
                                                </svg>
                                            }
                                            onClick={() => onAction("like")}
                                        />
                                    ) : null}
                                    {showComments ? (
                                        <NavButton
                                            title="댓글"
                                            icon={
                                                <MaterialIcon
                                                    name="chat_bubble_outline"
                                                    size={20}
                                                />
                                            }
                                            onClick={() => onAction("comments")}
                                        />
                                    ) : null}
                                    {showReading ? (
                                        <NavButton
                                            title="읽기 설정"
                                            buttonRef={readingButtonRef}
                                            icon={
                                                <MaterialIcon
                                                    name="text_fields"
                                                    size={20}
                                                />
                                            }
                                            onClick={() => setIsReadingSettingsOpen(true)}
                                        />
                                    ) : null}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </DynamicIsland>
                ) : null}
            </div>
        </section>
    );
};

export default PostNavigationActions;
