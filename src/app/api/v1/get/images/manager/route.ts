import { requireAdmin } from "@/shared/lib/auth/requireSession";
import { buildPostImageInventory } from "@/entities/post-image/lib/postImageInventory";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, singleItemPagination } from "@/shared/lib/apiResponse";

export async function GET() {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    try {
        const supabase = supabaseAdmin();
        const inventory = await buildPostImageInventory(supabase);

        return apiSuccess(inventory, {
            resultMessage: "조회성공",
            pagination: singleItemPagination(),
        });
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
