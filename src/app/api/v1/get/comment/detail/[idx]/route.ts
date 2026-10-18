import { supabaseServer } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, buildPagination } from "@/shared/lib/apiResponse";

const TABLE_NAME_POST = "comments";

export async function GET(req: Request) {
    try {
        const supabase = await supabaseServer();
        const url = new URL(req.url);
        const segments = url.pathname.split("/");
        const idx = segments[segments.length - 1];
        const post_id = parseInt(idx, 10);

        const { data: currentData, error: currentError } = await supabase.from(TABLE_NAME_POST).select("*").eq("post_id", post_id).order("idx", { ascending: true });

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
