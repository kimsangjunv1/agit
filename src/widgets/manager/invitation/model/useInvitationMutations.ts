"use client";

import { useDeleteInvitationCodeQuery, usePatchInvitationCodeQuery, useSetInvitationCodeQuery } from "@/entities/invitation/api/invitation.query";
import type { DeleteInvitationCodePayload, PatchInvitationCodePayload, SetInvitationCodePayload } from "@/entities/invitation/model/invitation.type";
import { useMutationToastHandlers } from "@/shared/hooks/useMutationToastHandlers";

export const useSetInvitationCodeWithToast = () => {
    const toastHandlers = useMutationToastHandlers("초대코드를 생성했어요");
    const mutation = useSetInvitationCodeQuery();

    const mutate = (payload: SetInvitationCodePayload) => {
        mutation.mutate(payload, toastHandlers);
    };

    const mutateAsync = (payload: SetInvitationCodePayload) => mutation.mutateAsync(payload, { onSuccess: toastHandlers.onSuccess });
    return { ...mutation, mutate, mutateAsync };
};

export const usePatchInvitationCodeWithToast = () => {
    const toastHandlers = useMutationToastHandlers("초대코드를 수정했어요");
    const mutation = usePatchInvitationCodeQuery();

    const mutate = (payload: PatchInvitationCodePayload) => {
        mutation.mutate(payload, toastHandlers);
    };

    const mutateAsync = (payload: PatchInvitationCodePayload) => mutation.mutateAsync(payload, { onSuccess: toastHandlers.onSuccess });
    return { ...mutation, mutate, mutateAsync };
};

export const useDeleteInvitationCodeWithToast = () => {
    const toastHandlers = useMutationToastHandlers("초대코드를 삭제했어요");
    const mutation = useDeleteInvitationCodeQuery();

    const mutate = (payload: DeleteInvitationCodePayload) => {
        mutation.mutate(payload, toastHandlers);
    };

    const mutateAsync = (payload: DeleteInvitationCodePayload) => mutation.mutateAsync(payload, { onSuccess: toastHandlers.onSuccess });
    return { ...mutation, mutate, mutateAsync };
};
