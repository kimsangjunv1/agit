import { getServerSession } from "next-auth";

import { findReadablePost, postNotFound, privatePostResponse } from "@/entities/post/api/postAccess.server";
import type { CheerUpState } from "@/entities/post/model/cheerUp.type";
import { apiError, apiSuccess } from "@/shared/lib/apiResponse";
import { authOptions } from "@/shared/lib/authOptions";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
    const userId = (await getServerSession(authOptions))?.user?.id ?? null;

    try {
        const { searchParams } = new URL(req.url);
        const rawPostId = searchParams.get("postId") ?? "";
        const postId = Number(rawPostId);
        const rawBatchIds = searchParams.get("batchIds");
        const batchIds = rawBatchIds ? rawBatchIds.split(",") : [];
        if (!/^[1-9]\d*$/.test(rawPostId) || !Number.isSafeInteger(postId) || postId > 2147483647
            || batchIds.length > 256 || batchIds.some((id) => !UUID.test(id))) {
            return privatePostResponse(apiError("게시물 번호와 Cheer Up 식별자를 확인해주세요.", { status: 400, resultCode: "BAD_REQUEST" }));
        }

        if (!(await findReadablePost(postId, userId))) return postNotFound();
        const { data, error } = await supabaseAdmin().rpc("get_cheer_up_state", {
            p_post_id: postId,
            p_user_id: userId,
            p_batch_ids: batchIds.map((id) => id.toLowerCase()),
        });
        if (error) throw error;
        if (!data) return postNotFound();

        return privatePostResponse(apiSuccess<CheerUpState>(data));
    } catch {
        return privatePostResponse(apiError("Cheer Up 횟수를 불러오지 못했어요.", { status: 500 }));
    }
}
