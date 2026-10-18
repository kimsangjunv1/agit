import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AgitRoutes } from "@/shared/constants/entityKeys";
import { getUserManagerListFetch, setUserFetch } from "@/entities/user/api/user.api";
import { GetUserManagerListResponse, SetUserPayload } from "@/entities/user/model/user.type";

export const useSetUserQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_USER, "set"],
        mutationFn: (payload: SetUserPayload) => setUserFetch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_USER] });
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

export const useGetUserManagerListQuery = () => {
    const { data, isLoading, isError, error, isFetching, refetch } = useQuery<GetUserManagerListResponse>({
        queryKey: [AgitRoutes.KEY_USER, "manager", "list"],
        queryFn: () => getUserManagerListFetch(),
        staleTime: 0,
    });

    return { data, isLoading, isError, error, isFetching, refetch };
};
