"use client";

import { useDeleteCommentManagerQuery } from "@/entities/comment/api/comment.query";
import type { DeleteCommentManagerPayload } from "@/entities/comment/model/comment.type";
import { useMutationToastHandlers } from "@/shared/hooks/useMutationToastHandlers";

export const useDeleteCommentWithToast = () => {
    const toastHandlers = useMutationToastHandlers("댓글을 삭제했어요");
    const mutation = useDeleteCommentManagerQuery();

    const mutate = (payload: DeleteCommentManagerPayload) => {
        mutation.mutate(payload, toastHandlers);
    };

    return { ...mutation, mutate };
};
