import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { AgitRoutes } from "@/shared/constants/entityKeys";
import { deleteCommentFetch, updateCommentFetch, deleteCommentManagerFetch, getCommentLatestListFetch, getCommentListFetch, getCommentManagerListFetch, setCommentFetch } from "@/entities/comment/api/comment.api";
import type { DeleteCommentPayload, UpdateCommentPayload, DeleteCommentManagerPayload, GetCommentLatestListResponse, GetCommentManagerListResponse, SetCommentPayload } from "@/entities/comment/model/comment.type";

export const useGetCommentDetailQuery = (postIdx: number, { enabled = true, parentId }: { enabled?: boolean; parentId?: number } = {}) => {
    const { data: session, status } = useSession();

    return useInfiniteQuery({
        queryKey: [AgitRoutes.KEY_COMMENT, "detail", postIdx, status === "loading" ? "loading" : session?.user?.id ?? null, "infinite", parentId ?? null],
        queryFn: ({ pageParam }) => getCommentListFetch(postIdx, pageParam, parentId),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined,
        staleTime: 0,
        refetchOnMount: true,
        enabled: status !== "loading" && !!postIdx && enabled,
        throwOnError: false,
    });
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

export const useUpdateCommentQuery = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateCommentPayload) => updateCommentFetch(payload),
        onSuccess: async () => { await client.invalidateQueries({ queryKey: [AgitRoutes.KEY_COMMENT] }); },
    });
};

export const useDeleteCommentQuery = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: (payload: DeleteCommentPayload) => deleteCommentFetch(payload),
        onSuccess: async () => { await client.invalidateQueries({ queryKey: [AgitRoutes.KEY_COMMENT] }); },
    });
};
