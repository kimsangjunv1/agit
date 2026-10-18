import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, singleItemPagination } from "@/shared/lib/apiResponse";

const TABLE_NAME = "category";

export async function PATCH(req: Request) {
    const payload = await req.json();

    try {
        const supabase = supabaseAdmin();

        const { data, error } = await supabase.from(TABLE_NAME).update(payload).eq("idx", payload.idx).select();

        if (error) throw error;

        return apiSuccess(data, {
            resultMessage: "수정성공",
            pagination: singleItemPagination(),
        });
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
