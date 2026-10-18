import { ReactNode } from "react";
import { create } from "zustand";

interface Modal {
    type: string | null;
    icon: string;
    title: string;
    content?: ReactNode;
    description?: string;
    focusDescription?: string;
    className?: {
        container?: string;
    };
    confirm?: {
        text?: string | null;
        onClick?: () => void;
        loading?: boolean | null;
        className?: string;
    };
    cancel?: {
        text?: string | null;
        onClick?: () => void;
        className?: string;
    };
    isOpen: boolean;
    isNeedNext?: boolean;
    delay?: number;
}
interface ModalStoreType {
    initModal: Modal;
    modal: Modal;

    setModal: (props: Partial<Modal>) => void;
    trackingModalConfirmLoading: (props: boolean) => void;
}

export const useModalStore = create<ModalStoreType>((set, get) => ({
    initModal: {
        type: null,
        icon: "",
        title: "",
        content: null,
        description: "",
        focusDescription: "",
        className: {
            container: "",
        },
        confirm: {
            text: "",
            onClick: undefined,
            loading: null,
            className: "",
        },
        cancel: {
            text: "",
            onClick: undefined,
            className: "",
        },
        isOpen: false,
        isNeedNext: false,
        delay: 0,
    },
    modal: {
        type: null,
        title: "",
        icon: "",
        content: null,
        description: "",
        focusDescription: "",
        className: {
            container: "",
        },
        confirm: {
            text: null,
            onClick: undefined,
            loading: null,
            className: "",
        },
        cancel: {
            text: null,
            onClick: undefined,
            className: "",
        },
        isOpen: false,
        isNeedNext: false,
        delay: 0,
    },

    setModal: (modal) =>
        set((state) => ({
            modal: {
                ...state.modal, // 기존 modal 값들을 그대로 유지
                ...modal, // 전달된 modal 값만 덮어씀
            },
        })),

    trackingModalConfirmLoading: (isLoading) =>
        set((state) => ({
            modal: {
                ...state.modal,
                confirm: {
                    ...state.modal.confirm,
                    loading: isLoading,
                },
            },
        })),
}));
