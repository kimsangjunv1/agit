import type { RenewalProjectLinks, RenewalSkillHighlight, RenewalTocItem } from "../model/resume.type";
export type { RenewalProjectLinks, RenewalSkillHighlight, RenewalTocItem } from "../model/resume.type";
import { resumeProfile } from "./resumeData";

export const renewalProfileDetails = {
    motivation: resumeProfile.motivation.join(" "),
    birthYear: resumeProfile.birthYear,
    phone: resumeProfile.phone,
    military: resumeProfile.military,
    portfolio: resumeProfile.portfolio,
    service: resumeProfile.service,
    linkedin: "https://www.linkedin.com/in/kimsangjun-fe",
};

export const renewalSkillHighlights: RenewalSkillHighlight[] = [
    {
        id: "react-typescript",
        title: "React·Next.js & TypeScript",
        description:
            "점주·대리점 백오피스와 게이미피케이션 서비스를 React·Next.js·TypeScript로 구축했습니다. Classic ASP를 Next.js로 재구축하고, 구독 결제부터 화면 구현·운영까지 프론트엔드 전 과정을 담당했습니다.",
    },
    {
        id: "design-system",
        title: "디자인 시스템 & DX",
        description:
            "다수 프로젝트의 중복 UI를 npm 패키지·Storybook·tsup 기반 EDS로 통합했습니다. 대표적으로 캘린더 변경 작업을 약 6~7일에서 1일 이내로 줄이고, 프로젝트별 버전을 독립 관리하도록 설계했습니다.",
    },
    {
        id: "qa-feedback",
        title: "QA 피드백 & 협업",
        description:
            "화면 클릭으로 마커·의견을 남기는 QA 피드백 라이브러리를 구축해 동일 이슈 재질문을 평균 3~4회에서 0~1회로 줄였습니다. DOM 폴백과 상대 좌표로 반응형 환경에서도 마커 위치를 유지합니다.",
    },
    {
        id: "performance",
        title: "성능 & 운영 모니터링",
        description:
            "팬덤박스에서 GPU 가속·WebP·스프라이트로 iPhone 6 FPS를 23에서 55~60으로 개선했습니다. 아이머신 CEO에서는 Slack으로 API·Breadcrumbs를 전달해 오류 대응을 약 1~2일에서 평균 3시간 이내로 단축했습니다.",
    },
    {
        id: "legacy-architecture",
        title: "레거시 전환 & 아키텍처",
        description:
            "Classic ASP의 페이지·상태·API 의존성을 분석해 Next.js App Router와 Zustand·TanStack Query 계층으로 재구축했습니다. 기능 변경 대응을 약 1주에서 1~6시간으로 줄였습니다.",
    },
    {
        id: "reliability",
        title: "결제 & 서비스 안정성",
        description:
            "토스페이먼츠 빌링키 구독 결제와 서버 측 멱등성 키로 중복 결제를 방지하고, SSR 기반 구독 상태 검증으로 초기 화면 깜빡임을 줄였습니다. 민감 정보는 마스킹해 Slack으로 전달합니다.",
    },
];

export const renewalProjectLinks: Record<string, RenewalProjectLinks> = {
    "qa-feedback": {
        github: "https://github.com/kimsangjunv1/fivepixels",
        demo: "https://www.npmjs.com/package/@fivepixels-js/react?activeTab=readme",
    },
    eds: {},
    "imachine-ceo": {},
    fandombox: {
        demo: "https://portfoliosj-react.netlify.app/",
        article: "https://portfoliosj-react.netlify.app/",
    },
    fivepixels: {
        demo: "https://fivepixels.agit.com/",
        github: "https://github.com/kimsangjunv1/fivepixels",
        article: "https://www.npmjs.com/package/@fivepixels-js/react?activeTab=readme",
    },
};

export const renewalContactExtended = {
    phone: resumeProfile.phone,
    phoneHref: `tel:${resumeProfile.phone.replace(/-/g, "")}`,
    portfolio: resumeProfile.portfolio,
    service: resumeProfile.service,
    linkedin: renewalProfileDetails.linkedin,
    linkedinLabel: "linkedin.com/in/kimsangjun-fe",
};
