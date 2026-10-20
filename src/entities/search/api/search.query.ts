import { useQuery } from "@tanstack/react-query";
import { getIntegratedSearchFetch } from "./search.api";
import { AgitRoutes } from "@/shared/constants/entityKeys";
import { useSession } from "next-auth/react";
export const useGetIntegratedSearchQuery = (keyword: string, enabled: boolean) => {
    const { data: session, status } = useSession();
    const normalizedKeyword = keyword.trim().replace(/\s+/g, " ");
    return useQuery({
        queryKey: [AgitRoutes.KEY_SEARCH, "list", normalizedKeyword, session?.user?.id ?? null],
        queryFn: ({ signal }) => getIntegratedSearchFetch(normalizedKeyword, signal),
        enabled: status !== "loading" && enabled && normalizedKeyword.length >= 2,
        staleTime: 1000 * 60 * 5,
        retry: false,
    });
};
