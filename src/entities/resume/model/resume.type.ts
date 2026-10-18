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
