import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, buildPagination } from "@/shared/lib/apiResponse";

const TABLE_NAME_POST = "comments";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const segments = url.pathname.split("/");
        const idx = segments[segments.length - 1];
        const post_id = Number(idx);

        if (!Number.isSafeInteger(post_id) || post_id <= 0) {
            return apiError("게시물 번호를 확인해주세요.", { status: 400, resultCode: "BAD_REQUEST" });
        }

        const supabase = supabaseAdmin();
        const { data: currentData, error: currentError } = await supabase
            .from(TABLE_NAME_POST)
            .select("idx, id, post_id, profile, author, msg, is_admin, is_modified, created_at, updated_at")
            .eq("post_id", post_id)
            .or("is_secret.is.null,is_secret.eq.false")
            .order("idx", { ascending: true });

        if (currentError) throw currentError;

        const totalCount = currentData?.length ?? 0;

        return apiSuccess(currentData ?? [], {
            resultMessage: "조회성공",
            pagination: buildPagination({
                page: 1,
                pageSize: Math.max(totalCount, 1),
                totalCount,
            }),
        });
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
