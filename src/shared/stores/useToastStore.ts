import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ToastStatusType = "success" | "info" | "fail" | "warning" | "loading" | "expired";

type ActionType = {
    title?: string;
    type?: "action" | "close" | "sub" | "dropDown";
    className?: string;
    icon?: {
        type: string;
        className?: string;
    };
    onClick?: () => void;
};

interface PropsType {
    msg: string;
    time?: number;
    icon?: string;
    iconClassName?: string;
    actions?: ActionType[];
    type?: ToastStatusType;
    qa?: boolean;
}

interface DetailType {
    id: string;
    createDate: string;
    icon: string;
    iconClassName: string;
    msg: string;
    time: number;
    actions?: ActionType[];
    type?: ToastStatusType;
    qa?: boolean;
}

interface ToastStore {
    toastList: DetailType[];

    time: number;
    isRunning: boolean;
    startTime: number | null; // 시작 시점 (timestamp)
    duration: number; // 시작 시 설정한 총 시간 (초)

    recentMsgList: string[]; // 변경: 최근 보여준 메시지 리스트(최대 10개)

    setToast: (item: PropsType, callback?: () => void) => void;

    startTimer: (id: string, seconds: number, callback?: () => void) => void;
    stopTimer: () => void;
    resetTimer: () => void;
    resetToastList: () => void;
    restartTimer: (seconds: number) => void;
    setStartTime: (e: number | null) => void;
    reset: () => void; // 추가됨
    removeToastById: (id: string) => void;
}

let intervalRef: NodeJS.Timeout | null = null;

const intervalRefMap: Record<string, NodeJS.Timeout> = {};

/** `setToast`와 동일한 규칙으로 메시지 → 토스트 id (외부에서 수동 제거 시 사용) */
export const getToastIdForMessage = (msg: string): string => {
    let hash = 2166136261;

    for (let i = 0; i < msg.length; i++) {
        hash ^= msg.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }

    return "msg_" + (hash >>> 0).toString(16);
};

const clearToastTimer = (id: string) => {
    if (!intervalRefMap[id]) {
        return;
    }

    clearInterval(intervalRefMap[id]);
    delete intervalRefMap[id];
};

export const useToastStore = create<ToastStore>()(
    persist(
        (set, get) => ({
            toastList: [],

            time: 0,
            isRunning: false,
            startTime: null,
            duration: 0,
            recentMsgList: [],

            startTimer: (id, seconds, callback) => {
                if (intervalRefMap[id]) {
                    return;
                }
                set({ isRunning: true });

                const startTimestamp = Date.now();
                const savedCallback = callback || null;

                intervalRefMap[id] = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
                    const remaining = seconds - elapsed;
                    if (remaining <= 0) {
                        get().stopTimer();
                        set({ time: 0 });

                        clearToastTimer(id);

                        set((state) => {
                            const newList = state.toastList.filter((e) => e.id !== id);
                            return { toastList: newList };
                        });

                        savedCallback?.();
                    } else {
                        set({ time: remaining });
                    }
                }, 1000);
            },

            stopTimer: () => {
                if (intervalRef) {
                    clearInterval(intervalRef);
                    intervalRef = null;
                }
                set({ isRunning: false });
            },

            resetTimer: () => {
                get().stopTimer();
                set({ time: 0, startTime: null, duration: 0 });
            },

            resetToastList: () => {
                set(() => {
                    return { toastList: [] };
                });
            },

            restartTimer: (seconds) => {
                if (intervalRef) return;

                const startTimestamp = Date.now();

                set({
                    time: seconds,
                    isRunning: true,
                    duration: seconds,
                });

                intervalRef = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
                    const remaining = seconds - elapsed;

                    if (remaining <= 0) {
                        get().stopTimer();
                        set({ time: 0 });
                    } else {
                        set({ time: remaining });
                    }
                }, 1000);
            },

            // msg가 완전히 같으면 id도 동일, 한 글자라도 다르면 전혀 다른 id 생성
            setToast: ({ msg, time = 3, icon, iconClassName, actions, type, qa = false }, callback) => {
                const CURRENT_ENV_LOCAL = process.env.NEXT_PUBLIC_CURRENT_ENVIRONMENT === "LOCAL";
                const CURRENT_ENV_DEV = process.env.NEXT_PUBLIC_CURRENT_ENVIRONMENT === "DEV";

                const SET_ONLY_SEE_CORP_MEMEBRS = qa ? CURRENT_ENV_DEV || CURRENT_ENV_LOCAL : true;

                if (SET_ONLY_SEE_CORP_MEMEBRS) {
                    const ID = getToastIdForMessage(msg);
                    const newItem: DetailType = {
                        icon: icon ?? "",
                        iconClassName: iconClassName ?? "",
                        id: ID,
                        createDate: new Date().toISOString(),
                        msg,
                        time,
                        actions,
                        type,
                        qa,
                    };

                    clearToastTimer(ID);

                    set((state) => {
                        // 최근 메시지 리스트 관리 (최대 10개, 가장 오래된 것 제거)
                        let updatedRecentMsgList = [...state.recentMsgList, msg];
                        if (updatedRecentMsgList.length > 10) {
                            updatedRecentMsgList = updatedRecentMsgList.slice(updatedRecentMsgList.length - 10);
                        }
                        return {
                            toastList: [...state.toastList.filter((item) => item.id !== ID), newItem],
                            recentMsgList: updatedRecentMsgList,
                        };
                    });

                    get().startTimer(ID, time, callback);
                }
            },

            setStartTime: (args: number | null) => set(() => ({ startTime: args })),

            removeToastById: (id) => {
                clearToastTimer(id);
                set((state) => ({
                    toastList: state.toastList.filter((e) => e.id !== id),
                }));
            },

            reset: () => {
                // 전체 상태 초기화
                Object.values(intervalRefMap).forEach(clearInterval);
                for (const key in intervalRefMap) delete intervalRefMap[key];
                if (intervalRef) {
                    clearInterval(intervalRef);
                    intervalRef = null;
                }
                set({
                    toastList: [],
                    time: 0,
                    isRunning: false,
                    startTime: null,
                    duration: 0,
                    recentMsgList: [],
                });
            },
        }),
        {
            name: "kqr-toast-session",
            storage: createJSONStorage(() => sessionStorage),
            // 타이머는 메모리(setInterval)만 있어 새로고침 후 복구 불가 — toastList 등은 저장하지 않음
            partialize: (state) => ({
                recentMsgList: state.recentMsgList,
            }),
            // 예전에 toastList까지 저장된 sessionStorage 호환: 재수화 시 목록·타이머는 버림
            merge: (persistedState, currentState) => ({
                ...currentState,
                ...(persistedState as Partial<ToastStore>),
                toastList: [],
                time: 0,
                isRunning: false,
                startTime: null,
                duration: 0,
            }),
        },
    ),
);
