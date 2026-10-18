import { clientApi } from "@/shared/lib/api/client";
import type { GetSearchResponse } from "@/entities/search/model/search.type";
export const getIntegratedSearchFetch = (keyword: string, signal?: AbortSignal) => {
    const params = new URLSearchParams({
        keyword: keyword.trim().replace(/\s+/g, " "),
    });
    return clientApi.get<GetSearchResponse>(`/api/v1/get/search?${params}`, {
        signal,
        skipAuthRedirect: true,
    });
};
