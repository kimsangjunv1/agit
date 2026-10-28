import type { ResumeProjectMetric, ResumeProject, ResumeExperience } from "../model/resume.type";
export type { ResumeProjectMetric, ResumeProject, ResumeExperience } from "../model/resume.type";

export const resumeProfile = {
    name: "김상준",
    role: "프론트엔드 개발자",
    experience: "2년 7개월",
    birthYear: "1997년생",
    email: "to_before@naver.com",
    phone: "010-6607-7265",
    github: "https://github.com/kimsangjunv1",
    portfolio: "https://portfoliosj-react.netlify.app/",
    service: "https://agit.com/home/",
    military: "군필 (2017.12 ~ 2019.08, 육군 병장)",
    motivation: [
        "점주와 대리점이 사용하는 백오피스를 개발하고 운영하면서, 반복되는 UI 수정과 QA 과정의 비효율을 직접 개선해 왔습니다.",
        "여러 프로젝트에서 동일한 UI를 각각 관리하던 문제를 해결하기 위해 공통 컴포넌트 패키지를 구축했고, 기존에 6~7일 걸리던 캘린더 변경 작업을 1일 이내로 줄였습니다.",
        "또한 QA 과정에서 오류 위치를 확인하기 위해 여러 차례 질문이 오가는 문제를 해결하고자 화면에서 직접 피드백을 남길 수 있는 라이브러리를 개발했습니다.",
        "디자인과 프론트엔드 개발을 모두 경험한 만큼, 사용성을 고려한 화면 구현부터 운영 과정에서 발생하는 문제의 개선까지 함께 맡을 수 있습니다.",
        "특히 반복되는 UI 개발과 수정 작업을 줄이고, 서비스의 변화에 빠르게 대응할 수 있는 프론트엔드 환경을 만드는 데 기여하겠습니다.",
    ],
    introduction: [
        "약 2년 7개월간 점주 및 대리점용 매장 관리 백오피스와 게이미피케이션 서비스를 개발, 안정화해 온 프론트엔드 개발자입니다.",
        "대리점 100곳 이상과 점주 8,000명 이상이 사용하는 서비스에서 구독 결제·정산·운영 관리 기능을 개발하고, Classic ASP 기반 백오피스를 Next.js로 재구축하며 유지보수 구조를 개선했습니다.",
        "또한 여러 백오피스를 운영하면서 반복되는 UI 수정과 QA 과정의 커뮤니케이션 문제를 경험했습니다. 이를 줄이기 위해 공통 디자인 시스템과 화면 내 오류 위치를 직접 표시할 수 있는 피드백 라이브러리를 구축했습니다.",
    ],
    mission: "반복되는 UI 개발과 수정 작업을 줄이고, 서비스의 변화에 빠르게 대응할 수 있는 프론트엔드 환경을 만듭니다.",
};

export const resumeTechStack = [
    "React 19",
    "Next.js 15",
    "TypeScript 5",
    "Tailwind CSS 4",
    "Zustand 5",
    "TanStack Query",
    "Framer Motion",
    "Playwright",
    "Vitest",
    "Storybook",
    "Supabase",
    "Laravel",
    "JavaScript",
    "SCSS",
    "Bootstrap",
    "tsup",
    "Toss Payments",
    "Slack Webhook",
];

