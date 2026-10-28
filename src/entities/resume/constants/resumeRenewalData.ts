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
    category: "ABOUT",
    title: resumeProfile.name,
    subtitle: resumeProfile.role,
    motivationLabel: "Motivation.",
    motivation: resumeProfile.motivation,
    introductionLabel: "Introduction.",
    introduction: resumeProfile.introduction,
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
    "qa-feedback": { category: "Internal Tool" },
    eds: { category: "Design System" },
    "imachine-ceo": { category: "SaaS" },
    fandombox: { category: "Product" },
    fivepixels: { category: "Open Source" },
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
    enjoysoft: [
        "QA용 피드백 라이브러리로 동일 이슈 재질문을 평균 3~4회에서 0~1회로 줄임",
        "EDS 디자인 시스템으로 캘린더 등 공통 UI 변경을 약 6~7일에서 1일 이내로 단축",
        "아이머신 CEO를 Next.js로 재구축하고 일일 관련 문의를 최대 31건에서 3~4건으로 감소",
        "Slack 모니터링으로 오류 대응을 약 1~2일에서 평균 3시간 이내로 단축",
        "토스페이먼츠 빌링키 구독 결제와 서버 측 멱등성 키·SSR 구독 검증을 설계·구현",
    ],
    "maze-company": [
        "3×3 당첨 구조를 연속 터치·게이지 인터랙션으로 전환해 서버 부하와 게임 경험을 함께 개선",
        "게이지 구간별 API 요청 분리로 당첨 검증과 인터랙션 연속성을 확보",
        "스프라이트·WebP·GPU 가속으로 iPhone 6 기준 FPS를 23에서 55~60으로 개선",
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
    quote: '"반복되는 UI·QA 비용을 줄이고, 변화에 빠른 프론트엔드 환경을 만듭니다."',
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
        description: resumeProfile.introduction.join(" "),
    };
}
