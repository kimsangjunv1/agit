import type { ResumeProjectDetailSection, ResumeProjectDetail } from "../model/resume.type";
export type { ResumeProjectDetailSection, ResumeProjectDetail } from "../model/resume.type";

export const resumeProjectDetails: ResumeProjectDetail[] = [
    {
        id: "qa-feedback",
        title: "QA용 피드백 라이브러리",
        category: "사내 QA 프로세스 간소화 공용 라이브러리",
        summary: "화면 클릭으로 마커·의견을 남기는 피드백 도구를 구축해 동일 이슈 재질문을 평균 3~4회에서 0~1회로 줄인 프로젝트",
        overview: "검수자가 화면에 마커와 의견을 남기면 개발자가 해당 위치로 이동해 수정·확인할 수 있는 사내 공용 피드백 라이브러리",
        role: "프론트엔드 전체 전담 (100%)",
        team: "프론트엔드 1명, 백엔드 1명",
        tileMetric: "재질문 3~4회 → 0~1회",
        flowCharts: [
            {
                src: "/images/picture/img-resume-flow-qa-feedback.png",
                alt: "QA 피드백 라이브러리 기존·개선 프로세스 플로우",
            },
        ],
        technologies: [
            {
                name: "React",
                description: "시각적 피드백 UI와 마커·목록·설정 플로우를 컴포넌트로 구성",
            },
            {
                name: "TypeScript",
                description: "DOM 탐색·좌표 비율·피드백 상태의 타입을 명세해 안전성 확보",
            },
            {
                name: "Tailwind CSS",
                description: "비개발 직군도 바로 쓸 수 있는 시각적 툴 UI 스타일링",
            },
            {
                name: "tsup",
                description: "다수 프로젝트에 설치 가능한 공용 패키지 빌드·배포",
            },
        ],
        sections: [
            {
                title: "문제와 요구사항",
                items: [
                    "노션 캡처·설명만으로는 오류 위치와 재현 조건을 특정하기 어려워 개발자에게 재질문이 평균 3~4회 발생",
                    "반응형·창 크기·글씨 크기 차이에도 마커가 올바른 위치에 렌더링되어야 함",
                    "QA·기획·디자인이 별도 기술 지식 없이 쓸 수 있어야 하고, 다수 프로젝트에 간단히 도입 가능해야 함",
                ],
            },
            {
                title: "담당 구현",
                items: [
                    "작성·목록·설정·버전 선택 등 시각적 피드백 UI를 제공해 러닝 커브를 낮춤",
                    "대상 요소 조회를 dataset → 고유 id → DOM 경로 순 폴백으로 설계하고, 요소 삭제 시 반투명 마커와 안내 유지",
                    "절대 좌표 대신 getBoundingClientRect 기반 요소 내 비율 좌표를 저장해 창 크기 변경 후에도 마커 위치 복원",
                    "FivePixels의 DOM 탐색·좌표 저장 방식을 사내 환경에 맞게 변형·적용",
                ],
            },
            {
                title: "구현 결과",
                items: [
                    "동일 이슈에 대한 재질문을 기존 평균 3~4회에서 0~1회로 감소 (QA 이슈 10건 기준 측정)",
                    "PC~모바일까지 창 크기가 달라도 요소 영역 기준으로 마커를 재계산해 피드백 위치 유지",
                    "단일 값에 묶이지 않는 조회 우선순위로 도입 부담과 잘못된 타깃 고정을 방지",
                ],
            },
        ],
    },
    {
        id: "eds",
        title: "EDS 디자인 시스템",
        category: "사내 공용 디자인 시스템 패키지",
        summary: "중복 UI를 공통 컴포넌트 패키지로 통합해 대표 UI 변경·QA·배포 주기를 약 6~7일에서 1일 이내로 단축한 프로젝트",
        overview: "여러 제품에서 반복되던 UI를 공통 Props·API 기준으로 관리하기 위해 구축한 사내 컴포넌트 패키지",
        role: "방향 제안 및 전체 컴포넌트 설계 담당",
        team: "프론트엔드 2명",
        tileMetric: "UI 변경 6~7일 → 1일",
        flowCharts: [
            {
                src: "/images/picture/img-resume-flow-eds.png",
                alt: "EDS 디자인 시스템 기존·개선 프로세스 플로우",
            },
        ],
        technologies: [
            {
                name: "React",
                description: "기초·종합 컴포넌트를 모듈화해 제품별 차이를 Props로 제어",
            },
            {
                name: "TypeScript",
                description: "컴포넌트 API·콜백 타입을 명세하고 deprecated 대상은 IDE 툴팁으로 안내",
            },
            {
                name: "Storybook",
                description: "Props·상태별 동작을 문서화해 동일 기준으로 검증·수정",
            },
            {
                name: "tsup",
                description: "컴포넌트·타입·스타일을 빌드해 GitHub Packages로 배포",
            },
            {
                name: "Tailwind CSS",
                description: "공통 스타일 토큰과 유틸리티 기반 UI 일관성 확보",
            },
        ],
        sections: [
            {
                title: "문제와 요구사항",
                items: [
                    "동일 목적 UI를 프로젝트마다 다른 Props·로직으로 구현해 변경 시 개별 분석·수정·QA·배포가 반복됨",
                    "기능이 같아도 디자인·동작 차이가 생겨 일관성과 검증 비용이 커짐",
                    "소수 인력으로 다수 프로젝트를 유지보수해야 해 공통 UI 기준과 변경 영향 범위 통제가 필요",
                ],
            },
            {
                title: "담당 구현",
                items: [
                    "반복 사용 컴포넌트·색상·Props·조합 방식을 분석해 기초(Input, Button, Table)와 종합(Modal, Calendar 등)으로 구분",
                    "기본 API·공통 콜백·특수 콜백으로 API를 나누고, Modal/BottomSheet는 typed buttons 배열로 close/action을 구분",
                    "Storybook 문서화와 tsup 빌드 후 프로젝트별 버전을 선택해 적용하도록 설계해 사이드 이펙트를 통제",
                    "대표적으로 캘린더 날짜 범위·표시 화면 변경 주기를 약 6~7일에서 1일 이내로 단축",
                ],
            },
            {
                title: "구현 결과",
                items: [
                    "공통 UI 변경 작업의 수정·QA·배포 기간을 약 6~7일에서 1일 이내로 단축",
                    "프로젝트별 UI를 공통 Props·컴포넌트 API 기준으로 관리할 수 있게 됨",
                    "Storybook과 버전 선택으로 팀 협업·유지보수와 안전한 점진 적용이 가능해짐",
                ],
            },
        ],
    },
    {
        id: "imachine-ceo",
        title: "아이머신 CEO",
        category: "점주용 백오피스 · ASP → Next.js 재구축",
        summary: "Classic ASP 백오피스를 Next.js로 재구축하고 구독 결제·Slack 모니터링을 도입해 일일 문의를 31건에서 3~4건으로, 오류 대응을 평균 3시간 이내로 줄인 프로젝트",
        overview: "점주·대리점 업무를 한곳에서 처리하는 매장 관리 백오피스. 구독 결제, SSR 상태 검증, 운영 오류 모니터링을 포함",
        role: "코드 검수, 구독 로직 설계, 운영 오류 모니터링 개발",
        team: "프론트엔드 2명, 백엔드 1명",
        tileMetric: "문의 31건 → 3~4건",
        flowCharts: [
            {
                src: "/images/picture/img-resume-flow-imachine-monitoring.png",
                alt: "아이머신 CEO 운영 오류 모니터링 기존·개선 플로우",
            },
            {
                src: "/images/picture/img-resume-flow-imachine-migration.png",
                alt: "아이머신 CEO ASP 마이그레이션 기존·개선 플로우",
            },
        ],
        technologies: [
            {
                name: "Next.js",
                description: "App Router·Route Handler로 화면과 서버 요청을 분리하고 SSR 구독 검증 적용",
            },
            {
                name: "TypeScript",
                description: "도메인 API·상태·화면 계층의 타입을 명세해 유지보수성 확보",
            },
            {
                name: "Zustand",
                description: "매장 정보·모달·토스트 등 여러 화면 공통 상태 관리",
            },
            {
                name: "TanStack Query",
                description: "목록 조회·변경 후 캐시 갱신 등 서버 데이터 책임 분리",
            },
            {
                name: "Toss Payments",
                description: "빌링키 기반 구독 결제와 서버 측 멱등성 키로 중복 결제 방지",
            },
            {
                name: "Slack Webhook",
                description: "API 요청·응답·Breadcrumbs·최근 행동을 마스킹해 전달하는 모니터링",
            },
        ],
        sections: [
            {
                title: "문제와 요구사항",
                items: [
                    "전화와 개별 솔루션에 분산된 대리점 업무로 일일 관련 문의가 최대 31건까지 발생",
                    "ASP 파일에 화면·이벤트·검증·저장이 혼재하고 DOM·전역 변수 의존이 커 기능 변경에 약 1주 소요",
                    "PM2 로그와 사용자 문의만으로는 원인 조사가 약 1~2일 걸려 빠른 운영 대응이 어려움",
                ],
            },
            {
                title: "담당 구현",
                items: [
                    "ASP 페이지·기능·상태·API 의존성을 분석해 Next.js 계층(app/views/widgets/features/entities/shared)으로 재구축",
                    "토스페이먼츠 빌링키 구독 결제와 서버 멱등성 키를 도입하고, SSR 구독 상태 검증·리다이렉트로 깜빡임·지연을 완화",
                    "공통 API 클라이언트·Error Boundary·최근 행동 8건을 Slack으로 전달하고, 동일 오류 10초 재전송 억제·민감정보 마스킹 적용",
                    "페이지 공유는 Context, 공통은 Zustand, 서버 데이터는 TanStack Query로 상태 책임을 분리",
                ],
            },
            {
                title: "구현 결과",
                items: [
                    "일일 관련 문의를 최대 31건에서 3~4건으로 감소",
                    "오류 대응을 약 1~2일에서 평균 3시간 이내로 단축 (유사 오류 10건 기준)",
                    "기능 변경·추가 대응을 약 1주에서 1~6시간으로 개선",
                ],
            },
        ],
    },
    {
        id: "fandombox",
        title: "팬덤박스",
        category: "게이미피케이션 리워드 서비스",
        summary: "3×3 당첨 구조를 연속 터치·게이지 인터랙션으로 전환하고, iPhone 6 기준 FPS를 23에서 55~60으로 개선한 프로젝트",
        overview: "연타·패턴형 인터랙션으로 진행도와 보상을 제공하는 팬 리워드 서비스",
        role: "프론트엔드 전체 담당 (100%)",
        team: "프론트엔드 1명, 백엔드 3명",
        tileMetric: "FPS 23 → 55~60",
        technologies: [
            {
                name: "Laravel (Blade)",
                description: "View 기반 서비스 플로우와 프론트·백엔드 협업 환경 구성",
            },
            {
                name: "JavaScript",
                description: "게이지 진행·요청 시점 분리·당첨 연출을 제어하는 인터랙션 로직 구현",
            },
            {
                name: "SCSS",
                description: "등급별 연출과 레이아웃을 위한 스타일 체계 구성",
            },
            {
                name: "Bootstrap",
                description: "서비스 화면 레이아웃과 반응형 기반 UI 구성",
            },
        ],
        sections: [
            {
                title: "문제와 요구사항",
                items: [
                    "항목마다 당첨 API를 호출하는 3×3 구조는 확장성과 서버 부하 측면에서 한계가 큼",
                    "연속 터치·등급별 애니메이션에서 저사양 기기 렌더링 부하가 발생",
                    "서버 검증과 인터랙션 연속성을 동시에 만족하는 요청 시점 설계가 필요",
                ],
            },
            {
                title: "담당 구현",
                items: [
                    "연속 터치와 게이지 기반 인터랙션으로 전환을 제안하고 단계별 애니메이션 게임 경험 설계",
                    "게이지 진행 구간별로 API 요청 시점을 분리하고 완료 연출 전에 서버 응답을 반영",
                    "스프라이트 전환·WebP 이미지 최적화·GPU 가속 애니메이션으로 렌더링 부하 완화",
                ],
            },
            {
                title: "구현 결과",
                items: [
                    "iPhone 6 기준 FPS를 23에서 55~60으로 개선",
                    "서버 요청을 줄이면서도 당첨 결과의 서버 검증과 인터랙션 연속성을 함께 확보",
                    "확장 가능한 게이미피케이션 플로우로 서비스 경험 전환",
                ],
            },
        ],
    },
];
