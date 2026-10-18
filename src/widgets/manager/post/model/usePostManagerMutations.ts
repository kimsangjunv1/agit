"use client";

import { useDeletePostManagerQuery } from "@/entities/post/api/post.query";
import type { DeletePostManagerPayload } from "@/entities/post/model/post.type";
import { useMutationToastHandlers } from "@/shared/hooks/useMutationToastHandlers";

export const useDeletePostManagerWithToast = () => {
    const toastHandlers = useMutationToastHandlers("게시물을 삭제했어요");
    const mutation = useDeletePostManagerQuery();

    const mutate = (payload: DeletePostManagerPayload) => {
        mutation.mutate(payload, toastHandlers);
    };

    return { ...mutation, mutate };
};
