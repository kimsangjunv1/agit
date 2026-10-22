import { requireSession } from "@/shared/lib/auth/requireSession";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess } from "@/shared/lib/apiResponse";
import { findReadablePost, postNotFound, privatePostResponse } from "@/entities/post/api/postAccess.server";
import type { CheerUpPayload, CheerUpResult } from "@/entities/post/model/cheerUp.type";

const MAX_INTEGER = 2147483647;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isPositiveInteger = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= MAX_INTEGER;

function isPayload(value: unknown): value is CheerUpPayload {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const payload = value as Record<string, unknown>;
    return isPositiveInteger(payload.postId)
        && isPositiveInteger(payload.count)
        && typeof payload.batchId === "string" && UUID.test(payload.batchId)
        && typeof payload.userId === "string" && !!payload.userId
        && (payload.knownBatchIds === undefined || (Array.isArray(payload.knownBatchIds)
            && payload.knownBatchIds.length <= 256
            && payload.knownBatchIds.every((id) => typeof id === "string" && UUID.test(id))));
}

export async function POST(req: Request) {
    const auth = await requireSession();
    if (!auth.authorized) return privatePostResponse(auth.response);

    try {
        let payload: unknown;
        try {
            payload = await req.json();
        } catch {
            return apiError("요청 내용을 확인해주세요.", { status: 400, resultCode: "BAD_REQUEST" });
        }
        if (!isPayload(payload)) return apiError("Cheer Up 횟수와 식별자를 확인해주세요.", { status: 400, resultCode: "BAD_REQUEST" });

        const { postId, batchId, count, knownBatchIds = [] } = payload;
        const userId = auth.session.user.id;
        if (payload.userId !== userId) return apiError("현재 로그인 정보를 확인해주세요.", { status: 403, resultCode: "FORBIDDEN" });
        if (!(await findReadablePost(postId, userId))) return postNotFound();

        const { data, error } = await supabaseAdmin().rpc("increment_cheer_up_batch", {
            p_post_id: postId,
            p_batch_id: batchId.toLowerCase(),
            p_count: count,
            p_user_id: userId,
            p_ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
            p_known_batch_ids: knownBatchIds.map((id) => id.toLowerCase()),
        });

        if (error?.code === "PT409") return apiError("같은 Cheer Up 식별자에 다른 내용이 전달됐어요.", { status: 409, resultCode: "CONFLICT" });
        if (error?.code === "22003") return apiError("Cheer Up 누적 횟수의 범위를 초과했어요.", { status: 409, resultCode: "CONFLICT" });
        if (error?.code === "PT404" || error?.code === "23503") return postNotFound();
        if (error || !data) throw error ?? new Error("Cheer Up 결과를 확인하지 못했어요.");

        return privatePostResponse(apiSuccess<CheerUpResult>(data, { resultMessage: "Cheer Up 처리 완료" }));
    } catch {
        return privatePostResponse(apiError("Cheer Up 처리 중 문제가 발생했습니다.", { status: 500 }));
    }
}
