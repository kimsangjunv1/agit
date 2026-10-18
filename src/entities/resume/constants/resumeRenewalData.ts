import type { RenewalSectionEntry } from "../model/resume.type";
export type { RenewalSectionEntry } from "../model/resume.type";
import type { ResumeProject } from "./resumeData";
import { resumeExperiences, resumeProfile, resumeProjects, resumeSideProject, resumeTechStack } from "./resumeData";
import {
    renewalContactExtended,
    renewalProfileDetails,
    renewalProjectLinks,
    renewalSkillHighlights,
    type RenewalProjectLinks,
    type RenewalSkillHighlight,
    type RenewalTocItem,
} from "./resumeRenewalContent";

export type { RenewalProjectLinks, RenewalSkillHighlight, RenewalTocItem } from "./resumeRenewalContent";

export { renewalContactExtended, renewalProfileDetails, renewalProjectLinks, renewalSkillHighlights };

export const RENEWAL_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

export const RENEWAL_VIEWPORT = {
    once: false,
    margin: "-10%",
    amount: 0.2,
} as const;

export const renewalHero = {
    category: "HELLO",
    title: resumeProfile.name,
    subtitle: resumeProfile.role,
    greeting: `안녕하세요,\n프론트엔드 개발자 ${resumeProfile.name}입니다.`,
    intro: [
        "2년 7개월간 React·Next.js 기반 프론트엔드 개발을 담당하며, 결제·정산 시스템과 대규모 백오피스의 신규 구축 및 레거시 전환을 주도해 왔습니다.",
        "약 8,000건 규모의 데이터 조회 병목과 고빈도 인터랙션의 API 호출·렌더링 성능을 개선하고, API 에러 로깅·알림 체계로 운영 안정성을 높였습니다.",
        "사용자에게 보이는 화면뿐 아니라, 제품을 함께 만드는 사람들의 개발·협업 경험까지 개선하는 프론트엔드 개발자를 지향합니다.",
    ],
    role: "Frontend Developer",
    profileImage: "/images/picture/resume-profile.png",
    quickLinks: [
        { label: "Live Demo", href: resumeProfile.service, external: true },
        { label: "GitHub", href: resumeProfile.github, external: true },
        { label: "Email", href: `mailto:${resumeProfile.email}`, external: false },
    ],
};

const EMPLOYMENT_CATEGORY: Record<"full-time" | "client", string> = {
    "full-time": "working at",
    client: "Client Work",
};

const SIDE_PROJECT_CATEGORY = "Personal Project";

const EXPERIENCE_TOC_LABELS: Record<string, string> = {
    enjoysoft: "Enjoysoft",
    "maze-company": "Maze",
};

export const renewalProjectVisuals: Record<string, { category: string; logo?: string }> = {
    fandombox: { category: "Product" },
    maze: { category: "Corporate" },
    fivepixels: { category: "Open Source" },
    keepupass: { category: "SaaS Admin" },
    "dev-team-process": { category: "Team Lead" },
    kqr: { category: "SaaS" },
    "imachine-ceo": { category: "SaaS" },
    "enjoysoft-hub": { category: "Internal SaaS" },
    "agency-ceo": { category: "SaaS" },
};

function getProjectById(projectId: string): ResumeProject {
    const project = resumeProjects.find((item) => item.id === projectId);
    if (!project) {
        throw new Error(`Unknown resume project: ${projectId}`);
    }
    return project;
}

function mergeProjectLinks(projectIds: string[]): RenewalProjectLinks {
    return projectIds.reduce<RenewalProjectLinks>((acc, projectId) => {
        const links = renewalProjectLinks[projectId] ?? {};
        return {
            demo: acc.demo ?? links.demo,
            github: acc.github ?? links.github,
            article: acc.article ?? links.article,
        };
    }, {});
}

function mergeTechStack(projectIds: string[]): string {
    const stacks = projectIds.map((projectId) => getProjectById(projectId).techStack);
    return [
        ...new Set(
            stacks
                .join(", ")
                .split(", ")
                .map((item) => item.trim()),
        ),
    ].join(", ");
}

