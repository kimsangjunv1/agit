import { getServerSession } from "next-auth";

import { COMMENT_AUTHOR_MAX_CODE_UNITS, COMMENT_AUTHOR_MAX_LENGTH, COMMENT_MESSAGE_MAX_LENGTH } from "@/entities/comment/model/comment.constants";
import { getCommentAuthorLength } from "@/entities/comment/lib/commentNickname";
import { validateCommentContent } from "@/entities/comment/lib/validateCommentContent";
import { authOptions } from "@/shared/lib/authOptions";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, singleItemPagination } from "@/shared/lib/apiResponse";

const TABLE_NAME = "comments";

export async function POST(req: Request) {
    try {
        const payload: unknown = await req.json().catch(() => null);

        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            return apiError("댓글 정보를 확인해주세요.", { status: 400, resultCode: "BAD_REQUEST" });
        }

        const { post_id, author, msg } = payload as Record<string, unknown>;

        if (typeof post_id !== "number" || !Number.isSafeInteger(post_id) || post_id <= 0) {
            return apiError("게시물 번호를 확인해주세요.", { status: 400, resultCode: "BAD_REQUEST" });
        }

        if (typeof author !== "string" || !author.trim() || author.length > COMMENT_AUTHOR_MAX_CODE_UNITS || getCommentAuthorLength(author.trim()) > COMMENT_AUTHOR_MAX_LENGTH) {
            return apiError(`닉네임은 1~${COMMENT_AUTHOR_MAX_LENGTH}자로 입력해주세요.`, { status: 400, resultCode: "BAD_REQUEST" });
        }

        if (typeof msg !== "string" || !msg.trim() || msg.length > COMMENT_MESSAGE_MAX_LENGTH) {
            return apiError(`댓글은 1~${COMMENT_MESSAGE_MAX_LENGTH}자로 입력해주세요.`, { status: 400, resultCode: "BAD_REQUEST" });
        }

        const session = await getServerSession(authOptions);
        const isAdmin = Boolean(session?.user?.id && session.user.role === "admin");
        const normalizedAuthor = author.trim().normalize("NFC");
        const contentError = validateCommentContent({ author: normalizedAuthor, msg, isAdmin });

        if (contentError) {
            return apiError(contentError, { status: 400, resultCode: "BAD_REQUEST" });
        }

        const supabase = supabaseAdmin();

        const { error } = await supabase.from(TABLE_NAME).insert({
            post_id,
            author: normalizedAuthor,
            msg: msg.trim(),
            is_admin: isAdmin,
            is_secret: false,
        });

        if (error?.code === "23503") {
            return apiError("게시물을 찾을 수 없습니다.", { status: 404, resultCode: "NOT_FOUND" });
        }

        if (error) throw error;

        return apiSuccess(null, {
            status: 201,
            resultMessage: "댓글을 남겼어요.",
            pagination: singleItemPagination(),
        });
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
