"use client";

import ReactDOM from "react-dom";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Fragment, ReactNode, useEffect, useId, useRef, useState } from "react";

import { util } from "@/shared/lib/util";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import DimmedComponent from "@/shared/ui/common/DimmedComponent";
import UI from "../common/UIComponent";

interface ModalBodyProps {
    className?: string;
    children?: ReactNode;
    description?: string;
}

interface ModalFooterProps {
    className?: string;
    currentTime?: number;
    confirm?: {
        title: string;
        onClick: () => unknown;
        loading: null | boolean;
        className: string;
    };
    cancel: {
        title: string;
        onClick: () => void;
        className: string;
    };
}

interface ModalGuideProps {
    text?: string;
    currentTime?: number;
}

// 모달 글로벌
const Modal = () => {
    const [initGlow, setInitGlow] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isDocumentVisible, setIsDocumentVisible] = useState(false);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    const { initModal, modal, setModal, closeModal } = useModalStore();
    const titleId = useId();
    const pathname = usePathname();
    const previousPath = useRef(pathname);

    const containerRef = useRef<HTMLElement>(null);

    // 함수: 모달 닫음
    const closeModalState = () => {
        if (useModalStore.getState().modal.confirm?.loading) return;
        closeModal();
        setCurrentTime(modal.delay ? modal.delay / 1000 : 0);
        setInitGlow(false);

        if (intervalId) {
            clearInterval(intervalId); // 타이머 정리
        }
    };

    // 함수: 모달 상태 초기화
    const resetModalState = () => {
        if (!useModalStore.getState().modal.isOpen) setModal(initModal);
    };

    // 함수: 타이머 시작
    const startTimer = () => {
        // 이미 타이머가 실행 중인 경우, 기존 타이머를 정리
        if (intervalId) {
            clearInterval(intervalId);
        }

        const id = setInterval(() => {
            setCurrentTime((prev) => {
                const newTime = prev - 1;

                // 시간이 0 이하로 가면 타이머 종료 및 모달 닫기
                if (newTime <= 0) {
                    clearInterval(id); // 타이머 종료
                    closeModalState();
                }

                return newTime; // 새로운 시간값 반환
            });
        }, 1000);

        // intervalId 상태 업데이트
        setIntervalId(id);
    };

    // 함수 : 키 별 세팅
    const preventEnterKey = (event: KeyboardEvent) => {
        switch (event.key) {
            case "Escape":
                event.preventDefault();
                event.stopPropagation();
                return closeModalState();

            case "Tab": {
                const elements = containerRef.current?.querySelectorAll<HTMLElement>(
                    'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]',
                );
                const focusable = Array.from(elements ?? []).filter((element) => element.getClientRects().length > 0);
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (!first) return event.preventDefault();
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
                break;
            }

            default:
                break;
        }
    };

    useEffect(() => {
        if (modal) {
            util.dom.setScrollDefence(modal.isOpen);
            setCurrentTime(modal.delay ? modal.delay / 1000 : 0);

            if (modal.isOpen && modal.delay && modal.delay > 0) {
                startTimer();
            }
        }
    }, [modal.type, modal.isOpen]);

    useEffect(() => {
        const previousFocus = document.activeElement;
        let focusFrame: number | undefined;
        if (modal.isOpen) {
            window.addEventListener("keydown", preventEnterKey);
            focusFrame = requestAnimationFrame(() => containerRef.current?.querySelector<HTMLElement>("input, textarea, select, button")?.focus());
        }

        return () => {
            window.removeEventListener("keydown", preventEnterKey);
            if (focusFrame !== undefined) cancelAnimationFrame(focusFrame);
            if (modal.isOpen && previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
        };
    }, [modal.isOpen]);

    useEffect(() => {
        setIsDocumentVisible(true);
    }, []);

    useEffect(() => {
        if (previousPath.current !== pathname) closeModalState();
        previousPath.current = pathname;
    }, [pathname]);

    if (!isDocumentVisible) {
        return null;
    }

    return ReactDOM.createPortal(
        <AnimatePresence
            mode="wait"
            onExitComplete={() => resetModalState()}
        >
            {modal.isOpen && (
                <Fragment>
                    <section
                        ref={containerRef}
                        className="fixed z-[2000000000] top-0 left-0 w-full h-full inset-0 flex items-center justify-center"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        aria-busy={Boolean(modal.confirm?.loading)}
                    >
                        <motion.div
                            className={`relative flex flex-col w-full bg-[var(--color-surface)] gap-[1.6rem] mx-[1.6rem] z-10 max-h-[calc(100svh-(1.6rem*3))] shadow-[var(--shadow-normal)] ${modal.className?.container !== "" ? modal.className?.container : "max-w-[var(--modal-width)]"}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{
                                delay: 0,
                                type: "spring",
                                mass: 0.1,
                                stiffness: 200,
                                damping: 10,
                            }}
                        >
                            <Header
                                title={modal.title}
                                id={titleId}
                            />

                            <section
                                data-lenis-prevent="true"
                                className="relative flex flex-col gap-[2.4rem] max-h-[calc(100svh-(1.6rem*7))] bg-[var(--color-surface)] rounded-[2.8rem] px-[1.6rem] py-[calc(1.2rem+4rem+0.8rem)] overflow-y-auto"
                            >
                                <Body />
                            </section>

                            <Footer
                                className="flex"
                                confirm={{
                                    title: modal.confirm?.text || "확인",
                                    onClick: modal.confirm?.onClick || (() => {}),
                                    loading: modal.confirm?.loading || null,
                                    className: modal.confirm?.className || "",
                                }}
                                cancel={{
                                    title: modal.cancel?.text || "닫기",
                                    onClick: closeModalState,
                                    className: modal.cancel?.className || "",
                                }}
                            />

                            {currentTime ? <Guide currentTime={currentTime} /> : null}

                            {!initGlow ? (
                                <motion.div
                                    key={`glow-${initGlow}-${modal.isOpen}`}
                                    className="absolute inset-0 pointer-events-none blur-[12px] rounded-full origin-center bg-[radial-gradient(circle,rgba(255,255,255,0)_0%,var(--color-brand-500)_20%,rgba(255,255,255,0)_70%)]"
                                    initial={{ scale: 0, opacity: 0.4 }}
                                    animate={{ scale: 10, opacity: -10 }}
                                    transition={{
                                        duration: 2,
                                        ease: "easeOut",
                                        repeat: 0, // 무한 반복
                                    }}
                                    onAnimationComplete={() => setInitGlow(true)}
                                />
                            ) : (
                                ""
                            )}
                        </motion.div>
                    </section>

                    <DimmedComponent isVisible={modal.isOpen} />
                </Fragment>
            )}
        </AnimatePresence>,
        document.body,
    );
};

// 헤더
const Header = ({ title, id }: { title: string; id: string }) => {
    return (
        <section className="modal-header p-[2.4rem] absolute top-0 left-0 z-[100000]">
            <h2
                id={id}
                className="text-left font-bold text-[1.6rem] text-[var(--color-gray-1000)] select-none pointer-events-none"
            >
                {title}
            </h2>
        </section>
    );
};

// 바디
const Body = ({ children, className }: ModalBodyProps) => {
    const { modal } = useModalStore();

    return (
        <Fragment>
            {modal.description !== "" || modal.content !== null ? (
                <section className={`modal-body flex flex-col gap-[1.2rem] max-h-[calc(100vh-(1.6rem*10))] ${className ? className : ""}`}>
                    {children}
                    {modal.description && <p className="leading-[1.5] text-left text-[1.6rem] text-[var(--color-text-primary)] font-normal cursor-default whitespace-pre-line">{modal.description}</p>}
                    {modal.content}
                    {modal.focusDescription && (
                        <p className="px-[1.6rem] py-[0.8rem] cursor-default text-center bg-[var(--color-gray-50)] rounded-[1.2rem] whitespace-pre-line">{modal.focusDescription}</p>
                    )}
                </section>
            ) : (
                ""
            )}
        </Fragment>
    );
};

// 푸터
const Footer = ({ className, confirm, cancel, currentTime }: ModalFooterProps) => {
    // 전역상태 : 모달
    const { modal, setModal, trackingModalConfirmLoading } = useModalStore();
    const setToast = useToastStore((state) => state.setToast);
    const [isPrevent, setIsPrevent] = useState(false);
    const confirmingRef = useRef(false);
    const isPending = isPrevent || Boolean(confirm?.loading);

    return (
        <section className={`modal-footer w-full flex flex-wrap justify-between absolute bottom-0 left-0 z-[100000] ${className}`}>
            {cancel && cancel?.title !== " " && (
                <UI.Button
                    className={`${cancel?.className ? cancel?.className : "hover:bg-[var(--color-surface-floating)]"} flex-1 font-regular text-[1.6rem] whitespace-nowrap px-[2rem] h-[4.4rem]`}
                    onClick={cancel.onClick}
                    disabled={isPending}
                    rippleColor="#65778a"
                >
                    {cancel.title}
                </UI.Button>
            )}

            {confirm && confirm?.title !== " " && (
                <UI.Button
                    className={`${confirm?.className ? confirm.className : "hover:bg-[var(--color-surface-floating)] text-[#ff4321]"} flex-1 font-regular text-[1.6rem] whitespace-nowrap px-[2rem] h-[4.4rem]`}
                    disabled={isPending}
                    onClick={async () => {
                        const currentModal = useModalStore.getState().modal;
                        if (confirmingRef.current || isPending || !currentModal.isOpen || currentModal.confirm?.onClick !== modal.confirm?.onClick) return;
                        confirmingRef.current = true;
                        setIsPrevent(true);
                        trackingModalConfirmLoading(true);
                        try {
                            const result = await confirm.onClick();
                            if (!modal.isNeedNext && result !== false && useModalStore.getState().modal.confirm?.onClick === modal.confirm?.onClick) {
                                setModal({ isOpen: false });
                            }
                        } catch (cause) {
                            setToast({ msg: cause instanceof Error ? cause.message : "처리하지 못했어요. 다시 시도해주세요.", type: "fail" });
                        } finally {
                            if (useModalStore.getState().modal.confirm?.onClick === modal.confirm?.onClick) trackingModalConfirmLoading(false);
                            confirmingRef.current = false;
                            setIsPrevent(false);
                        }
                    }}
                >
                    {isPending ? "처리 중..." : confirm.title}
                </UI.Button>
            )}
            {currentTime}
        </section>
    );
};

// 가이드
const Guide = ({ currentTime }: ModalGuideProps) => {
    return (
        <section className="flex justify-center pb-[1.6rem]">
            <p className=" text-[1.6rem] text-[var(--color-gray-600)]">
                <i className="bg-[var(--color-gray-100)] px-[0.4rem] py-[0.4rem] rounded-[0.4rem] text-[var(--color-gray-600)] text-[1.2rem]">{currentTime}초</i> 후 자동으로 닫혀요
            </p>
        </section>
    );
};

export default Modal;
