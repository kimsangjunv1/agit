"use client";

import { useDeleteCategoryQuery, usePatchCategoryQuery, useSetCategoryQuery } from "@/entities/category/api/category.query";
import type { DeleteCategoryPayload, PatchCategoryPayload, SetCategoryPayload } from "@/entities/category/model/category.type";
import { useMutationToastHandlers } from "@/shared/hooks/useMutationToastHandlers";

export const useSetCategoryWithToast = () => {
    const toastHandlers = useMutationToastHandlers("카테고리를 생성했어요");
    const mutation = useSetCategoryQuery();

    const mutate = (payload: SetCategoryPayload) => {
        mutation.mutate(payload, toastHandlers);
    };

    const mutateAsync = (payload: SetCategoryPayload) => mutation.mutateAsync(payload, { onSuccess: toastHandlers.onSuccess });
    return { ...mutation, mutate, mutateAsync };
};

export const usePatchCategoryWithToast = () => {
    const toastHandlers = useMutationToastHandlers("카테고리를 수정했어요");
    const mutation = usePatchCategoryQuery();

    const mutate = (payload: PatchCategoryPayload) => {
        mutation.mutate(payload, toastHandlers);
    };

    const mutateAsync = (payload: PatchCategoryPayload) => mutation.mutateAsync(payload, { onSuccess: toastHandlers.onSuccess });
    return { ...mutation, mutate, mutateAsync };
};

export const useDeleteCategoryWithToast = () => {
    const toastHandlers = useMutationToastHandlers("카테고리를 삭제했어요");
    const mutation = useDeleteCategoryQuery();

    const mutate = (payload: DeleteCategoryPayload) => {
        mutation.mutate(payload, toastHandlers);
    };

    const mutateAsync = (payload: DeleteCategoryPayload) => mutation.mutateAsync(payload, { onSuccess: toastHandlers.onSuccess });
    return { ...mutation, mutate, mutateAsync };
};
