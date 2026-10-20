import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, buildPagination } from "@/shared/lib/apiResponse";

const TABLE_NAME_POST = "comments";

export async function GET() {
    try {
        const supabase = supabaseAdmin();

        const { data: currentData, error: currentError } = await supabase
            .from(TABLE_NAME_POST)
            .select("msg, author, created_at, idx, posts!inner(idx)")
            .eq("posts.visibility", "public")
            .or("is_secret.is.null,is_secret.eq.false")
            .order("created_at", { ascending: false })
            .limit(10);

        if (currentError) throw currentError;

        const totalCount = currentData?.length ?? 0;

        return apiSuccess(currentData?.map(({ posts: _posts, ...comment }) => comment) ?? [], {
            resultMessage: "조회성공",
            pagination: buildPagination({
                page: 1,
                pageSize: 10,
                totalCount,
            }),
        });
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
