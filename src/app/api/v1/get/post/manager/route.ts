import { requireAdmin } from "@/shared/lib/auth/requireSession";
import { getPostReader, privatePostResponse } from "@/entities/post/api/postAccess.server";
import { resolvePostImages } from "@/entities/post/lib/collectPostImageUrls";
import { apiError, apiSuccess, resolveRouteError, buildPaginationFromQuery, getPageParams } from "@/shared/lib/apiResponse";

const TABLE_NAME = "posts";
const DEFAULT_PAGE_SIZE = 20;

export async function GET(req: Request) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    try {
        const { supabase, visibilityFilter } = await getPostReader(auth.session.user.id);
        const { searchParams } = new URL(req.url);

        let query = supabase
            .from(TABLE_NAME)
            .select("idx, title, thumbnail, summary, created_at, category_idx, post_type, visibility, views, category!left(title)", {
                count: "estimated",
            })
            .or(visibilityFilter)
            .order("idx", { ascending: false });

        const { page, pageSize } = getPageParams(searchParams, DEFAULT_PAGE_SIZE);

        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        return privatePostResponse(apiSuccess(resolvePostImages(data), {
            resultMessage: "조회성공",
            pagination: buildPaginationFromQuery(searchParams, count ?? 0, DEFAULT_PAGE_SIZE),
        }));
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
