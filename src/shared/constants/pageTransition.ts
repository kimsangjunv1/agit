/** Page reveal cover — 빠르게 밀어 들어오다 끝에서 살짝 감속 */
export const PAGE_REVEAL_COVER_EASE = [0.77, 0, 0.175, 1] as const;

/** Page reveal uncover — 부드럽게 감속하며 노출 */
export const PAGE_REVEAL_UNCOVER_EASE = [0.22, 1, 0.36, 1] as const;

export const PAGE_REVEAL_COVER_DURATION = 1.1;
// export const PAGE_REVEAL_COVER_DURATION = 0.52;
export const PAGE_REVEAL_UNCOVER_DURATION = 1.1;
// export const PAGE_REVEAL_UNCOVER_DURATION = 0.62;

export const PAGE_SLIDE_DURATION = 0.8;

/** 준비 신호·이동이 멈춘 경우 강제 reveal 상한 — 활성 blocker가 있으면 기다림 */
export const PAGE_REVEAL_READY_TIMEOUT = 5000;

/** waiting 직후 readiness task 등록을 잠깐 기다려요 */
export const PAGE_REVEAL_READY_SETTLE_MS = 150;

/** 초기 로딩 로고 스텝 회전 — 간격과 실제 모션 시간을 분리해요 */
export const PAGE_REVEAL_LOGO_STEP_DEG = 45;
export const PAGE_REVEAL_LOGO_STEP_INTERVAL = 1.5;
export const PAGE_REVEAL_LOGO_SPIN_DURATION = 0.4;
export const PAGE_REVEAL_LOGO_SPIN_EASE = [0.77, 0, 0.175, 1] as const;

/** 준비 완료 후 로고 색이 바뀐 뒤 uncover 전까지 유지 */
export const PAGE_REVEAL_LOGO_READY_HOLD = 1;
