export type ResumeProjectMetric = {
    label: string;
    value: string;
    sub?: string;
};

export type ResumeProject = {
    id: string;
    title: string;
    subtitle: string;
    period: string;
    techStack: string;
    team: string;
    overview: string;
    highlight: {
        label: string;
        before: string;
        after: string;
        unit?: string;
    };
    chartLabel: string;
    chartPoints: number[];
    metrics: ResumeProjectMetric[];
    achievements: string[];
};

export type ResumeExperience = {
    id: string;
    /** 회사명 */
    title: string;
    employmentType: "full-time" | "client";
    period: string;
    role: string;
    team: string;
    overview: string;
    projectIds: string[];
};

export type ResumeProjectDetailSection = {
    title: string;
    items: string[];
    ordered?: boolean;
};

export type ResumeProjectFlowChart = {
    src: string;
    alt: string;
};

export type ResumeProjectDetail = {
    id: string;
    title: string;
    category: string;
    summary: string;
    overview: string;
    role: string;
    team: string;
    tileMetric: string;
    technologies: { name: string; description: string }[];
    /** 문제와 요구사항 섹션 위에 표시할 플로우 차트 */
    flowCharts?: ResumeProjectFlowChart[];
    sections: ResumeProjectDetailSection[];
};

export type RenewalProjectLinks = {
    demo?: string;
    github?: string;
    article?: string;
};

export type RenewalSkillHighlight = {
    id: string;
    title: string;
    description: string;
};

export type RenewalTocItem = {
    id: string;
    label: string;
};

export type RenewalSectionEntry = Pick<ResumeProject, "id" | "title" | "subtitle" | "period" | "techStack" | "team" | "overview" | "achievements"> & {
    category: string;
    logo?: string;
    links: RenewalProjectLinks;
};
