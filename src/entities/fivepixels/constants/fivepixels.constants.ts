export const FIVEPIXELS_TABLE_NAME = "fivepixels_feedbacks";
export const FIVEPIXELS_REVIEWERS_TABLE_NAME = "fivepixels_reviewers";
export const FIVEPIXELS_REVIEWER_REQUESTS_TABLE_NAME = "fivepixels_reviewer_requests";

/** 팀 권한 등급 rank. 값이 클수록 상위. 호출자 rank > 대상/부여 role rank 일 때만 쓰기 허용. */
export const FIVEPIXELS_ROLE_RANK = {
    member: 1,
    sub_admin: 2,
    admin: 3,
} as const;

/** 팀 관리 API 서명에 재사용하는 액션. 라이브러리 ReportAuthAction 에 팀 전용 값이 없어 update 를 재사용한다. */
export const FIVEPIXELS_TEAM_AUTH_ACTION = "feedback:update" as const;

/** 개인키 localStorage 키 prefix (라이브러리 storageKeys 와 동일 규칙). */
export const FIVEPIXELS_PERSONAL_KEY_STORAGE_PREFIX = "fivepixels:personal-key:v1";

export const FIVEPIXELS_LIST_ALL_DEFAULT_LIMIT = 100;
export const FIVEPIXELS_LIST_ALL_MAX_LIMIT = 200;

/** fc_number 유니크 충돌(동시 생성) 재시도 횟수 */
export const FIVEPIXELS_FC_NUMBER_RETRY_COUNT = 5;

/** Postgres unique_violation */
export const POSTGRES_UNIQUE_VIOLATION_CODE = "23505";

/** 팀 서명 요청 헤더. 브라우저에서 서버 검증 모듈을 참조하지 않도록 분리한다. */
export const FIVEPIXELS_TEAM_AUTH_HEADER = "x-fivepixels-auth";
