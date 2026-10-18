import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteUnusedPostImagesOnManagerFetch, getPostImageInventoryOnManagerFetch } from "@/entities/post-image/api/postImage.api";
import type { DeleteUnusedPostImagesResponse, GetPostImageInventoryResponse } from "@/entities/post-image/model/postImage.type";
import { AgitRoutes } from "@/shared/constants/entityKeys";

export const useGetPostImageInventoryOnManagerQuery = () => {
    const { data, isLoading, isError, error, isFetching, refetch } = useQuery<GetPostImageInventoryResponse>({
        queryKey: [AgitRoutes.KEY_POST_IMAGE, "manager", "inventory"],
        queryFn: () => getPostImageInventoryOnManagerFetch(),
        staleTime: 0,
    });

    return { data, isLoading, isError, error, isFetching, refetch };
};

export const useDeleteUnusedPostImagesOnManagerQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_POST_IMAGE, "manager", "delete-unused"],
        mutationFn: () => deleteUnusedPostImagesOnManagerFetch(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_POST_IMAGE] });
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