export const resumeProjects: ResumeProject[] = [
    {
        id: "qa-feedback",
        title: "QA용 피드백 라이브러리",
        subtitle: "사내 QA 프로세스 간소화를 위한 공용 피드백 라이브러리",
        period: "2026.04 ~ 2026.07",
        techStack: "React, TypeScript, Tailwind CSS, tsup",
        team: "FE 1인 / BE 1인 (프론트엔드 전체 전담)",
        overview: "검수자가 화면에 마커와 의견을 남기면 개발자가 해당 위치로 이동해 수정·확인할 수 있는 피드백 라이브러리",
        highlight: {
            label: "동일 이슈 재질문",
            before: "3~4회",
            after: "0~1회",
        },
        chartLabel: "QA Follow-up Questions",
        chartPoints: [100, 82, 64, 48, 36, 28, 22, 18, 12],
        metrics: [
            { label: "재질문", value: "0~1회", sub: "평균 3~4회 → 0~1회" },
            { label: "좌표", value: "상대 비율", sub: "반응형 마커 유지" },
            { label: "담당", value: "100%", sub: "FE 전담" },
        ],
        achievements: [
            "노션 기반 이슈 관리의 재현·위치 파악 어려움을 화면 클릭 피드백으로 바꿔 동일 이슈 재질문을 평균 3~4회에서 0~1회로 줄임",
            "절대 좌표 대신 DOM 식별자와 요소 기준 상대 좌표를 저장해 창 크기가 바뀌어도 마커 위치를 재계산",
            "기존 서비스 코드 수정 없이 data-* → id → DOM 경로 순 폴백으로 대상을 찾고, 요소 삭제 시 반투명 마커와 안내를 유지",
            "QA·기획·디자인이 별도 기술 지식 없이 화면에서 이슈를 등록·확인할 수 있는 시각적 피드백 UI 구현",
        ],
    },
    {
        id: "eds",
        title: "EDS 디자인 시스템",
        subtitle: "사내 다수 프로젝트를 위한 공용 디자인 시스템",
        period: "2026.01 ~ 2026.05",
        techStack: "React, TypeScript, Tailwind CSS, Storybook, tsup",
        team: "FE 2인 (방향 제안 및 전체 컴포넌트 설계 담당)",
        overview: "제품마다 반복되던 UI를 공통 기준으로 관리하기 위한 사내 컴포넌트 패키지",
        highlight: {
            label: "캘린더 UI 변경",
            before: "6~7일",
            after: "1일 이내",
        },
        chartLabel: "UI Update Lead Time",
        chartPoints: [100, 86, 72, 58, 45, 34, 26, 20, 14],
        metrics: [
            { label: "수정 공수", value: "1일 이내", sub: "약 6~7일 → 1일" },
            { label: "배포", value: "npm", sub: "버전 독립 관리" },
            { label: "담당", value: "설계 주도", sub: "FE 2인" },
        ],
        achievements: [
            "프로젝트별 UI를 공통 컴포넌트 패키지로 정리해 대표적으로 캘린더 날짜 범위·표시 변경을 약 6~7일에서 1일 이내로 단축",
            "공통 UI를 npm 패키지로 분리하고 package.json 의존성 버전을 프로젝트별로 독립 관리하도록 설계",
            "Props·상태별 동작을 Storybook으로 문서화해 동일 기준으로 검증·수정할 수 있는 협업 환경 구축",
            "기초/종합 컴포넌트와 기본·공통·특수 콜백 API를 구분해 제품별 차이를 Props로 제어하는 확장 구조 설계",
        ],
    },
    {
        id: "imachine-ceo",
        title: "아이머신 CEO",
        subtitle: "점주용 매장 관리 백오피스 · ASP → Next.js 마이그레이션",
        period: "2025.07 ~ 2026.02",
        techStack: "Next.js, TypeScript, Zustand, TanStack Query, Tailwind CSS, Toss Payments",
        team: "FE 2인 / BE 1인 (코드 검수·구독 로직·운영 모니터링 담당)",
        overview: "점주·대리점 업무를 한곳에서 처리하는 백오피스. 구독 결제·SSR 상태 검증·Slack 오류 모니터링을 구축",
        highlight: {
            label: "일일 관련 문의",
            before: "31건",
            after: "3~4건",
        },
        chartLabel: "Daily Support Requests",
        chartPoints: [100, 78, 58, 42, 30, 22, 16, 13, 11],
        metrics: [
            { label: "운영 문의", value: "3~4건", sub: "일 최대 31건 → 3~4건" },
            { label: "오류 대응", value: "3시간 이내", sub: "약 1~2일 → 평균 3시간" },
            { label: "기능 대응", value: "1~6시간", sub: "약 1주 → 단축" },
        ],
        achievements: [
            "전화·개별 솔루션에 분산된 대리점 업무를 단일 백오피스로 통합해 일일 관련 문의를 최대 31건에서 3~4건으로 감소",
            "토스페이먼츠 PG 빌링키 구독 결제와 서버 측 멱등성 키로 중복 결제를 방지하고, SSR 기반 구독 상태 검증·리다이렉트로 초기 노출 안정화",
            "API 요청·응답·Breadcrumbs를 Slack으로 전달하는 모니터링을 구축해 오류 대응을 약 1~2일에서 평균 3시간 이내로 단축",
            "Classic ASP의 화면·상태·API 의존성을 분석해 Next.js·Zustand·TanStack Query 계층으로 재구축, 기능 변경 대응을 약 1주에서 1~6시간으로 개선",
        ],
    },
    {
        id: "fandombox",
        title: "팬덤박스",
        subtitle: "게이미피케이션 서비스 플로우 설계 및 구축",
        period: "2023.12 ~ 2024.07",
        techStack: "Laravel(Blade), JavaScript, SCSS, Bootstrap",
        team: "FE 1인 / BE 3인 (프론트엔드 전체 담당)",
        overview: "연타·패턴형 인터랙션으로 진행도와 보상을 제공하는 리워드 서비스",
        highlight: {
            label: "iPhone 6 FPS",
            before: "23",
            after: "55~60",
        },
        chartLabel: "Mobile FPS",
        chartPoints: [38, 42, 48, 55, 62, 72, 82, 90, 100],
        metrics: [
            { label: "FPS", value: "55~60", sub: "iPhone 6 기준 23 → 55~60" },
            { label: "인터랙션", value: "게이지", sub: "3×3 → 연속 터치" },
            { label: "담당", value: "100%", sub: "FE 전담" },
        ],
        achievements: [
            "항목마다 당첨 API를 호출하던 3×3 구조의 한계를 보고 연속 터치·게이지 기반 인터랙션으로 전환을 제안·설계",
            "게이지 진행 구간별로 요청 시점을 분리하고 완료 연출 전에 서버 응답을 반영해 검증과 인터랙션 연속성을 함께 확보",
            "스프라이트 전환·WebP 최적화·GPU 가속 애니메이션으로 iPhone 6 기준 FPS를 23에서 55~60으로 개선",
        ],
    },
];

