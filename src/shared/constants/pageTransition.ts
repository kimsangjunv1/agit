/** Page reveal cover — 빠르게 밀어 들어오다 끝에서 살짝 감속 */
export const PAGE_REVEAL_COVER_EASE = [0.77, 0, 0.175, 1] as const;

/** Page reveal uncover — 부드럽게 감속하며 노출 */
export const PAGE_REVEAL_UNCOVER_EASE = [0.22, 1, 0.36, 1] as const;

export const PAGE_REVEAL_COVER_DURATION = 1.1;
// export const PAGE_REVEAL_COVER_DURATION = 0.52;
export const PAGE_REVEAL_UNCOVER_DURATION = 1.1;
// export const PAGE_REVEAL_UNCOVER_DURATION = 0.62;

export const PAGE_SLIDE_DURATION = 0.8;

/** API·이미지 준비 대기 최대 시간 — 초과 시 강제 reveal */
export const PAGE_REVEAL_READY_TIMEOUT = 5000;
