import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { AgitRoutes } from "@/shared/constants/entityKeys";
import { deleteCategoryFetch, getCategoryListFetch, getCategoryListOnManagerFetch, patchCategoryFetch, setCategoryFetch } from "@/entities/category/api/category.api";
import { DeleteCategoryPayload, GetCategoryListOnManagerResponse, GetCategoryListResponse, PatchCategoryPayload, SetCategoryPayload } from "@/entities/category/model/category.type";

export const useGetCategoryListQuery = () => {
    const { data, isLoading, isError, isFetching, refetch } = useQuery<GetCategoryListResponse>({
        queryKey: [AgitRoutes.KEY_CATEGORY, "list"],
        queryFn: () => getCategoryListFetch(),
        staleTime: 0,
    });

    return { data, isLoading, isError, isFetching, refetch };
};

export const useGetCategoryListOnManagerQuery = () => {
    const { data, isLoading, isError, error, isFetching, refetch } = useQuery<GetCategoryListOnManagerResponse>({
        queryKey: [AgitRoutes.KEY_CATEGORY, "manager", "list"],
        queryFn: () => getCategoryListOnManagerFetch(),
        staleTime: 0,
    });

    return { data, isLoading, isError, error, isFetching, refetch };
};

export const useSetCategoryQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_CATEGORY, "set"],
        mutationFn: (payload: SetCategoryPayload) => setCategoryFetch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_CATEGORY] });
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

export const usePatchCategoryQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_CATEGORY, "patch"],
        mutationFn: (payload: PatchCategoryPayload) => patchCategoryFetch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_CATEGORY] });
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

export const useDeleteCategoryQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_CATEGORY, "delete"],
        mutationFn: (payload: DeleteCategoryPayload) => deleteCategoryFetch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_CATEGORY] });
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
