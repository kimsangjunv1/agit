import { useQuery } from "@tanstack/react-query";
import { getIntegratedSearchFetch } from "./search.api";
import { AgitRoutes } from "@/shared/constants/entityKeys";
export const useGetIntegratedSearchQuery = (keyword: string, enabled: boolean) => {
    const normalizedKeyword = keyword.trim().replace(/\s+/g, " ");
    return useQuery({
        queryKey: [AgitRoutes.KEY_SEARCH, "list", normalizedKeyword],
        queryFn: ({ signal }) => getIntegratedSearchFetch(normalizedKeyword, signal),
        enabled: enabled && normalizedKeyword.length >= 2,
        staleTime: 1000 * 60 * 5,
        retry: false,
    });
};