/** /resume Side Project 전용 (오픈소스 FivePixels) */
export const resumeSideProject: ResumeProject = {
    id: "fivepixels",
    title: "FivePixels",
    subtitle: "원하는 요소에 피드백을 남기고 피드백 관리 UI를 제공하는 React 라이브러리",
    period: "2026.05.20 ~ 진행 중",
    techStack: "React, TypeScript, Zustand, Shadow DOM, Vitest",
    team: "FE 1명 (개인 프로젝트 · MIT 오픈소스)",
    overview:
        "스테이징·QA·내부 도구 화면에서 DOM 요소에 피드백 마커를 남기고, 답변·검수 후 GitHub Issue로 전환할 수 있는 React 라이브러리입니다. 사내 QA용 피드백 라이브러리의 기반이 된 오픈소스입니다.",
    highlight: {
        label: "npm 공개 버전",
        before: "0.0.0",
        after: "0.2.7",
    },
    chartLabel: "Library Progress",
    chartPoints: [15, 28, 42, 55, 68, 78, 85, 90, 93, 95],
    metrics: [
        { label: "패키지", value: "React", sub: "npm 공개 라이브러리" },
        { label: "피드백", value: "DOM", sub: "요소 단위 마커" },
        { label: "라이선스", value: "MIT", sub: "오픈소스" },
    ],
    achievements: [
        "DOM 요소 단위 마커와 data-report-id·selector 기반 위치 복원으로 화면 맥락이 유지되는 피드백 흐름 구현",
        "피드백 작성·답변·검수·상태 관리부터 GitHub Issue 전환까지 이어지는 QA 협업 플로우 설계",
        "Shadow DOM 기반 무설정 UI와 스타일·레이아웃을 실시간 조정하는 UI Edit·Before/After·Undo/Redo 기능 구현",
    ],
};

/** 이력서와 동일한 경력 단위 (회사) */
export const resumeExperiences: ResumeExperience[] = [
    {
        id: "enjoysoft",
        title: "주식회사 엔조이소프트",
        employmentType: "full-time",
        period: "2024.11 ~ 현재 재직중",
        role: "프론트엔드 개발자 · 기술연구소 전임",
        team: "FE 2명",
        overview: "점주·대리점용 백오피스와 구독 결제를 구축하고, 공통 디자인 시스템과 QA 피드백 라이브러리로 반복 UI 수정·QA 비용을 줄였습니다.",
        projectIds: ["qa-feedback", "eds", "imachine-ceo"],
    },
    {
        id: "maze-company",
        title: "주식회사 메이즈",
        employmentType: "full-time",
        period: "2023.12 ~ 2024.08",
        role: "프론트엔드 개발자 · 개발팀 사원",
        team: "FE 1명",
        overview: "연타형 게이미피케이션 리워드 서비스의 프론트엔드 전체와 인터랙션·성능 최적화를 담당했습니다.",
        projectIds: ["fandombox"],
    },
];
