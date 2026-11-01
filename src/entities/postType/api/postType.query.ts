import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setPostTypeFetch, deletePostTypeFetch, getPostTypesFetch, patchPostTypeFetch } from "./postType.api";
import type { PostTypePayload } from "../model/postType.type";

const KEY = ["post-types"];

export const useGetPostTypesQuery = () => useQuery({ queryKey: KEY, queryFn: getPostTypesFetch, staleTime: 0 });

export const useSavePostTypeQuery = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ payload, isNew }: { payload: PostTypePayload; isNew: boolean }) => (isNew ? setPostTypeFetch(payload) : patchPostTypeFetch(payload)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
    });
};

export const useDeletePostTypeQuery = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePostTypeFetch,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
    });
};
