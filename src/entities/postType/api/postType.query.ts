import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPostTypeFetch, deletePostTypeFetch, getPostTypesFetch, updatePostTypeFetch } from "./postType.api";
import type { PostTypePayload } from "../model/postType.type";

const KEY = ["post-types"];

export const useGetPostTypesQuery = () => useQuery({ queryKey: KEY, queryFn: getPostTypesFetch, staleTime: 0 });

export const useSavePostTypeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ payload, isNew }: { payload: PostTypePayload; isNew: boolean }) => (isNew ? createPostTypeFetch(payload) : updatePostTypeFetch(payload)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
    });
};

export const useDeletePostTypeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePostTypeFetch,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
    });
};
