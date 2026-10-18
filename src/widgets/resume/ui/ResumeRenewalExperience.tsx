"use client";

import type { RenewalSectionEntry } from "@/entities/resume/constants/resumeRenewalData";
import { getRenewalExperienceAnchorId, renewalExperiences } from "@/entities/resume/constants/resumeRenewalData";
import RenewalRightBlocks from "./RenewalRightBlocks";
import RenewalSplitSection from "./RenewalSplitSection";
import { R } from "./renewalStyles";

type ResumeRenewalExperienceProps = {
    experience: RenewalSectionEntry;
    anchorId?: string;
};

const ResumeRenewalExperience = ({ experience, anchorId }: ResumeRenewalExperienceProps) => {
    const sectionAnchorId = anchorId ?? getRenewalExperienceAnchorId(experience.id);

    return (
        <RenewalSplitSection
            id={sectionAnchorId}
            divider
        >
            <RenewalRightBlocks
                label={<p className={R.label}>WORK</p>}
                headline={
                    <div>
                        <h2 className={R.keyline}>{experience.title}</h2>
                        <p className={`${R.body} mt-[0.8rem] font-normal`}>{experience.subtitle}</p>
                        <p className="mt-[0.4rem] text-[2rem] leading-[1.75] text-[#000000]/50">{experience.period}</p>
                    </div>
                }
                details={
                    <ul className="flex list-disc flex-col gap-[1.2rem] pl-[2rem]">
                        {experience.achievements.map((achievement) => (
                            <li
                                key={achievement}
                                className={R.bodyMuted}
                            >
                                {achievement}
                            </li>
                        ))}
                    </ul>
                }
            />
        </RenewalSplitSection>
    );
};

export default ResumeRenewalExperience;
