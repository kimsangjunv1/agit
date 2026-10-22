import bcrypt from "bcrypt";

import { COMMENT_AUTHOR_MAX_CODE_UNITS, COMMENT_AUTHOR_MAX_LENGTH, COMMENT_MESSAGE_MAX_LENGTH } from "@/entities/comment/model/comment.constants";
import { COMMENT_PROFILES, COMMENT_EMOJIS, DEFAULT_COMMENT_PROFILE } from "@/entities/comment/config/commentAppearance";
import { getCommentAuthorLength } from "@/entities/comment/lib/commentNickname";
import { validateCommentContent } from "@/entities/comment/lib/validateCommentContent";
import { badCommentRequest, COMMENT_RATE, commentRateAllowed, commentDigest, commentRateKey, commentRateResponse, commentSession, positiveId, validCommentPassword } from "@/entities/comment/lib/commentAccess.server";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, singleItemPagination } from "@/shared/lib/apiResponse";
import { findReadablePost, postNotFound } from "@/entities/post/api/postAccess.server";

export async function POST(req: Request) {
    try {
        const payload: unknown = await req.json().catch(() => null);
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) return badCommentRequest();
        const { post_id, msg, request_id, password, profile, emoji_id, parent_id = null, reply_to_id = null } = payload as Record<string, unknown>;
        if (!positiveId(post_id)) return badCommentRequest("게시물 번호를 확인해주세요.");
        if (typeof request_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(request_id)) return badCommentRequest("등록 요청 정보를 확인해주세요.");
        if (typeof msg !== "string" || !msg.trim() || msg.length > COMMENT_MESSAGE_MAX_LENGTH) return badCommentRequest(`댓글은 1~${COMMENT_MESSAGE_MAX_LENGTH}자로 입력해주세요.`);
        if ((parent_id !== null && !positiveId(parent_id)) || (reply_to_id !== null && (!positiveId(reply_to_id) || parent_id === null))) return badCommentRequest("답글 정보를 확인해주세요.");
        const session = await commentSession();
        const userId = session?.user?.id ?? null;
        const isAdmin = Boolean(userId && session?.user?.role === "admin");
        const author = userId ? session?.user?.name : (payload as Record<string, unknown>).author;
        if (typeof author !== "string" || !author.trim() || author.length > COMMENT_AUTHOR_MAX_CODE_UNITS || getCommentAuthorLength(author.trim()) > COMMENT_AUTHOR_MAX_LENGTH) return badCommentRequest(`닉네임은 1~${COMMENT_AUTHOR_MAX_LENGTH}자로 입력해주세요.`);
        if (!userId && !validCommentPassword(password)) return badCommentRequest("비밀번호는 6~24자, UTF-8 기준 72바이트 이내로 입력해주세요.");
        if (!userId && (!COMMENT_PROFILES.some((item) => item.id === profile) || !COMMENT_EMOJIS.some((item) => item.id === emoji_id))) return badCommentRequest("프로필과 이모지를 선택해주세요.");
        const normalizedAuthor = author.trim().normalize("NFC");
        const contentError = validateCommentContent({ author: normalizedAuthor, msg, isAdmin });
        if (contentError) return badCommentRequest(contentError);
        const post = await findReadablePost(post_id, userId);
        if (!post) return postNotFound();
        if (["til", "diary"].includes(post.post_type)) return apiError("이 게시물에는 댓글을 작성할 수 없어요.", { status: 403 });
        const canonical = { is_admin: isAdmin, post_id, author: normalizedAuthor, msg: msg.trim(), user_id: userId, profile: userId ? DEFAULT_COMMENT_PROFILE : profile, emoji_id: userId ? null : emoji_id, parent_id, reply_to_id, password: userId ? null : password };
        const fingerprint = commentDigest(JSON.stringify(canonical));
        const supabase = supabaseAdmin();
        const { data: previous, error: previousError } = await supabase.from("comments").select("request_fingerprint").eq("request_id", request_id).maybeSingle();
        if (previousError) throw previousError;
        if (previous) {
            if (previous.request_fingerprint !== fingerprint) return apiError("같은 요청에 다른 댓글 정보가 포함되어 있어요.", { status: 409 });
            return apiSuccess(null, { status: 201, resultMessage: "댓글을 남겼어요.", pagination: singleItemPagination() });
        }
        const rateKey = commentRateKey(req);
        if (!(await commentRateAllowed("check_comment_rate", rateKey, COMMENT_RATE.writeWindow, COMMENT_RATE.writes))) return commentRateResponse();
        const { error } = await supabase.rpc("create_comment", {
            p_request_id: request_id, p_post_id: post_id, p_author: normalizedAuthor, p_msg: msg.trim(),
            p_profile: canonical.profile, p_emoji_id: canonical.emoji_id, p_user_id: userId,
            p_password_hash: userId ? null : await bcrypt.hash(password as string, 12), p_is_admin: isAdmin,
            p_parent_id: parent_id, p_reply_to_id: reply_to_id, p_reply_to_author: null,
            p_rate_key: rateKey, p_request_fingerprint: fingerprint,
        });
        if (error?.code === "PT429") return commentRateResponse();
        if (error?.code === "23505") return apiError("같은 요청에 다른 댓글 정보가 포함되어 있어요.", { status: 409 });
        if (error?.code === "22023") return badCommentRequest("답글을 남길 대상을 확인해주세요.");
        if (error?.code === "23503" || error?.code === "PT404") return postNotFound();
        if (error) throw error;
        return apiSuccess(null, { status: 201, resultMessage: "댓글을 남겼어요.", pagination: singleItemPagination() });
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
