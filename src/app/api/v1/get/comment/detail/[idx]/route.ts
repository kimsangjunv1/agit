import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, buildPagination } from "@/shared/lib/apiResponse";
import { findReadablePost, postNotFound, privatePostResponse } from "@/entities/post/api/postAccess.server";
import { commentSession, positiveId } from "@/entities/comment/lib/commentAccess.server";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 10;

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const post_id = Number(url.pathname.split("/").at(-1));
        if (!positiveId(post_id)) return apiError("게시물 번호를 확인해주세요.", { status: 400, resultCode: "BAD_REQUEST" });
        const page = Number(url.searchParams.get("page") ?? "1");
        const parentId = url.searchParams.has("parentId") ? Number(url.searchParams.get("parentId")) : null;
        if (!positiveId(page) || !Number.isSafeInteger(page * PAGE_SIZE) || (parentId !== null && !positiveId(parentId))) return apiError("페이지 정보를 확인해주세요.", { status: 400, resultCode: "BAD_REQUEST" });
        const session = await commentSession();
        if (!(await findReadablePost(post_id, session?.user?.id ?? null))) return postNotFound();
        const supabase = supabaseAdmin();
        const from = (page - 1) * PAGE_SIZE;
        let query = supabase.from("comment_threads")
            .select("idx, id, post_id, profile, author, msg, is_admin, is_modified, created_at, updated_at, parent_id, reply_to_id, reply_to_author, emoji_id, deleted_at, user_id, has_password, reply_count", { count: "exact" })
            .eq("post_id", post_id);
        query = parentId === null ? query.is("parent_id", null) : query.eq("parent_id", parentId).is("deleted_at", null);
        const { data, count, error } = await query.order("idx", { ascending: true }).range(from, from + PAGE_SIZE - 1);
        if (error) throw error;
        const { count: commentTotalCount, error: totalError } = await supabase.from("comments").select("idx", { count: "exact", head: true }).eq("post_id", post_id).is("deleted_at", null).or("is_secret.is.null,is_secret.eq.false");
        if (totalError) throw totalError;
        const result = (data ?? []).map((row) => {
            const deleted = Boolean(row.deleted_at);
            return {
                idx: row.idx, id: row.id, post_id: row.post_id, profile: deleted ? 0 : row.profile,
                author: deleted ? "" : row.author, msg: deleted ? "" : row.msg,
                is_admin: deleted ? false : row.is_admin, is_modified: deleted ? false : row.is_modified,
                created_at: row.created_at, updated_at: row.updated_at, parent_id: row.parent_id,
                reply_to_id: deleted ? null : row.reply_to_id, reply_to_author: deleted ? null : row.reply_to_author,
                emoji_id: deleted ? null : row.emoji_id, deleted_at: row.deleted_at, reply_count: row.reply_count ?? 0,
                is_guest: !row.user_id,
                can_manage: !deleted && Boolean(session?.user?.role === "admin" || (row.user_id && session?.user?.id === row.user_id) || (!row.user_id && row.has_password)),
            };
        });
        const pagination = { ...buildPagination({ page, pageSize: PAGE_SIZE, totalCount: count ?? 0 }), commentTotalCount: commentTotalCount ?? 0 };
        return privatePostResponse(apiSuccess(result, { resultMessage: "조회성공", pagination }));
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
