"use client";

import { renewalContact } from "@/entities/resume/constants/resumeRenewalData";

import { StudioSlider } from "./StudioSlider";

const FOOTER_EMAIL_SVG = "/images/icon/common/footer-email.svg";

const ResumeRenewalEmailBannerSection = () => {
    return (
        <section className="relative left-1/2 w-[100dvw] -translate-x-1/2 overflow-hidden py-[2.4rem]">
            <a
                href={`mailto:${renewalContact.email}`}
                aria-label={`${renewalContact.email}로 이메일 보내기`}
                className="block hover:opacity-70 transition-opacity"
            >
                <StudioSlider
                    variant="marquee"
                    fullWidth
                    items={[{ title: renewalContact.email, image: FOOTER_EMAIL_SVG }]}
                    duration={30}
                />
            </a>
        </section>
    );
};

export default ResumeRenewalEmailBannerSection;
