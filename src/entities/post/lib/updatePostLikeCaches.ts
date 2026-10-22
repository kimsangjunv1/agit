import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { AgitRoutes } from "@/shared/constants/entityKeys";
import type { GetPostDetailResponse } from "@/entities/post/model/post.type";

type CountedPost = { idx: number; likes: number };
type CountedList = { result: CountedPost[] };

/** Confirmed server totals only; pending clicks stay in the shared Cheer Up queue. */
export function updatePostLikeCaches(client: QueryClient, postId: number, userId: string | null, likes: number) {
    const updateItem = <T extends CountedPost>(post: T): T => post.idx === postId && post.likes < likes ? { ...post, likes } : post;
    const updateList = <T extends CountedList>(response: T): T => ({ ...response, result: response.result.map(updateItem) });

    client.setQueryData<GetPostDetailResponse>([AgitRoutes.KEY_POST, "detail", postId, userId], (old) => old?.result ? { ...old, result: updateItem(old.result) } : old);
    client.setQueriesData<CountedList>({
        predicate: ({ queryKey }) => queryKey[0] === AgitRoutes.KEY_POST && (queryKey[1] === "list" || queryKey[1] === "latest") && queryKey.at(-1) === userId,
    }, (old) => old?.result ? updateList(old) : old);
    client.setQueriesData<InfiniteData<CountedList>>({
        predicate: ({ queryKey }) => queryKey[0] === AgitRoutes.KEY_POST && queryKey[1] === "infinite" && queryKey.at(-1) === userId,
    }, (old) => old ? { ...old, pages: old.pages.map(updateList) } : old);
}
