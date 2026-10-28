"use client";

import { ArrowUpRight, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { resumeProjectDetails, type ResumeProjectDetail, type ResumeProjectDetailSection } from "@/entities/resume/constants/resumeProjectDetails";
import { R } from "./renewalStyles";

const PROJECT_DIALOG_LAYER_ID = "resume-project-dialog-layer";
const PROJECT_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const PROJECT_DETAIL_TITLE_CLASS_NAME = "font-semibold text-[1.6rem]";
const PROJECT_DETAIL_CONTENT_CLASS_NAME = "text-[1.6rem] font-medium leading-[1.5] pc:text-[2rem]";
const PROJECT_REVEAL_VARIANTS = {
    hidden: { x: "100%" },
    visible: { x: 0 },
};

const ProjectTile = ({ project, index, onSelect }: { project: ResumeProjectDetail; index: number; onSelect: (project: ResumeProjectDetail) => void }) => {
    const reducedMotion = useReducedMotion();

    return (
        <motion.button
            type="button"
            // className="group aspect-square overflow-hidden bg-white p-0 text-left transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            className="group h-[28.125vw] max-h-[54rem] overflow-hidden bg-[var(--color-surface)] p-0 text-left transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            // className="h-full w-full overflow-hidden bg-white p-0 text-left transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            aria-label={`${project.title} 상세 보기`}
            initial={reducedMotion ? false : "hidden"}
            whileInView={reducedMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.2 }}
            onClick={() => onSelect(project)}
        >
            <motion.div
                className="relative flex h-full w-full flex-col justify-between p-[2.4rem]"
                variants={PROJECT_REVEAL_VARIANTS}
                transition={{
                    duration: 0.75,
                    delay: index * 0.08,
                    ease: PROJECT_REVEAL_EASE,
                }}
            >
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[var(--color-background-light)] transition-colors duration-300 group-hover:bg-[var(--color-surface-floating)]"
                />

                <div className="relative z-10 flex w-full items-start justify-between gap-[1.6rem]">
                    <span className="text-[1.6rem] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-text-muted)]">{String(index + 1).padStart(2, "0")}</span>
                    <ArrowUpRight size={20} />
                </div>

                <div className="relative z-10">
                    <section>
                        <p className="text-[2rem] leading-[1.5] text-[var(--color-text-primary)] group-hover:text-[var(--color-text-muted)]">{project.category}</p>
                        <h3 className="text-[2rem] font-bold leading-[1.5]">{project.title}</h3>
                    </section>

                    <p className="text-[2rem] font-medium leading-[1.5]">{project.tileMetric}</p>
                </div>
            </motion.div>
        </motion.button>
    );
};

const ProjectDetailSection = ({ section }: { section: ResumeProjectDetailSection }) => {
    return (
        <section className="flex flex-col gap-[1.6rem]">
            <h3 className={PROJECT_DETAIL_TITLE_CLASS_NAME}>{section.title}</h3>
            <div className="flex flex-col gap-[1.2rem]">
                {section.items.map((item) => (
                    <p
                        className={PROJECT_DETAIL_CONTENT_CLASS_NAME}
                        key={item}
                    >
                        {item}
                    </p>
                ))}
            </div>
        </section>
    );
};

