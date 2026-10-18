import { SupabaseClient } from "@supabase/supabase-js";

import { SearchResultItem } from "@/entities/search/model/search.type";
import { apiError, apiSuccess, resolveRouteError } from "@/shared/lib/apiResponse";
import { supabaseServer } from "@/shared/lib/supabase/supabaseServer";

const DEFAULT_LIMIT = 8;
const MAX_KEYWORD_LENGTH = 50;
const SEARCH_CACHE_TTL = 1000 * 60;

type SearchSource = {
    type: SearchResultItem["type"];
    group: string;
    search: (supabase: SupabaseClient, keyword: string, limit: number) => Promise<SearchResultItem[]>;
};

const searchCache = new Map<string, { data: SearchResultItem[]; expiredAt: number }>();

const normalizeKeyword = (keyword: string) =>
    keyword
        .trim()
        .replace(/[,%(){}]/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, MAX_KEYWORD_LENGTH);

const searchSources: SearchSource[] = [
    {
        type: "post",
        group: "Posts",
        search: async (supabase, keyword, limit) => {
            const { data, error } = await supabase
                .from("posts")
                .select("idx, title, summary, created_at")
                .or(`title.ilike.%${keyword}%,summary.ilike.%${keyword}%`)
                .order("created_at", { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data ?? []).map((post) => ({
                id: `post-${post.idx}`,
                type: "post",
                group: "Posts",
                title: post.title ?? "제목 없음",
                description: post.summary ?? "",
                url: `/post/${post.idx}`,
                createdAt: post.created_at ?? undefined,
            }));
        },
    },
];

export async function GET(req: Request) {
    try {
        const supabase = await supabaseServer();
        const { searchParams } = new URL(req.url);
        const keyword = normalizeKeyword(searchParams.get("keyword") ?? "");
        const limit = Math.max(1, Math.min(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 20));

        if (keyword.length < 2) {
            return apiSuccess([], {
                resultMessage: "검색어를 2글자 이상 입력해주세요",
            });
        }

        const cacheKey = `${keyword}:${limit}`;
        const cached = searchCache.get(cacheKey);

        if (cached && cached.expiredAt > Date.now()) {
            return apiSuccess(cached.data, { resultMessage: "조회성공" });
        }

        const results = await Promise.all(searchSources.map((source) => source.search(supabase, keyword, limit)));
        const data = results.flat();

        searchCache.set(cacheKey, {
            data,
            expiredAt: Date.now() + SEARCH_CACHE_TTL,
        });

        return apiSuccess(data, { resultMessage: "조회성공" });
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
