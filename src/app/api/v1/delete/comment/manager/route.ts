import { requireAdmin } from "@/shared/lib/auth/requireSession";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, singleItemPagination } from "@/shared/lib/apiResponse";
import { findReadablePost, postNotFound } from "@/entities/post/api/postAccess.server";

const TABLE_NAME = "comments";

export async function DELETE(req: Request) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const payload = await req.json();

    try {
        const supabase = supabaseAdmin();
        const { data: comment, error: commentError } = await supabase.from(TABLE_NAME).select("post_id").eq("idx", payload.idx).maybeSingle();
        if (commentError) throw commentError;
        if (!comment || !(await findReadablePost(comment.post_id, auth.session.user.id))) return postNotFound();

        const { data, error } = await supabase.from(TABLE_NAME).delete().eq("idx", payload.idx).select();

        if (error) throw error;

        return apiSuccess(data, {
            resultMessage: "댓글을 삭제했어요.",
            pagination: singleItemPagination(),
        });
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
