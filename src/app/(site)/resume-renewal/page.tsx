import type { Metadata } from "next";
import Script from "next/script";

import { buildRenewalPersonJsonLd } from "@/entities/resume/constants/resumeRenewalData";
import { buildPageMetadata, serializeJsonLd } from "@/shared/lib/seo/metadata";
import Main from "@/widgets/layout/Main";
import ResumeRenewalView from "@/views/resume-renewal/ResumeRenewalView";

export const metadata: Metadata = buildPageMetadata({
    title: "RESUME",
    description: "김상준 프론트엔드 개발자 포트폴리오 — React·Next.js SaaS, 레거시 마이그레이션, UI/UX 및 디자인 시스템 구축 성과",
    path: "/resume-renewal",
});

const Page = () => {
    const personJsonLd = buildRenewalPersonJsonLd();

    return (
        <>
            <Script
                id="resume-renewal-person-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(personJsonLd) }}
            />
            <Main
                id="resume-renewal"
                className={{ inner: "p-0", container: "" }}
            >
                <ResumeRenewalView />
            </Main>
        </>
    );
};

export default Page;
