"use client";

import { renewalContact, renewalContactExtended } from "@/entities/resume/constants/resumeRenewalData";
import RenewalRightBlocks from "./RenewalRightBlocks";
import RenewalSplitSection from "./RenewalSplitSection";
import { R } from "./renewalStyles";

const ResumeRenewalFooter = () => {
    return (
        <RenewalSplitSection
            divider
            className="min-h-[100svh]"
            splitClassName="min-h-[100svh]"
            rightClassName="min-h-[100svh] !items-center !py-0"
        >
            <RenewalRightBlocks
                label={<p className={R.label}>End</p>}
                headline={<p className={R.keyline}>사용자에게 닿는 화면을 코드로 옮기는 일, 그 과정이 여전히 가장 즐겁습니다.</p>}
                description={
                    <div className="flex flex-col gap-[1.2rem]">
                        <p className={R.bodyMuted}>프론트엔드 개발자로서, 읽기 좋은 코드와 팀에 도움이 되는 구현을 꾸준히 만들어가고 싶습니다. 함께 더 나은 제품을 만들 수 있는 자리를 기대합니다.</p>
                        <a
                            href={`mailto:${renewalContact.email}`}
                            className={R.link}
                        >
                            {renewalContact.email}
                        </a>
                        <a
                            href={renewalContactExtended.phoneHref}
                            className={R.link}
                        >
                            {renewalContactExtended.phone}
                        </a>
                    </div>
                }
                details={
                    <div className="flex flex-col gap-[0.8rem]">
                        <a
                            href={renewalContact.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={R.link}
                        >
                            {renewalContact.githubLabel}
                        </a>
                        <a
                            href={renewalContact.notion}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={R.link}
                        >
                            {renewalContact.notionLabel}
                        </a>
                        {/* <a
                            href={renewalContactExtended.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={R.link}
                        >
                            {renewalContactExtended.linkedinLabel}
                        </a> */}
                        <a
                            href={renewalContactExtended.service}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={R.link}
                        >
                            agit.com
                        </a>
                        {/* <a
                            href={renewalContactExtended.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={R.link}
                        >
                            portfoliosj-react.netlify.app
                        </a> */}
                        <p className={R.meta}>© {new Date().getFullYear()} Kim Sangjun</p>
                    </div>
                }
            />
        </RenewalSplitSection>
    );
};

export default ResumeRenewalFooter;
