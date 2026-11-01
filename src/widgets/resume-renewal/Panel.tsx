"use client";

import { renewalExperiences } from "@/entities/resume/constants/resumeRenewalData";

import * as Layer from "./ui";
import { R } from "./ui/renewalStyles";
import { Fragment, ReactNode, useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Scrollbar from "@/shared/ui/common/Scrollbar";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import { ColumnIslandStack } from "./ui/ColumnIslandStack";
import ScrollProgressIsland from "./ui/ScrollProgressIsland";
import StickyMascot from "./ui/StickyMascot";

const MASCOT_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const MASCOT_BACK_ARM_MAX_DEG = 55;
const MASCOT_FRONT_ARM_MAX_DEG = 25;
const MASCOT_FACE_MAX_DEG = 10;
const MASCOT_ANGLE_SOFTNESS = 1.15;

const mapSoftAngle = (normalized: number, maxDeg: number) => maxDeg * Math.tanh(normalized * MASCOT_ANGLE_SOFTNESS);

type DefaultInfoType = {
    title: string;
    text?: string;
    element?: ReactNode;
    backdrop?: ReactNode;
    className?: { container?: string; title?: string; text?: string };
};

interface SectionItem extends DefaultInfoType {
    divider?: boolean;
    isFirstSection?: boolean;
    sectionRef?: RefObject<HTMLElement | null>;
}

interface ListItem extends DefaultInfoType {
    divider?: boolean;
    isFirstSection?: boolean;
}

interface CarouselItem extends DefaultInfoType {
    divider?: boolean;
    isFirstSection?: boolean;
}

export default function Panel() {
    const easyContainerRef = useRef<HTMLDivElement | null>(null);
    const detailContainerRef = useRef<HTMLDivElement | null>(null);
    const firstSectionRef = useRef<HTMLElement | null>(null);
    const [isFirstSectionVisible, setIsFirstSectionVisible] = useState(true);

    useEffect(() => {
        const viewport = detailContainerRef.current;
        const section = firstSectionRef.current;
        if (!viewport || !section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsFirstSectionVisible(Boolean(entry?.isIntersecting));
            },
            {
                root: viewport,
                threshold: 0,
            },
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    return (
        <article className={`relative w-full overflow-x-hidden grid grid-cols-2 ${R.root}`}>
            <div className="relative min-h-0 min-w-0">
                <Scrollbar
                    direction="vertical"
                    aria-label="상세 세로 스크롤"
                    viewportRef={detailContainerRef}
                    className="h-[100svh] w-full border-r border-r-[#ffffff20]"
                    autoHide
                >
                    <SectionItem
                        isFirstSection
                        sectionRef={firstSectionRef}
                        title="'안녕하세요'"
                        text="안녕하세요 불가합니다."
                        // text="개요 오리온캑터스는 디자인을 바탕으로 기획과 개발을 함께하는 스튜디오입니다. 웹과 앱, 폰트와 브랜드 등에서 문제에 맞는 형태를 찾고, 잘 쓰이고 또 마음이 가는 경험을 설계합니다.
                        // 쌓아온 지식과 자원을 슬기롭게 활용해, 함께 만든 결과를 계속 쓰고 발전시킬 수 있도록 필요한 자산과 방법을 나눕니다. design@orioncactus.com"
                        className={{
                            container: "relative h-[100dvh] flex justify-center overflow-hidden",
                        }}
                        backdrop={<FirstSectionMascot isSectionVisible={isFirstSectionVisible} />}
                    />

                    <SectionItem
                        title="개요"
                        text="개요 오리온캑터스는 디자인을 바탕으로 기획과 개발을 함께하는 스튜디오입니다. 웹과 앱, 폰트와 브랜드 등에서 문제에 맞는 형태를 찾고, 잘 쓰이고 또 마음이 가는 경험을 설계합니다.
                    쌓아온 지식과 자원을 슬기롭게 활용해, 함께 만든 결과를 계속 쓰고 발전시킬 수 있도록 필요한 자산과 방법을 나눕니다. design@orioncactus.com"
                    />
                    <SectionItem
                        title="함께 만들 수 있는 것"
                        element={
                            <section className="flex flex-col gap-[1.6rem]">
                                <CarouselItem
                                    title="웹 디자인 및 개발"
                                    text="asd"
                                />
                                <CarouselItem
                                    title="앱 디자인 및 개발"
                                    text="asd"
                                />
                                <CarouselItem
                                    title="브랜딩"
                                    text="asd"
                                />
                                <CarouselItem
                                    title="프론트엔드"
                                    text="asd"
                                />
                            </section>
                        }
                    />
                    <SectionItem
                        title="이렇게 만듭니다"
                        element={
                            <section>
                                <CarouselItem
                                    title="필요한 것부터 함께 찾습니다"
                                    text="asd"
                                />
                                <CarouselItem
                                    title="쓰일 환경에서 확인하며 만듭니다"
                                    text="asd"
                                />
                                <CarouselItem
                                    title="마음이 가는 이유까지 챙깁니다"
                                    text="asd"
                                />
                                <CarouselItem
                                    title="다음 작업으로 이어갈 수 있게 합니다"
                                    text="asd"
                                />
                            </section>
                        }
                    />
                    <SectionItem
                        title="경험 분야"
                        element={
                            <section>
                                <CarouselItem
                                    title="함께 만들 수 있는 것"
                                    text="asd"
                                />
                            </section>
                        }
                    />
                    <SectionItem
                        title="작업"
                        element={
                            <div>
                                <section>asd</section>
                                <section>asd</section>
                            </div>
                        }
                    />
                </Scrollbar>
                <ColumnIslandStack>
                    <ScrollProgressIsland
                        viewportRef={detailContainerRef}
                        label="상세"
                        ariaLabel="상세 스크롤 진행"
                    />
                </ColumnIslandStack>
            </div>

            <div className="relative min-h-0 min-w-0">
                <Scrollbar
                    direction="vertical"
                    aria-label="한눈에 보기 세로 스크롤"
                    viewportRef={easyContainerRef}
                    className="h-[100svh] w-full"
                    autoHide
                >
                    <SectionItem
                        title="프로젝트"
                        element={
                            <section className="grid grid-cols-2 gap-[5.2rem]">
                                <ProjectItem
                                    title="asd"
                                    text="asd"
                                />
                                <ProjectItem
                                    title="asd"
                                    text="asd"
                                />
                                <ProjectItem
                                    title="asd"
                                    text="asd"
                                />
                                <ProjectItem
                                    title="asd"
                                    text="asd"
                                />
                            </section>
                        }
                    />

                    <SectionItem
                        title="라이브러리"
                        element={
                            <section className="grid grid-cols-2 gap-[5.2rem]">
                                <ProjectItem
                                    title="asd"
                                    text="asd"
                                />
                                <ProjectItem
                                    title="asd"
                                    text="asd"
                                />
                            </section>
                        }
                    />

                    <SectionItem
                        title="서비스"
                        element={
                            <section className="grid grid-cols-2 gap-[5.2rem]">
                                <ProjectItem
                                    title="asd"
                                    text="asd"
                                />
                                <ProjectItem
                                    title="asd"
                                    text="asd"
                                />
                            </section>
                        }
                    />
                </Scrollbar>
                <ColumnIslandStack>
                    <ScrollProgressIsland
                        viewportRef={easyContainerRef}
                        label="한눈에 보기"
                        ariaLabel="한눈에 보기 스크롤 진행"
                    />
                </ColumnIslandStack>
            </div>
            <StickyMascot isSectionVisible={isFirstSectionVisible} />
            {/* <Layer.Hero />
            <Layer.Worklog entries={renewalExperiences} />
            <Layer.ProjectGrid />
            <Layer.SideProject />
            <Layer.Awwwards />
            <Layer.Footer />
            <Layer.EmailBannerSection /> */}
        </article>
    );
}

const FirstSectionMascot = ({ isSectionVisible }: { isSectionVisible: boolean }) => {
    const bodyRef = useRef<HTMLDivElement | null>(null);
    const reducedMotion = useReducedMotion();
    const canPlayIntro = useLayoutStore((state) => state.isPageContentVisible && state.transitionPhase === "idle");
    const introHidden = { y: "100%" };
    const introVisible = { y: 0 };
    const shouldRise = canPlayIntro && isSectionVisible;
    const backArmTarget = useMotionValue(0);
    const faceTarget = useMotionValue(0);
    const frontArmTarget = useMotionValue(0);
    // 뒤팔(가장 빠름) → 얼굴 → 앞팔(가장 느림)
    const backArmRotate = useSpring(backArmTarget, {
        stiffness: reducedMotion ? 1000 : 150,
        damping: reducedMotion ? 80 : 22,
        mass: 0.42,
    });
    const faceRotate = useSpring(faceTarget, {
        stiffness: reducedMotion ? 1000 : 145,
        damping: reducedMotion ? 80 : 25,
        mass: 0.55,
    });
    const frontArmRotate = useSpring(frontArmTarget, {
        stiffness: reducedMotion ? 1000 : 95,
        damping: reducedMotion ? 80 : 28,
        mass: 0.72,
    });

    useEffect(() => {
        if (reducedMotion) {
            backArmTarget.set(0);
            faceTarget.set(0);
            frontArmTarget.set(0);
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            const body = bodyRef.current;
            if (!body) return;

            const bounds = body.getBoundingClientRect();
            const centerX = bounds.left + bounds.width * 0.42;
            const normalized = (event.clientX - centerX) / Math.max(bounds.width * 0.75, 1);
            backArmTarget.set(mapSoftAngle(normalized, MASCOT_BACK_ARM_MAX_DEG));
            faceTarget.set(mapSoftAngle(normalized, MASCOT_FACE_MAX_DEG));
            frontArmTarget.set(mapSoftAngle(normalized, MASCOT_FRONT_ARM_MAX_DEG));
        };

        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        return () => window.removeEventListener("pointermove", handlePointerMove);
    }, [backArmTarget, faceTarget, frontArmTarget, reducedMotion]);

    return (
        <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 left-[-72px] bottom-[-72px] z-0 flex justify-start"
            initial={reducedMotion ? false : introHidden}
            animate={shouldRise ? introVisible : introHidden}
            transition={{
                duration: reducedMotion ? 0 : 0.9,
                ease: MASCOT_REVEAL_EASE,
            }}
        >
            <div
                ref={bodyRef}
                className="relative w-[50%] select-none"
            >
                <motion.img
                    src="/images/picture/img-resume-renewal-mascot-hand-back.svg"
                    alt=""
                    width={127}
                    height={128}
                    draggable={false}
                    className="absolute bottom-[30%] left-[60%] z-0 h-auto w-[38%] origin-bottom"
                    style={{ rotate: backArmRotate }}
                />
                <motion.div
                    className="relative z-[1] absolute bottom-[-10%] left-[-10%]"
                    // className="relative z-[1] origin-bottom"
                    style={{ rotate: faceRotate }}
                >
                    <Image
                        src="/images/picture/img-resume-renewal-mascot.svg"
                        alt=""
                        width={369}
                        height={319}
                        priority
                        className="h-auto w-full"
                    />
                </motion.div>
                <motion.img
                    src="/images/picture/img-resume-renewal-mascot-hand-front.svg"
                    alt=""
                    width={127}
                    height={125}
                    draggable={false}
                    className="absolute bottom-[4%] left-[40%] z-[2] h-auto w-[40%] origin-bottom"
                    style={{ rotate: frontArmRotate }}
                />
            </div>
        </motion.div>
    );
};

const SectionItem = ({ title, text, element, backdrop, divider = true, isFirstSection = false, sectionRef, className }: SectionItem) => {
    const contentLayerClassName = backdrop ? "relative z-10" : "";

    return (
        <section
            ref={sectionRef}
            className={`pb-[5.2rem] px-[5.2rem] flex flex-col gap-[1.6rem] ${className?.container ? className?.container : ""} ${divider ? "border-b border-b-[#ffffff20]" : ""} ${isFirstSection ? "pt-[19.2rem]" : "pt-[5.2rem]"}`}
        >
            {backdrop}
            <h5 className={`${contentLayerClassName} ${className?.title ?? ""} font-bold`}>{title}</h5>
            <p className={`${contentLayerClassName} ${className?.text ?? ""} ${className?.text ? "" : "leading-[1.5]"} `}>{text}</p>
            {element ? <div className={contentLayerClassName}>{element}</div> : null}
        </section>
    );
};

const ListItem = () => {
    return (
        <section>
            <p>asd</p>
        </section>
    );
};

const CarouselItem = ({ title, text, divider = true, isFirstSection = false, className }: CarouselItem) => {
    const [open, setOpen] = useState(false);
    return (
        <button
            className={`flex flex-col items-start gap-[0.4rem] ${open ? "mb-[1.2rem]" : ""}`}
            onClick={() => setOpen(!open)}
        >
            <section className="flex gap-[0.8rem]">
                <h2 className={`${open ? "text-[var(--color-brand-500)]" : ""}`}>{title}</h2>
                <p
                    className={`text-[1.2rem] skew-x-[-8deg] rounded-[0.2rem] bg-[var(--color-brand-500)] h-[1.5rem] px-[0.2rem] pt-[0.1rem] font-extrabold text-black ${open ? "text-[var(--color-brand-500)]" : ""}`}
                >
                    {open ? "Hide" : "View"}
                </p>
            </section>

            {open ? <p className="text-[var(--color-brand-300)]">{text}</p> : null}
        </button>
    );
};

const ProjectItem = ({ title, text }: { title: string; text: string }) => {
    return (
        <section className="flex flex-col gap-[1.6rem]">
            <div className="w-fill h-fill obect bg-[#00000020] aspect-video" />

            <section>
                <h5>{title}</h5>
                <p>{text}</p>
            </section>
        </section>
    );
};
