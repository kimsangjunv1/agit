"use client";

import { useDeletePostTypeQuery, useGetPostTypesQuery, useSavePostTypeQuery } from "@/entities/postType/api/postType.query";
import type { PostTypePayload } from "@/entities/postType/model/postType.type";
import { confirmAction } from "@/shared/lib/confirmAction";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import useManagerSelection from "@/widgets/manager/shared/model/useManagerSelection";

export const NEW_POST_TYPE_ITEM = "__new__";

const usePostTypeManager = () => {
    const { data, isLoading, isError, error, refetch } = useGetPostTypesQuery();
    const saveMutation = useSavePostTypeQuery();
    const deleteMutation = useDeletePostTypeQuery();
    const { selectedItem, setSelectedItem } = useManagerSelection();
    const setToast = useToastStore((state) => state.setToast);
    const setModal = useModalStore((state) => state.setModal);
    const list = data?.result ?? [];
    const selected = list.find((item) => item.code === selectedItem);
    const isNew = selectedItem === NEW_POST_TYPE_ITEM;
    const pending = saveMutation.isPending || deleteMutation.isPending;

    const startCreate = () => setSelectedItem(NEW_POST_TYPE_ITEM);

    const save = async (payload: PostTypePayload) => {
        void confirmAction({
            title: isNew ? "글 종류를 추가할까요?" : "글 종류를 수정할까요?",
            description: `${payload.title} (${payload.code})\n표시 순서: ${payload.sort_no}`,
            confirmText: isNew ? "추가하기" : "수정하기",
            onConfirm: async () => {
                await saveMutation.mutateAsync({ payload, isNew });
                setSelectedItem(payload.code);
                setToast({ msg: isNew ? "글 종류를 추가했어요" : "글 종류를 수정했어요", type: "success" });
            },
        });
    };

    const remove = () => {
        if (!selected) return;
        setModal({
            type: "CHECK",
            title: "글 종류를 삭제할까요?",
            content: <p>삭제 대상: {selected.title}</p>,
            cancel: { text: "취소" },
            confirm: {
                text: "삭제",
                onClick: async () => {
                    try {
                        await deleteMutation.mutateAsync(selected.code);
                        setSelectedItem(null);
                        setToast({ msg: "글 종류를 삭제했어요", type: "success" });
                    } catch (cause) {
                        setToast({ msg: cause instanceof Error ? cause.message : "삭제하지 못했어요", type: "fail" });
                        return false;
                    }
                },
            },
            isOpen: true,
        });
    };

    return {
        isLoading,
        isError,
        error,
        refetch,
        list,
        selected,
        selectedItem,
        setSelectedItem,
        isNew,
        pending,
        startCreate,
        save,
        remove,
    };
};

export default usePostTypeManager;
