import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { AgitRoutes } from "@/shared/constants/entityKeys";
import { deleteCommentManagerFetch, getCommentLatestListFetch, getCommentListFetch, getCommentManagerListFetch, setCommentFetch } from "@/entities/comment/api/comment.api";
import type { DeleteCommentManagerPayload, GetCommentDetailResponse, GetCommentLatestListResponse, GetCommentManagerListResponse, SetCommentPayload } from "@/entities/comment/model/comment.type";

export const useGetCommentDetailQuery = (postIdx?: number) => {
    const { data: session, status } = useSession();
    const { data, isLoading, isError, error, isFetching, refetch } = useQuery<GetCommentDetailResponse>({
        queryKey: [AgitRoutes.KEY_COMMENT, "detail", postIdx, session?.user?.id ?? null],
        queryFn: () => getCommentListFetch(postIdx!),
        staleTime: 0,
        refetchOnMount: true,
        enabled: status !== "loading" && !!postIdx,
        throwOnError: false,
    });

    return { data, isLoading, isError, error, isFetching, refetch };
};

export const useGetCommentLatestListQuery = () => {
    const { data, isLoading, isError, isFetching, refetch } = useQuery<GetCommentLatestListResponse>({
        queryKey: [AgitRoutes.KEY_COMMENT, "latest"],
        queryFn: () => getCommentLatestListFetch(),
        staleTime: 0,
    });

    return { data, isLoading, isError, isFetching, refetch };
};

export const useSetCommentQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_COMMENT, "set"],
        mutationFn: (payload: SetCommentPayload) => setCommentFetch(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_COMMENT] });
        },
    });

    return {
        mutate,
        mutateAsync,
        isError,
        isIdle,
        isSuccess,
        isPending,
        isPaused,
        data,
        error,
        reset,
    };
};

export const useGetCommentManagerListQuery = () => {
    const { data: session, status } = useSession();
    const { data, isLoading, isError, error, isFetching, refetch } = useQuery<GetCommentManagerListResponse>({
        queryKey: [AgitRoutes.KEY_COMMENT, "manager", "list", session?.user?.id ?? null],
        enabled: status !== "loading",
        queryFn: () => getCommentManagerListFetch(),
        staleTime: 0,
    });

    return { data, isLoading, isError, error, isFetching, refetch };
};

export const useDeleteCommentManagerQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_COMMENT, "manager", "delete"],
        mutationFn: (payload: DeleteCommentManagerPayload) => deleteCommentManagerFetch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_COMMENT] });
        },
    });

    return {
        mutate,
        mutateAsync,
        isError,
        isIdle,
        isSuccess,
        isPending,
        isPaused,
        data,
        error,
        reset,
    };
};
