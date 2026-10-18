import { requireAdmin } from "@/shared/lib/auth/requireSession";
import { deleteUnusedPostImages } from "@/entities/post-image/lib/postImageInventory";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, singleItemPagination } from "@/shared/lib/apiResponse";

export async function DELETE() {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    try {
        const supabase = supabaseAdmin();
        const result = await deleteUnusedPostImages(supabase);

        return apiSuccess(result, {
            resultMessage: "최적화 완료",
            pagination: singleItemPagination(),
        });
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
