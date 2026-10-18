import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, singleItemPagination } from "@/shared/lib/apiResponse";

const TABLE_NAME = "category";

export async function DELETE(req: Request) {
    const payload = await req.json();

    try {
        const supabase = supabaseAdmin();

        const { data, error } = await supabase.from(TABLE_NAME).delete().eq("idx", payload.idx).select();

        if (error) throw error;

        return apiSuccess(data, {
            resultMessage: "선택하신 카테고리를 삭제했어요.",
            pagination: singleItemPagination(),
        });
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
