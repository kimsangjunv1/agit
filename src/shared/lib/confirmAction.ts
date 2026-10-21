import type { ReactNode } from "react";

import { useModalStore } from "@/shared/stores/useModalStore";

type ConfirmActionOptions<T> = {
    title: string;
    description?: string;
    content?: ReactNode;
    confirmText?: string;
    onConfirm: () => T | Promise<T>;
};

type ConfirmationResult<T> = { accepted: true; value: T } | { accepted: false };

export const confirmAction = <T>({ title, description, content, confirmText = "확인", onConfirm }: ConfirmActionOptions<T>): Promise<ConfirmationResult<T>> => {
    const { modal, setModal } = useModalStore.getState();
    if (modal.isOpen) return Promise.resolve({ accepted: false });

    return new Promise((resolve) => {
        setModal({
            type: "CHECK",
            title,
            description,
            content,
            cancel: { text: "취소", onClick: () => resolve({ accepted: false }) },
            confirm: {
                text: confirmText,
                onClick: async () => {
                    const value = await onConfirm();
                    if (value === false) return false;
                    resolve({ accepted: true, value });
                    return true;
                },
            },
            isOpen: true,
        });
    });
};
