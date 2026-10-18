"use client";

import { renewalSkillHighlights } from "@/entities/resume/constants/resumeRenewalData";
import RenewalRightBlocks from "./RenewalRightBlocks";
import RenewalSplitSection from "./RenewalSplitSection";
import { R } from "./renewalStyles";

const ResumeRenewalSkillSection = () => {
    return (
        <RenewalSplitSection
            id="renewal-skills"
            divider
            className="relative"
            leftWrapperClassName="!items-stretch !justify-center overflow-hidden w-full"
            left={<div className="flex w-full flex-col gap-[4rem]" />}
        >
            <RenewalRightBlocks
                label={<p className={R.label}>Skills</p>}
                detailItems={renewalSkillHighlights.map((skill) => (
                    <p
                        key={skill.id}
                        className={R.body}
                    >
                        <span className="font-bold text-[2rem]">{skill.title}</span> {skill.description}
                    </p>
                ))}
            />
        </RenewalSplitSection>
    );
};

export default ResumeRenewalSkillSection;
