import type { FivepixelsScope } from "@/entities/fivepixels/model/fivepixels.type";

export const FIVEPIXELS_PROJECT = {
    id: process.env.NEXT_PUBLIC_FIVEPIXELS_PROJECT_ID ?? "agit",
    env: process.env.NEXT_PUBLIC_FIVEPIXELS_ENV ?? "stage",
    version: process.env.NEXT_PUBLIC_FIVEPIXELS_VERSION ?? "1.0.0",
};

export const FIVEPIXELS_SCOPE: FivepixelsScope = {
    projectId: FIVEPIXELS_PROJECT.id,
    environment: FIVEPIXELS_PROJECT.env,
};

/** 패널 기본 작성자 표시용. requireReviewerKey 시 실제 신원은 개인키·reviewers 명단이 우선한다. */
export const FIVEPIXELS_USER = {
    id: process.env.NEXT_PUBLIC_FIVEPIXELS_USER_ID ?? "local-dev",
    name: process.env.NEXT_PUBLIC_FIVEPIXELS_USER_NAME ?? "Dev",
};

/** 기본은 개발 환경 전용. 배포된 스테이징에서 쓰려면 env를 "false"로 둔다. */
export const FIVEPIXELS_DEV_ONLY = process.env.NEXT_PUBLIC_FIVEPIXELS_DEV_ONLY !== "false";
