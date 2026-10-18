import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { AgitRoutes } from "@/shared/constants/entityKeys";
import { POST_DETAIL_STALE_TIME_MS } from "@/shared/constants/postDetail";
import {
    deletePostManagerFetch,
    getPostDetailFetch,
    getPostLatestListFetch,
    getPostListFetch,
    getPostManagerListFetch,
    patchPostFetch,
    setPostFetch,
    setPostLikeIncrementFetch,
    setPostViewIncrementFetch,
} from "@/entities/post/api/post.api";
import { DeletePostManagerPayload, GetPostDetailResponse, GetPostLatestListResponse, GetPostListResponse, GetPostManagerListResponse } from "@/entities/post/model/post.type";

const removePostFromListCaches = (queryClient: QueryClient, deletedIdx: number) => {
    queryClient.setQueryData<GetPostListResponse>([AgitRoutes.KEY_POST, "list"], (old) => {
        if (!old?.result) return old;

        return {
            ...old,
            result: old.result.filter((item) => item.idx !== deletedIdx),
        };
    });

    queryClient.setQueryData<GetPostLatestListResponse>([AgitRoutes.KEY_POST, "latest"], (old) => {
        if (!old?.result) return old;

        return {
            ...old,
            result: old.result.filter((item) => item.idx !== deletedIdx),
        };
    });

    queryClient.setQueryData<GetPostManagerListResponse>([AgitRoutes.KEY_POST, "manager", "list"], (old) => {
        if (!old?.result) return old;

        return {
            ...old,
            result: old.result.filter((item) => item.idx !== deletedIdx),
        };
    });

    queryClient.removeQueries({
        queryKey: [AgitRoutes.KEY_POST, "detail", deletedIdx],
    });
};

export const useGetPostListQuery = () => {
    const { data, isLoading, isError, error, isFetching, refetch } = useQuery<GetPostListResponse>({
        queryKey: [AgitRoutes.KEY_POST, "list"],
        queryFn: () => getPostListFetch(),
        staleTime: POST_DETAIL_STALE_TIME_MS,
        throwOnError: false,
    });

    return { data, isLoading, isError, error, isFetching, refetch };
};

export const useGetPostLatestListQuery = (initialData?: GetPostLatestListResponse) => {
    const hasValidInitialData = initialData?.resultCode === "SUCCESS";

    const { data, isLoading, isError, error, isFetching, refetch } = useQuery<GetPostLatestListResponse>({
        queryKey: [AgitRoutes.KEY_POST, "latest"],
        queryFn: () => getPostLatestListFetch(),
        staleTime: hasValidInitialData ? POST_DETAIL_STALE_TIME_MS : 0,
        refetchOnMount: hasValidInitialData ? false : true,
        initialData: hasValidInitialData ? initialData : undefined,
        throwOnError: false,
    });

    return { data, isLoading, isError, error, isFetching, refetch };
};

type UseGetPostDetailQueryOptions = {
    enabled?: boolean;
};

export const useGetPostDetailQuery = (postIdx?: number, initialData?: GetPostDetailResponse, options?: UseGetPostDetailQueryOptions) => {
    const hasValidInitialData = initialData?.resultCode === "SUCCESS";

    const { data, isLoading, isError, error, isFetching, refetch } = useQuery<GetPostDetailResponse>({
        queryKey: [AgitRoutes.KEY_POST, "detail", postIdx],
        queryFn: () => getPostDetailFetch(postIdx!),
        staleTime: hasValidInitialData ? POST_DETAIL_STALE_TIME_MS : 0,
        refetchOnMount: hasValidInitialData ? false : true,
        enabled: options?.enabled ?? !!postIdx,
        initialData: hasValidInitialData ? initialData : undefined,
    });

    return { data, isLoading, isError, error, isFetching, refetch };
};

export const useIncrementPostViewOnVisit = (postIdx?: number) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!postIdx) return;

        let cancelled = false;

        setPostViewIncrementFetch({ postId: postIdx })
            .then((response) => {
                if (cancelled || !response?.result?.viewsIncremented) return;

                queryClient.setQueryData<GetPostDetailResponse>([AgitRoutes.KEY_POST, "detail", postIdx], (old) => {
                    if (!old?.result) return old;

                    return {
                        ...old,
                        result: {
                            ...old.result,
                            views: (old.result.views ?? 0) + 1,
                        },
                    };
                });
            })
            .catch(() => {
                // 조회수 집계 실패는 화면 표시에 영향을 주지 않음
            });

        return () => {
            cancelled = true;
        };
    }, [postIdx, queryClient]);
};

export const useSetPostQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_POST, "set"],
        mutationFn: (payload: unknown) => setPostFetch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_POST] });
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

export const usePatchPostQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_POST, "patch"],
        mutationFn: (payload: { data: unknown; idx: number }) => patchPostFetch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_POST] });
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

export const useSetLikeIncrementQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_POST, "increment-like"],
        mutationFn: (payload: { postId: number; userId?: string }) => setPostLikeIncrementFetch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_POST] });
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

export const useGetPostManagerListQuery = () => {
    const { data, isLoading, isError, error, isFetching, refetch } = useQuery<GetPostManagerListResponse>({
        queryKey: [AgitRoutes.KEY_POST, "manager", "list"],
        queryFn: () => getPostManagerListFetch(),
        staleTime: 0,
    });

    return { data, isLoading, isError, error, isFetching, refetch };
};

export const useDeletePostManagerQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_POST, "manager", "delete"],
        mutationFn: (payload: DeletePostManagerPayload) => deletePostManagerFetch(payload),
        onSuccess: async (_, variables) => {
            removePostFromListCaches(queryClient, variables.idx);
            await queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_POST] });
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
