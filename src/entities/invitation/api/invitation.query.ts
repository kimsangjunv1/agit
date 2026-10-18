import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { AgitRoutes } from "@/shared/constants/entityKeys";
import { deleteInvitationFetch, getInvitationCodeCheckFetch, getInvitationCodeListOnManagerFetch, patchInvitationFetch, setInvitationCodeFetch } from "@/entities/invitation/api/invitation.api";
import {
    DeleteInvitationCodePayload,
    GetInvitationCodeCheckResponse,
    GetInvitationCodeListOnManagerResponse,
    PatchInvitationCodePayload,
    SetInvitationCodePayload,
} from "@/entities/invitation/model/invitation.type";

export const useGetInvitationCodeCheckQuery = (code: string) => {
    const { data, isLoading, isError, isFetching, isPending, refetch } = useQuery<GetInvitationCodeCheckResponse>({
        queryKey: [AgitRoutes.KEY_INVITATION, "check", code],
        queryFn: () => getInvitationCodeCheckFetch(code),
        staleTime: 0,
        enabled: false,
    });

    return { data, isLoading, isError, isFetching, isPending, refetch };
};

export const useGetInvitationCodeListOnManagerQuery = () => {
    const { data, isLoading, isError, error, isFetching, refetch } = useQuery<GetInvitationCodeListOnManagerResponse>({
        queryKey: [AgitRoutes.KEY_INVITATION, "manager", "list"],
        queryFn: () => getInvitationCodeListOnManagerFetch(),
        staleTime: 0,
    });

    return { data, isLoading, isError, error, isFetching, refetch };
};

export const useSetInvitationCodeQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_INVITATION, "set"],
        mutationFn: (payload: SetInvitationCodePayload) => setInvitationCodeFetch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_INVITATION] });
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

export const usePatchInvitationCodeQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_INVITATION, "patch"],
        mutationFn: (payload: PatchInvitationCodePayload) => patchInvitationFetch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_INVITATION] });
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

export const useDeleteInvitationCodeQuery = () => {
    const queryClient = useQueryClient();

    const { data, mutate, mutateAsync, error, isError, isSuccess, isIdle, isPending, isPaused, reset } = useMutation({
        mutationKey: [AgitRoutes.KEY_INVITATION, "delete"],
        mutationFn: (payload: DeleteInvitationCodePayload) => deleteInvitationFetch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [AgitRoutes.KEY_INVITATION] });
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
