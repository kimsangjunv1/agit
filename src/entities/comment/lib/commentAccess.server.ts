import "server-only";

import { createHmac } from "node:crypto";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";

import { authOptions } from "@/shared/lib/authOptions";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError } from "@/shared/lib/apiResponse";

export const COMMENT_RATE = { writes: 5, writeWindow: 60, passwordFailures: 5, passwordWindow: 600 } as const;
export const positiveId = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0;
export const validCommentPassword = (value: unknown): value is string => typeof value === "string" && Array.from(value).length >= 6 && Array.from(value).length <= 24 && Buffer.byteLength(value, "utf8") <= 72;
export const badCommentRequest = (message = "댓글 정보를 확인해주세요.") => apiError(message, { status: 400, resultCode: "BAD_REQUEST" });
export const commentSession = () => getServerSession(authOptions);
export const commentDigest = (value: string) => {
    const secret = process.env.NEXTAUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret) throw new Error("댓글 보안 설정을 확인해주세요.");
    return createHmac("sha256", secret).update(value).digest("hex");
};
export const commentRateKey = (req: Request) => `comment-write:${commentDigest(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown")}`;
export const commentRateAllowed = async (name: "consume_comment_rate" | "check_comment_rate", key: string, window: number, limit: number) => {
    const { data, error } = await supabaseAdmin().rpc(name, { p_key: key, p_window_seconds: window, p_limit: limit });
    if (error) throw error;
    return data === true;
};
export const commentRateResponse = () => apiError("요청이 많아요. 잠시 후 다시 시도해주세요.", { status: 429, resultCode: "TOO_MANY_REQUESTS" });

export type ManagedComment = { idx: number; post_id: number; author: string; msg: string; is_admin: boolean; user_id: string | null; password_hash: string | null; deleted_at: string | null };
export async function authorizeComment(req: Request, comment: ManagedComment, password: unknown, session: Awaited<ReturnType<typeof commentSession>>) {
    if (session?.user?.id && session.user.role === "admin") return null;
    if (comment.user_id) return session?.user?.id === comment.user_id ? null : apiError("본인이 작성한 댓글만 변경할 수 있어요.", { status: 403 });
    if (!comment.password_hash) return apiError("이 댓글은 관리자에게 삭제를 요청해주세요.", { status: 403 });
    const key = `comment-password:${comment.idx}:${commentRateKey(req)}`;
    const database = supabaseAdmin();
    const { data: reservation, error: reserveError } = await database.rpc("reserve_comment_password", { p_key: key });
    if (reserveError) throw reserveError;
    if (!reservation) return commentRateResponse();
    if (!validCommentPassword(password) || !(await bcrypt.compare(password, comment.password_hash))) {
        return apiError("비밀번호가 일치하지 않아요.", { status: 403 });
    }
    const { error: releaseError } = await database.rpc("release_comment_password", { p_key: key, p_window_started_at: reservation });
    if (releaseError) throw releaseError;
    return null;
}
