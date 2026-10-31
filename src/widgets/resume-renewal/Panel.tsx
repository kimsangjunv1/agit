"use client";

import { renewalExperiences } from "@/entities/resume/constants/resumeRenewalData";

import * as Layer from "./ui";
import { R } from "./ui/renewalStyles";
import { Fragment, ReactNode, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import Scrollbar from "@/shared/ui/common/Scrollbar";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";

const MASCOT_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

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
    return (
        <article className={`relative w-full overflow-x-hidden grid grid-cols-2 ${R.root}`}>
            <Scrollbar
                direction="vertical"
                aria-label="최신 글 세로 스크롤"
                viewportRef={detailContainerRef}
                className="h-[100svh] w-full border-r border-r-[#ffffff20]"
                autoHide
            >
                <SectionItem
                    isFirstSection
                    title="안녕하세요"
                    text="테스트"
                    // text="개요 오리온캑터스는 디자인을 바탕으로 기획과 개발을 함께하는 스튜디오입니다. 웹과 앱, 폰트와 브랜드 등에서 문제에 맞는 형태를 찾고, 잘 쓰이고 또 마음이 가는 경험을 설계합니다.
                    // 쌓아온 지식과 자원을 슬기롭게 활용해, 함께 만든 결과를 계속 쓰고 발전시킬 수 있도록 필요한 자산과 방법을 나눕니다. design@orioncactus.com"
                    className={{
                        container: "relative h-[100dvh] flex justify-center overflow-hidden",
                    }}
                    backdrop={<FirstSectionMascot />}
                />

                <SectionItem
                    title="개요"
                    text="개요 오리온캑터스는 디자인을 바탕으로 기획과 개발을 함께하는 스튜디오입니다. 웹과 앱, 폰트와 브랜드 등에서 문제에 맞는 형태를 찾고, 잘 쓰이고 또 마음이 가는 경험을 설계합니다.
                    쌓아온 지식과 자원을 슬기롭게 활용해, 함께 만든 결과를 계속 쓰고 발전시킬 수 있도록 필요한 자산과 방법을 나눕니다. design@orioncactus.com"
                />
                <CarouselItem
                    title="함께 만들 수 있는 것"
                    text="asd"
                />
                <CarouselItem
                    title="함께 만들 수 있는 것"
                    text="asd"
                />
                <SectionItem
                    title="경험 분야"
                    element={
                        <div>
                            <section>asd</section>
                            <section>asd</section>
                        </div>
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

            <Scrollbar
                direction="vertical"
                aria-label="최신 글 세로 스크롤"
                viewportRef={easyContainerRef}
                className="h-[100svh] w-full"
                autoHide
            >
                <SectionItem
                    title="한눈에 보기"
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

const FirstSectionMascot = () => {
    const reducedMotion = useReducedMotion();
    const canPlayIntro = useLayoutStore((state) => state.isPageContentVisible && state.transitionPhase === "idle");
    const introHidden = { y: "100%" };
    const introVisible = { y: 0 };

    return (
        <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 left-[-72px] bottom-[-72px] z-0 flex justify-start"
            initial={reducedMotion ? false : introHidden}
            animate={reducedMotion || canPlayIntro ? introVisible : introHidden}
            transition={{
                duration: reducedMotion ? 0 : 0.9,
                ease: MASCOT_REVEAL_EASE,
            }}
        >
            <Image
                src="/images/picture/img-resume-renewal-mascot.svg"
                alt=""
                width={369}
                height={319}
                priority
                className="h-auto w-[50%] select-none"
                // className="h-auto w-[min(92%,48rem)] select-none"
            />
        </motion.div>
    );
};

const SectionItem = ({ title, text, element, backdrop, divider = true, isFirstSection = false, className }: SectionItem) => {
    const contentLayerClassName = backdrop ? "relative z-10" : "";

    return (
        <section
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
        <section className={`pb-[5.2rem] px-[5.2rem] flex flex-col gap-[1.6rem] ${divider ? "border-b border-b-[#ffffff20]" : ""} ${isFirstSection ? "pt-[19.2rem]" : "pt-[5.2rem]"}`}>
            <section>
                <h2>{title}</h2>
                <button onClick={() => setOpen(!open)}>보기</button>
            </section>

            {open ? <p>{text}</p> : null}
        </section>
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
