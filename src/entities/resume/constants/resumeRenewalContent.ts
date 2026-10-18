import type { RenewalProjectLinks, RenewalSkillHighlight, RenewalTocItem } from "../model/resume.type";
export type { RenewalProjectLinks, RenewalSkillHighlight, RenewalTocItem } from "../model/resume.type";
import { resumeProfile } from "./resumeData";

export const renewalProfileDetails = {
    motivation: resumeProfile.motivation,
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
        description: "무인 관제·매장 운영·대리점 관리 SaaS를 구축하고 Classic ASP·PHP 서비스를 Next.js로 전환했습니다. UI 설계부터 API 연동·테스트·운영까지 프론트엔드 전 과정을 담당했습니다.",
    },
    {
        id: "legacy-architecture",
        title: "레거시 전환 & 아키텍처",
        description:
            "Classic ASP·PHP·Laravel View의 서비스 흐름을 분석하고 Optional FSD로 관심사를 분리했습니다. 키업패스에서는 500줄 이상 컴포넌트를 200~300줄 이하로 나누며 기능 수정 공수를 3일에서 1일 이내로 줄였습니다.",
    },
    {
        id: "performance",
        title: "성능 & 운영 효율",
        description: "SSR·CSR 역할 분리와 렌더링 최적화로 엔조이소프트 HUB의 최대 25분 로딩을 119ms까지 단축했습니다. 셀프오피스와 모니터링 도구로 반복 문의와 이슈 대응 시간도 줄였습니다.",
    },
    {
        id: "design-system",
        title: "디자인 시스템 & DX",
        description:
            "8배수 디자인 토큰, 네임스페이스 컴포넌트, Storybook 문서화와 Vitest 단위 테스트를 갖춘 EDS를 구축했습니다. 프로젝트별 UI 수정·교체 공수를 7일 이상에서 2일로 약 70% 단축했습니다.",
    },
    {
        id: "ui-ux",
        title: "UI/UX & 인터랙션",
        description:
            "게이미피케이션, 관제 화면, 복잡한 백오피스의 정보 구조와 인터랙션을 직접 설계했습니다. 팬덤박스에서는 연타 경험과 브랜드 UI를 개편해 일일 이용자 수를 120명에서 350명으로 높였습니다.",
    },
    {
        id: "reliability",
        title: "결제 & 서비스 안정성",
        description:
            "Toss Payments 인증 정보를 서버에서 처리하는 결제 흐름을 설계하고, Playwright E2E와 Slack 오류 추적 체계를 구축했습니다. 아이머신 CEO의 일일 오류 문의를 24건에서 10건 이하로 줄였습니다.",
    },
];

export const renewalProjectLinks: Record<string, RenewalProjectLinks> = {
    fandombox: {
        demo: "https://portfoliosj-react.netlify.app/",
        article: "https://portfoliosj-react.netlify.app/",
    },
    maze: {
        demo: "https://portfoliosj-react.netlify.app/",
    },
    fivepixels: {
        demo: "https://fivepixels.agit.com/",
        github: "https://github.com/kimsangjunv1/fivepixels",
    },
    keepupass: {
        github: resumeProfile.github,
    },
    "dev-team-process": {
        github: "https://github.com/kimsangjunv1/fivepixels",
    },
    kqr: {},
    "imachine-ceo": {},
    "enjoysoft-hub": {},
    "agency-ceo": {},
    eds: {},
};

export const renewalContactExtended = {
    phone: resumeProfile.phone,
    phoneHref: `tel:${resumeProfile.phone.replace(/-/g, "")}`,
    portfolio: resumeProfile.portfolio,
    service: resumeProfile.service,
    linkedin: renewalProfileDetails.linkedin,
    linkedinLabel: "linkedin.com/in/kimsangjun-fe",
};
