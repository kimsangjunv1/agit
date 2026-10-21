"use client";

import { useSetUserQuery } from "@/entities/user/api/user.query";
import type { SetUserPayload } from "@/entities/user/model/user.type";
import { useMutationToastHandlers } from "@/shared/hooks/useMutationToastHandlers";

export const useSetUserWithToast = () => {
    const toastHandlers = useMutationToastHandlers("계정을 생성했어요");
    const mutation = useSetUserQuery();

    const mutate = (payload: SetUserPayload) => {
        mutation.mutate(payload, toastHandlers);
    };

    const mutateAsync = (payload: SetUserPayload) => mutation.mutateAsync(payload, { onSuccess: toastHandlers.onSuccess });

    return { ...mutation, mutate, mutateAsync };
};