const EXPERIENCE_ACHIEVEMENTS: Record<string, string[]> = {
    "maze-company": [
        "초당 20~30회의 연속 입력을 300ms 단위로 병합해 API 호출을 최대 초당 3회로 제한",
        "렌더링 부하를 줄여 iPhone 6 평균 FPS를 20대에서 45 이상으로 개선",
        "기업 홈페이지에 지연 로딩과 코드 분할을 적용해 LCP를 5.1초에서 2.3초로 단축",
        "초기 JavaScript 용량을 1.4MB에서 690KB로 줄이고, 저사양 기기에서 주요 흐름을 회귀 검증",
    ],
    enjoysoft: [
        "Classic ASP 점주 백오피스의 12개 화면을 Next.js로 이관하고, 약 8,000건의 조회 시간을 24분에서 12초로 단축",
        "대리점 백오피스의 중복 API 요청을 화면당 4~6회에서 1회로 줄이고, Playwright 회귀 시나리오 18개 구축",
        "사내 디자인 시스템을 구축해 UI 수정·교체 기간을 7일 이상에서 2일로 단축하고, 작업 공수 약 70% 절감",
        "라이선스 관리 프로세스를 자동화해 연간 수작업 약 200시간 절감",
        "토스페이먼츠 인증·결제 정보를 서버에서 처리하도록 설계하고, 유료 전환율 80% 이상 달성",
    ],
};

function buildExperienceAchievements(experienceId: string): string[] {
    const achievements = EXPERIENCE_ACHIEVEMENTS[experienceId];
    if (!achievements) {
        throw new Error(`Unknown resume experience achievements: ${experienceId}`);
    }
    return achievements;
}

function buildExperienceEntry(experienceId: string): RenewalSectionEntry {
    const experience = resumeExperiences.find((item) => item.id === experienceId);
    if (!experience) {
        throw new Error(`Unknown resume experience: ${experienceId}`);
    }

    return {
        id: experience.id,
        title: experience.title,
        subtitle: experience.role,
        period: experience.period,
        techStack: mergeTechStack(experience.projectIds),
        team: experience.team,
        overview: experience.overview,
        achievements: buildExperienceAchievements(experience.id),
        category: EMPLOYMENT_CATEGORY[experience.employmentType],
        links: mergeProjectLinks(experience.projectIds),
    };
}

function buildProjectSectionEntry(project: ResumeProject, categoryOverride?: string): RenewalSectionEntry {
    const visual = renewalProjectVisuals[project.id] ?? { category: "Product" };

    return {
        id: project.id,
        title: project.title,
        subtitle: project.subtitle,
        period: project.period,
        techStack: project.techStack,
        team: project.team,
        overview: project.overview,
        achievements: project.achievements,
        category: categoryOverride ?? visual.category,
        logo: visual.logo,
        links: renewalProjectLinks[project.id] ?? {},
    };
}

export const renewalExperiences: RenewalSectionEntry[] = resumeExperiences.map((experience) => buildExperienceEntry(experience.id));

export const renewalSideProject: RenewalSectionEntry = buildProjectSectionEntry(resumeSideProject, SIDE_PROJECT_CATEGORY);

export const renewalContact = {
    email: resumeProfile.email,
    github: resumeProfile.github,
    githubLabel: "github.com/kimsangjunv1",
    quote: '"사용자 경험과 동료의 개발 경험을 함께 개선합니다."',
    notion: "https://app.notion.com/p/3d4a7d54d69680e59c30d5f43f0e8e45?source=copy_link",
    notionLabel: "노션",
};

export function getRenewalExperienceAnchorId(experienceId: string) {
    return `renewal-experience-${experienceId}`;
}

export function getRenewalSideProjectAnchorId(projectId: string) {
    return `renewal-side-project-${projectId}`;
}

/** 실제 렌더링 섹션과 동기화된 TOC — 경력·사이드 프로젝트는 데이터에서 자동 생성 */
export const renewalTocItems: RenewalTocItem[] = [
    { id: "renewal-about", label: "About" },
    ...renewalExperiences.map((experience) => ({
        id: getRenewalExperienceAnchorId(experience.id),
        label: EXPERIENCE_TOC_LABELS[experience.id] ?? experience.title,
    })),
    { id: "renewal-projects", label: "Projects" },
    { id: "renewal-skills", label: "Skills" },
    {
        id: getRenewalSideProjectAnchorId(renewalSideProject.id),
        label: "Side Project",
    },
];

export function buildRenewalPersonJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        name: resumeProfile.name,
        jobTitle: resumeProfile.role,
        email: resumeProfile.email,
        url: resumeProfile.service,
        sameAs: [resumeProfile.github, renewalProfileDetails.linkedin, resumeProfile.portfolio],
        knowsAbout: resumeTechStack,
        description: resumeProfile.introduction,
    };
}