const ProjectDetailModal = ({ project, onClose }: { project: ResumeProjectDetail; onClose: () => void }) => {
    const titleId = useId();

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const backgroundElements = Array.from(document.body.children)
            .filter((element) => element.id !== PROJECT_DIALOG_LAYER_ID && element.tagName !== "SCRIPT")
            .map((element) => ({
                element,
                hadInert: element.hasAttribute("inert"),
                ariaHidden: element.getAttribute("aria-hidden"),
            }));
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        document.body.style.overflow = "hidden";
        backgroundElements.forEach(({ element }) => {
            element.setAttribute("inert", "");
            element.setAttribute("aria-hidden", "true");
        });
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            backgroundElements.forEach(({ element, hadInert, ariaHidden }) => {
                if (!hadInert) element.removeAttribute("inert");
                if (ariaHidden === null) element.removeAttribute("aria-hidden");
                else element.setAttribute("aria-hidden", ariaHidden);
            });
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return createPortal(
        <div
            id={PROJECT_DIALOG_LAYER_ID}
            className="fixed inset-0 z-[120] flex items-center justify-center"
        >
            <button
                type="button"
                className="absolute inset-0 cursor-default bg-black/55"
                aria-label="프로젝트 상세 닫기"
                onClick={onClose}
            />

            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative flex max-h-[100svh] h-full w-full max-w-[var(--size-tablet)] shadow-[0_0_120px_220px_#00000020] flex-col overflow-hidden bg-[var(--color-surface)] shadow-2xl"
            >
                <header className="sticky top-0 z-10 flex items-start justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 p-[2.4rem]">
                    <section className="flex min-w-0 flex-col gap-[0.8rem]">
                        <p className="text-[1.6rem] font-semibold uppercase text-[var(--color-text-primary)]">{project.category}</p>
                        <h2
                            id={titleId}
                            className="text-[2.4rem] font-bold"
                        >
                            {project.title}
                        </h2>
                    </section>

                    <section className="flex shrink-0 items-center gap-[0.8rem]">
                        <button
                            type="button"
                            className="flex h-[4rem] w-[4rem] items-center justify-center border border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-floating)] hover:text-[var(--color-text-primary)]"
                            aria-label="닫기"
                            autoFocus
                            onClick={onClose}
                        >
                            <X size={20} />
                        </button>
                    </section>
                </header>

                <div
                    className="flex-1 overflow-y-auto"
                    data-lenis-prevent="true"
                >
                    <section className="p-[2.4rem] flex flex-col gap-[1.6rem] border-b border-[var(--color-border)]">
                        <p className={PROJECT_DETAIL_TITLE_CLASS_NAME}>한줄 요약</p>
                        <p className={PROJECT_DETAIL_CONTENT_CLASS_NAME}>{project.summary}</p>
                    </section>

                    <section className="p-[2.4rem] flex flex-col gap-[1.6rem] border-b border-[var(--color-border)]">
                        <p className={PROJECT_DETAIL_TITLE_CLASS_NAME}>설명</p>
                        <p className={PROJECT_DETAIL_CONTENT_CLASS_NAME}>{project.overview}</p>
                    </section>

                    <section className="grid grid-cols-[1fr_auto_1fr] border-b border-[var(--color-border)]">
                        <div className="p-[2.4rem] flex flex-col gap-[1.6rem]">
                            <p className={PROJECT_DETAIL_TITLE_CLASS_NAME}>담당</p>
                            <p className={PROJECT_DETAIL_CONTENT_CLASS_NAME}>{project.role}</p>
                        </div>

                        <div className="h-full w-[0.4rem] bg-[var(--color-border)]" />

                        <div className="p-[2.4rem] flex flex-col gap-[1.6rem]">
                            <p className={PROJECT_DETAIL_TITLE_CLASS_NAME}>구성 인원</p>
                            <p className={PROJECT_DETAIL_CONTENT_CLASS_NAME}>{project.team}</p>
                        </div>
                    </section>

                    <section className="flex flex-col gap-[1.6rem] border-b border-[var(--color-border)] p-[2.4rem]">
                        <h3 className={PROJECT_DETAIL_TITLE_CLASS_NAME}>기술 스택과 활용</h3>
                        <div className="flex flex-col gap-[1.2rem]">
                            {project.technologies.map((technology) => (
                                <p
                                    className={PROJECT_DETAIL_CONTENT_CLASS_NAME}
                                    key={technology.name}
                                >
                                    {technology.name}: {technology.description}
                                </p>
                            ))}
                        </div>
                    </section>

                    <section className="flex flex-col gap-[3.2rem] p-[2.4rem]">
                        {project.flowCharts && project.flowCharts.length > 0 ? (
                            <section className="flex flex-col gap-[1.6rem]">
                                <h3 className={PROJECT_DETAIL_TITLE_CLASS_NAME}>프로세스 플로우</h3>
                                <div className="flex flex-col gap-[1.6rem]">
                                    {project.flowCharts.map((flowChart) => (
                                        <figure
                                            key={flowChart.src}
                                            className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-background-light)]"
                                        >
                                            <Image
                                                src={flowChart.src}
                                                alt={flowChart.alt}
                                                width={1807}
                                                height={605}
                                                className="h-auto w-full object-contain"
                                            />
                                        </figure>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        {project.sections.map((section) => (
                            <ProjectDetailSection
                                key={section.title}
                                section={section}
                            />
                        ))}
                    </section>
                </div>
            </section>
        </div>,
        document.body,
    );
};

const ResumeRenewalProjectGrid = () => {
    const [selectedProject, setSelectedProject] = useState<ResumeProjectDetail | null>(null);
    const closeProject = useCallback(() => setSelectedProject(null), []);

    return (
        <section
            id="renewal-projects"
            className="mx-auto w-full max-w-[var(--size-pc)] scroll-mt-[10rem]"
            // className="mx-auto w-full max-w-[calc(72rem*2)] scroll-mt-[10rem]"
            // className="mx-auto w-full max-w-[calc(72rem*2)] scroll-mt-[10rem] py-[8rem] pc:py-[12rem]"
        >
            <h2 className={`${R.label} mb-[3.2rem]`}>Projects</h2>

            <div className="grid grid-cols-1 gap-0 tablet:grid-cols-2">
                {resumeProjectDetails.map((project, index) => (
                    <ProjectTile
                        key={project.id}
                        project={project}
                        index={index}
                        onSelect={setSelectedProject}
                    />
                ))}
            </div>

            {selectedProject ? (
                <ProjectDetailModal
                    project={selectedProject}
                    onClose={closeProject}
                />
            ) : null}
        </section>
    );
};

export default ResumeRenewalProjectGrid;
