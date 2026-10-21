import { getPostReader, privatePostResponse } from "@/entities/post/api/postAccess.server";
import { resolvePostImages } from "@/entities/post/lib/collectPostImageUrls";
import { isPostType } from "@/entities/post/model/postSettings";
import { apiError, apiSuccess, resolveRouteError, buildPaginationFromQuery, getPageParams } from "@/shared/lib/apiResponse";

const TABLE_NAME_POST = "posts";
const DEFAULT_PAGE_SIZE = 10;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { supabase, visibilityFilter } = await getPostReader();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        if (type && !isPostType(type)) return apiError("글 종류를 확인해주세요.", { status: 400 });

        const idx = searchParams.get("idx");
        const { page, pageSize } = getPageParams(searchParams, DEFAULT_PAGE_SIZE);

        if (!idx && (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 0 || !Number.isSafeInteger(page * pageSize))) {
            return apiError("페이지 정보를 확인해주세요.", { status: 400 });
        }

        let query;

        if (idx) {
            query = supabase.from(TABLE_NAME_POST).select("*", { count: "estimated" });
            query = query.eq("idx", idx);
        } else {
            query = supabase
                .from(TABLE_NAME_POST)
                .select("idx, title, thumbnail, summary, created_at, category_idx, post_type, visibility, views, likes, category!left(title)", { count: pageSize > 0 ? "exact" : "estimated" })
                .order("idx", { ascending: true });

            if (pageSize > 0) {
                const from = (page - 1) * pageSize;
                const to = from + pageSize - 1;
                query = query.range(from, to);
            }
        }

        query = query.or(visibilityFilter);
        if (type) query = query.eq("post_type", type);
        const { data, count, error } = await query;

        if (error) throw error;

        return privatePostResponse(apiSuccess(resolvePostImages(data), {
            resultMessage: "조회성공",
            pagination: idx ? null : buildPaginationFromQuery(searchParams, count ?? 0, DEFAULT_PAGE_SIZE),
        }));
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
