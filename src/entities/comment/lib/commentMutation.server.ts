import "server-only";

import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, singleItemPagination } from "@/shared/lib/apiResponse";
import { findReadablePost, postNotFound } from "@/entities/post/api/postAccess.server";
import { COMMENT_MESSAGE_MAX_LENGTH } from "@/entities/comment/model/comment.constants";
import { validateCommentContent } from "./validateCommentContent";
import { authorizeComment, badCommentRequest, COMMENT_RATE, commentRateAllowed, commentRateKey, commentRateResponse, commentSession, positiveId } from "./commentAccess.server";

export async function mutateComment(req: Request, operation: "update" | "delete", managerOnly = false) {
    try {
        const payload = await req.json().catch(() => null);
        if (!payload || typeof payload !== "object" || Array.isArray(payload) || !positiveId(payload.idx)) return badCommentRequest();
        if (operation === "update" && (typeof payload.msg !== "string" || !payload.msg.trim() || payload.msg.length > COMMENT_MESSAGE_MAX_LENGTH)) return badCommentRequest(`댓글은 1~${COMMENT_MESSAGE_MAX_LENGTH}자로 입력해주세요.`);
        const session = await commentSession();
        if (managerOnly && session?.user?.role !== "admin") return apiError("관리자 권한이 필요해요.", { status: 403 });
        const supabase = supabaseAdmin();
        let query = supabase.from("comments").select("idx, post_id, author, msg, is_admin, user_id, password_hash, deleted_at").eq("idx", payload.idx);
        if (!managerOnly) query = query.or("is_secret.is.null,is_secret.eq.false");
        const { data: comment, error } = await query.maybeSingle();
        if (error) throw error;
        if (!comment || comment.deleted_at) return postNotFound();
        const post = await findReadablePost(comment.post_id, session?.user?.id ?? null);
        if (!post) return postNotFound();
        if (operation === "update" && ["til", "diary"].includes(post.post_type)) return apiError("이 게시물에서는 댓글을 수정할 수 없어요.", { status: 403 });
        const denied = await authorizeComment(req, comment, payload.password, session);
        if (denied) return denied;
        if (operation === "update") {
            // 기존 작성자 닉네임은 변경하지 않고 새 본문에 동일한 필터를 적용합니다.
            const contentError = validateCommentContent({ author: comment.author, msg: payload.msg, isAdmin: comment.is_admin });
            if (contentError) return badCommentRequest(contentError);
            if (comment.msg === payload.msg.trim()) return apiSuccess(null, { resultMessage: "변경된 내용이 없어요.", pagination: singleItemPagination() });
            if (!(await commentRateAllowed("consume_comment_rate", commentRateKey(req), COMMENT_RATE.writeWindow, COMMENT_RATE.writes))) return commentRateResponse();
        }
        const { error: mutationError } = await supabase.from("comments").update(operation === "delete"
            ? { deleted_at: new Date().toISOString(), author: "", msg: "", profile: 0, emoji_id: null, password_hash: null, user_id: null, is_admin: false, reply_to_author: null }
            : { msg: payload.msg.trim(), is_modified: true, updated_at: new Date().toISOString() }).eq("idx", comment.idx).is("deleted_at", null);
        if (mutationError) throw mutationError;
        return apiSuccess(null, { resultMessage: operation === "delete" ? "댓글을 삭제했어요." : "댓글을 수정했어요.", pagination: singleItemPagination() });
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
