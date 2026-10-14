import { requireSession } from "@/shared/lib/auth/requireSession";
import { apiError, apiSuccess, resolveRouteError } from "@/shared/lib/apiResponse";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireSession();
    if (!auth.authorized) return auth.response;

    try {
        const { id } = await params;
        const { data, error } = await supabaseAdmin()
            .from("post_drafts")
            .select("id, title, payload, updated_at")
            .eq("id", id)
            .eq("user_id", auth.session.user.id)
            .maybeSingle();

        if (error) throw error;
        if (!data) return apiError("임시저장 글을 찾을 수 없습니다.", { status: 404 });

        return apiSuccess(data);
    } catch (error) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
