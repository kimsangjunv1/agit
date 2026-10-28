"use client";

import { renewalHero, renewalProfileDetails } from "@/entities/resume/constants/resumeRenewalData";
import RenewalRightBlocks from "./RenewalRightBlocks";
import RenewalSplitSection from "./RenewalSplitSection";
import { resumeProfile } from "@/entities/resume/constants/resumeData";
import { R } from "./renewalStyles";
import AwwwardsFluidCanvas from "./AwwwardsFluidCanvas";

const ResumeRenewalHero = () => {
    return (
        <RenewalSplitSection
            id="renewal-about"
            leftFill
            leftWrapperClassName="w-full p-[2.4rem]"
            rightClassName="tablet:!flex-col tablet:!justify-end tablet:!items-start tablet:min-h-[calc(100svh-var(--header-height))]"
            left={<div className="tablet:sticky tablet:top-[var(--header-height)] w-full">{/* 프로필 이미지 영역 — 필요 시 RenewalFadeIn + Image 복원 */}</div>}
        >
            <RenewalRightBlocks
                className="min-h-[calc(100svh-(var(--header-height)*2))] justify-center"
                label={<p className={R.label}>{renewalHero.category}</p>}
                headline={
                    <section className="flex flex-col gap-[1.6rem]">
                        <p className={R.label}>{renewalHero.motivationLabel}</p>
                        <div className="flex flex-col gap-[1.6rem]">
                            {renewalHero.motivation.map((paragraph, index) =>
                                index === 0 ? (
                                    <h1
                                        key={paragraph}
                                        className={R.heroKeyline}
                                    >
                                        {paragraph}
                                    </h1>
                                ) : (
                                    <p
                                        key={paragraph}
                                        className={R.body}
                                    >
                                        {paragraph}
                                    </p>
                                ),
                            )}
                        </div>
                    </section>
                }
                description={
                    <section className="flex flex-col gap-[1.6rem]">
                        <p className={R.label}>{renewalHero.introductionLabel}</p>
                        {renewalHero.introduction.map((paragraph) => (
                            <p
                                key={paragraph}
                                className={R.body}
                            >
                                {paragraph}
                            </p>
                        ))}
                    </section>
                }
                details={
                    <div className="flex flex-col gap-[2.4rem]">
                        <div>
                            <p className={R.role}>{renewalHero.role}</p>
                            <p className={R.name}>{renewalHero.title}</p>
                        </div>
                        {/* <div className="flex flex-wrap gap-x-[2rem] gap-y-[0.8rem]">
                            {renewalHero.quickLinks.map((link) =>
                                link.external ? (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={R.link}
                                    >
                                        {link.label}
                                    </a>
                                ) : (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className={R.link}
                                    >
                                        {link.label}
                                    </a>
                                ),
                            )}
                        </div> */}
                        {/* <div className="grid grid-cols-2 gap-[2rem]">
                            {renewalHeroStats.map((stat) => (
                                <div key={stat.label}>
                                    <p className="text-[2rem] font-bold text-[#000000]">{stat.value}</p>
                                    <p className={`${R.meta} mt-[0.4rem]`}>{stat.label}</p>
                                </div>
                            ))}
                        </div> */}
                        <dl className={`${R.divider} pt-[2.4rem] grid grid-cols-[9.2rem_1fr] gap-y-[1.2rem] ${R.meta}`}>
                            {/* <dt>경력</dt>
                            <dd>{resumeProfile.experience}</dd> */}
                            <dt>연락처</dt>
                            <dd>
                                <a
                                    href={`tel:${renewalProfileDetails.phone.replace(/-/g, "")}`}
                                    className={R.link}
                                >
                                    {renewalProfileDetails.phone}
                                </a>
                            </dd>
                            <dt>이메일</dt>
                            <dd>
                                <a
                                    href={`mailto:${resumeProfile.email}`}
                                    className={R.link}
                                >
                                    {resumeProfile.email}
                                </a>
                            </dd>
                            {/* <dt>서비스</dt>
                            <dd>
                                <a
                                    href={renewalProfileDetails.service}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={R.link}
                                >
                                    agit.com
                                </a>
                            </dd> */}
                        </dl>
                    </div>
                }
            />
        </RenewalSplitSection>
    );
};

export default ResumeRenewalHero;
