"use client";
import { useRef } from "react";
import { useGetInvitationCodeListOnManagerQuery } from "@/entities/invitation/api/invitation.query";
import type { InvitationCodeListItem, PatchInvitationCodePayload, SetInvitationCodePayload } from "@/entities/invitation/model/invitation.type";
import { confirmAction } from "@/shared/lib/confirmAction";
import { useModalStore } from "@/shared/stores/useModalStore";
import ModalContent from "@/widgets/manager/shared/ui/ModalContent";
import { useDeleteInvitationCodeWithToast, usePatchInvitationCodeWithToast, useSetInvitationCodeWithToast } from "@/widgets/manager/invitation/model/useInvitationMutations";
import useManagerSelection from "@/widgets/manager/shared/model/useManagerSelection";

const useInvitationManager = () => {
    const createValueRef = useRef<SetInvitationCodePayload>({
        is_active: false,
        expire_at: "",
    });
    const { data, isLoading, isError, error, refetch } = useGetInvitationCodeListOnManagerQuery();
    const { mutateAsync: createInvitation } = useSetInvitationCodeWithToast();
    const { mutateAsync: patchInvitationFetch } = usePatchInvitationCodeWithToast();
    const { mutateAsync: deleteInvitation } = useDeleteInvitationCodeWithToast();
    const { setModal } = useModalStore();
    const { selectedItem, setSelectedItem } = useManagerSelection();
    const list = data?.result ?? [];
    const selectedInvitation = list.find((item) => String(item.id) === selectedItem);
    const patchInvitation = (payload: PatchInvitationCodePayload) => {
        void confirmAction({
            title: "초대코드 상태를 변경할까요?",
            description: `${selectedInvitation?.code ?? "초대코드"} · ${payload.is_active ? "활성화" : "비활성화"}`,
            confirmText: "변경하기",
            onConfirm: () => patchInvitationFetch(payload),
        });
    };
    const createInvitationModal = () =>
        setModal({
            type: "CHECK",
            title: "초대코드 생성",
            content: <ModalContent.Invitation.AddInvitationCode onChange={(value) => (createValueRef.current = value)} />,
            cancel: { text: "닫기" },
            confirm: {
                text: "확인",
                onClick: async () => {
                    await createInvitation(createValueRef.current);
                    createValueRef.current = { is_active: true, expire_at: "" };
                },
            },
            isOpen: true,
        });
    const deleteInvitationModal = (item: InvitationCodeListItem) =>
        setModal({
            type: "CHECK",
            title: "초대코드를 삭제할까요?",
            content: <p className="break-all text-[var(--color-gray-600)]">삭제 대상: {item.code}</p>,
            cancel: { text: "취소" },
            confirm: {
                text: "삭제하기",
                onClick: () => deleteInvitation({ id: item.id }),
            },
            isOpen: true,
        });
    return {
        createValueRef,
        data,
        isLoading,
        isError,
        error,
        refetch,
        createInvitation,
        patchInvitation,
        deleteInvitation,
        setModal,
        selectedItem,
        setSelectedItem,
        list,
        selectedInvitation,
        createInvitationModal,
        deleteInvitationModal,
    };
};
export default useInvitationManager;
