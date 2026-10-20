import { requireAdmin } from "@/shared/lib/auth/requireSession";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, buildPaginationFromQuery, getPageParams } from "@/shared/lib/apiResponse";
import { postVisibilityFilter } from "@/entities/post/model/postSettings";
import { privatePostResponse } from "@/entities/post/api/postAccess.server";

const TABLE_NAME = "comments";
const DEFAULT_PAGE_SIZE = 20;

export async function GET(req: Request) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    try {
        const supabase = supabaseAdmin();
        const { searchParams } = new URL(req.url);

        let query = supabase.from(TABLE_NAME).select("idx, post_id, author, msg, is_admin, created_at, posts!inner(title)", { count: "estimated" })
            .or(postVisibilityFilter(auth.session.user.id), { referencedTable: "posts" })
            .order("created_at", { ascending: false });

        const { page, pageSize } = getPageParams(searchParams, DEFAULT_PAGE_SIZE);

        if (pageSize > 0) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        return privatePostResponse(apiSuccess(data, {
            resultMessage: "조회성공",
            pagination: buildPaginationFromQuery(searchParams, count ?? 0, DEFAULT_PAGE_SIZE),
        }));
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
