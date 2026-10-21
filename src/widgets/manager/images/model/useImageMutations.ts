"use client";

import { useDeleteUnusedPostImagesOnManagerQuery } from "@/entities/post-image/api/postImage.query";
import type { DeleteUnusedPostImagesResponse } from "@/entities/post-image/model/postImage.type";
import { useMutationToastHandlers } from "@/shared/hooks/useMutationToastHandlers";
import { formatBytes } from "@/entities/post-image/lib/postImageInventory";

export const useDeleteUnusedPostImagesWithToast = () => {
    const toastHandlers = useMutationToastHandlers<DeleteUnusedPostImagesResponse, void>((data) => {
        const result = data.result;
        if (!result) return "미사용 이미지를 정리했어요.";

        if (result.deletedCount === 0) {
            return "삭제할 미사용 이미지가 없습니다.";
        }

        return `미사용 이미지 ${result.deletedCount}개를 삭제했어요. (${formatBytes(result.freedBytes)} 확보)`;
    });

    const mutation = useDeleteUnusedPostImagesOnManagerQuery();

    const mutate = () => {
        mutation.mutate(undefined, toastHandlers);
    };

    const mutateAsync = () => mutation.mutateAsync(undefined, { onSuccess: toastHandlers.onSuccess });
    return { ...mutation, mutate, mutateAsync };
};
