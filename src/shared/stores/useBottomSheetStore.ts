import { ReactNode } from "react";
import { create } from "zustand";

interface BottomSheetType {
    type: string | null;
    title: string;
    subTitle?: string;
    content?: ReactNode;
    description?: string;
    confirm?: {
        text?: string | null;
        onClick?: () => void;
        loading?: boolean | null;
    };
    cancel?: {
        text?: string | null;
        onClick?: (e: MouseEvent) => void;
    };
    guide?: {
        text?: string | null;
        onClick?: () => void;
    };
    refresh?: {
        text?: string | null;
        onClick?: () => void;
    };
    onExit?: () => void;
    isOpen: boolean;
    isNeedNext?: boolean;
}

interface BottomSheetStoreType {
    initBottomSheet: BottomSheetType;
    bottomSheet: BottomSheetType;

    setBottomSheet: (props: Partial<BottomSheetType>) => void;
    trackingBSConfirmLoading: (props: boolean) => void;
}

export const useBottomSheetStore = create<BottomSheetStoreType>((set, get) => ({
    initBottomSheet: {
        type: null,
        title: "",
        subTitle: "",
        content: null,
        confirm: {
            text: "",
            onClick: undefined,
            loading: null,
        },
        cancel: {
            text: "",
            onClick: undefined,
        },
        guide: {
            text: "",
            onClick: undefined,
        },
        refresh: {
            text: null,
            onClick: undefined,
        },
        onExit: undefined,
        isOpen: false,
        isNeedNext: false,
    },

    bottomSheet: {
        type: null,
        title: "",
        subTitle: "",
        content: null,
        confirm: {
            text: null,
            onClick: undefined,
            loading: null,
        },
        cancel: {
            text: null,
            onClick: undefined,
        },
        guide: {
            text: null,
            onClick: undefined,
        },
        refresh: {
            text: null,
            onClick: undefined,
        },
        onExit: undefined,
        isOpen: false,
        isNeedNext: false,
    },

    setBottomSheet: (bottomSheet) =>
        set((state) => ({
            bottomSheet: {
                ...state.bottomSheet, // 기존 modal 값들을 그대로 유지
                ...bottomSheet, // 전달된 modal 값만 덮어씀
            },
        })),

    trackingBSConfirmLoading: (isLoading) =>
        set((state) => ({
            bottomSheet: {
                ...state.bottomSheet,
                confirm: {
                    ...state.bottomSheet.confirm,
                    loading: isLoading,
                },
            },
        })),
}));
