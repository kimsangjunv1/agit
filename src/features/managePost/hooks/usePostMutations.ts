"use client";

import { useDeletePostManagerQuery, usePatchPostQuery, useSetPostQuery } from "@/entities/post/api/post.query";
import type { DeletePostManagerPayload } from "@/entities/post/model/post.type";
import useNavigate from "@/shared/hooks/useNavigate";
import { useMutationToastHandlers } from "@/shared/hooks/useMutationToastHandlers";
import { useToastStore } from "@/shared/stores/useToastStore";

export const useSetPostWithFeedback = () => {
    const { replaceToUrl } = useNavigate();
    const { setToast } = useToastStore();
    const mutation = useSetPostQuery();

    const mutateAsync = async (payload: unknown) => {
        const data = await mutation.mutateAsync(payload);

        if (data?.result?.statusCode) {
            setToast({ msg: "게시물을 생성했어요", time: 2 });
            replaceToUrl(`/post/${data.result.postIdx}`);
        } else {
            setToast({ msg: "글 등록에 문제가 발생했습니다.", time: 2 });
        }

        return data;
    };

    const mutate = (payload: unknown) => {
        mutateAsync(payload).catch(() => undefined);
    };

    return { ...mutation, mutate, mutateAsync };
};

export const usePatchPostWithFeedback = () => {
    const { replaceToUrl } = useNavigate();
    const { setToast } = useToastStore();
    const mutation = usePatchPostQuery();

    const mutateAsync = async (payload: { data: unknown; idx: number }) => {
        const data = await mutation.mutateAsync(payload);

        if (data?.result?.statusCode) {
            setToast({ msg: "게시물을 수정했어요.", time: 2 });
            replaceToUrl(`/post/${data.result.postIdx}`);
        } else {
            setToast({ msg: "글 등록에 문제가 발생했습니다.", time: 2 });
        }

        return data;
    };

    const mutate = (payload: { data: unknown; idx: number }) => {
        mutateAsync(payload).catch(() => undefined);
    };

    return { ...mutation, mutate, mutateAsync };
};

export const useDeletePostWithFeedback = () => {
    const toastHandlers = useMutationToastHandlers("게시물을 삭제했어요");
    const mutation = useDeletePostManagerQuery();

    const mutate = (payload: DeletePostManagerPayload) => {
        mutation.mutate(payload, toastHandlers);
    };

    const mutateAsync = (payload: DeletePostManagerPayload) => mutation.mutateAsync(payload, { onSuccess: toastHandlers.onSuccess });

    return { ...mutation, mutate, mutateAsync };
};
