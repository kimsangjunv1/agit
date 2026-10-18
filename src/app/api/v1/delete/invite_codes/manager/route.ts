import { requireAdmin } from "@/shared/lib/auth/requireSession";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, singleItemPagination } from "@/shared/lib/apiResponse";

const TABLE_NAME = "invite_codes";

export async function DELETE(req: Request) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const payload = await req.json();

    try {
        const supabase = supabaseAdmin();

        const { data, error } = await supabase.from(TABLE_NAME).delete().eq("id", payload.id).select();

        if (error) throw error;

        return apiSuccess(data, {
            resultMessage: "선택하신 초대 코드를 삭제했어요.",
            pagination: singleItemPagination(),
        });
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
