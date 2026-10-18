"use client";

import Image from "next/image";

import { getRenewalSideProjectAnchorId, renewalSideProject } from "@/entities/resume/constants/resumeRenewalData";
import RenewalProjectLogoPanel from "./RenewalProjectLogoPanel";
import RenewalRightBlocks from "./RenewalRightBlocks";
import RenewalSplitSection from "./RenewalSplitSection";
import { RInverse } from "./renewalStyles";
import AwwwardsFluidCanvas from "./AwwwardsFluidCanvas";

const SHOWCASE_IMAGE = "/images/picture/img-fivepixels-showcase.png";
const SHOWCASE_VIDEO = "/videos/colorflow-animation.mp4";

const ResumeRenewalSideProject = () => {
    const project = renewalSideProject;
    const sectionAnchorId = getRenewalSideProjectAnchorId(project.id);

    return (
        <div className={`flex min-h-[100svh] flex-col ${RInverse.section}`}>
            <RenewalSplitSection
                id={sectionAnchorId}
                divider
                left={
                    <RenewalProjectLogoPanel
                        alt={`${project.title} 로고`}
                        logo={project.logo}
                    />
                }
            >
                <RenewalRightBlocks
                    label={<p className={RInverse.category}>{project.category}</p>}
                    headline={
                        <div>
                            <h2 className={RInverse.keyline}>{project.title}</h2>
                            <p className={`${RInverse.subtitle} mt-[1.2rem]`}>{project.subtitle}</p>
                        </div>
                    }
                    description={<p className={RInverse.body}>{project.overview}</p>}
                    details={
                        <div className="flex flex-col gap-[2.4rem]">
                            <ul className="flex flex-col gap-[1.2rem]">
                                {project.achievements.map((achievement) => (
                                    <li
                                        key={achievement}
                                        className={RInverse.bodyMuted}
                                    >
                                        {achievement}
                                    </li>
                                ))}
                            </ul>

                            <dl className={`grid grid-cols-[7.2rem_1fr] gap-y-[0.8rem] ${RInverse.meta}`}>
                                <dt className="text-[2rem]">일정</dt>
                                <dd className="text-[2rem]">{project.period}</dd>
                                <dt className="text-[2rem]">기술</dt>
                                <dd className="text-[2rem]">{project.techStack}</dd>
                                <dt className="text-[2rem]">인력</dt>
                                <dd className="text-[2rem]">{project.team}</dd>
                            </dl>

                            {(project.links.demo || project.links.github || project.links.article) && (
                                <div className="flex flex-wrap gap-x-[2rem] gap-y-[0.8rem]">
                                    {project.links.demo && (
                                        <a
                                            href={project.links.demo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={RInverse.link}
                                        >
                                            Live Demo
                                        </a>
                                    )}
                                    {project.links.github && (
                                        <a
                                            href={project.links.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={RInverse.link}
                                        >
                                            GitHub
                                        </a>
                                    )}
                                    {project.links.article && (
                                        <a
                                            href={project.links.article}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={RInverse.link}
                                        >
                                            Article
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    }
                />
            </RenewalSplitSection>

            {/* <div className="relative mt-auto h-[50svh] w-full shrink-0 overflow-hidden">
                <video
                    className="absolute inset-0 h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-hidden
                >
                    <source
                        src={SHOWCASE_VIDEO}
                        type="video/mp4"
                    />
                </video>
            </div> */}
            <div className="relative mt-auto h-[50svh] w-full shrink-0 overflow-hidden">
                <Image
                    src={SHOWCASE_IMAGE}
                    alt={`${project.title} 화면 미리보기`}
                    width={1600}
                    height={900}
                    className="absolute top-0 left-0 h-full w-full object-contain"
                    sizes="100vw"
                    priority={false}
                />
                <AwwwardsFluidCanvas
                    initialColor="#000000"
                    // colors={["#E04A2E", "#FFB029", "#000000"]}
                />
            </div>
        </div>
    );
};

export default ResumeRenewalSideProject;
