import { requireSession } from "@/shared/lib/auth/requireSession";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess } from "@/shared/lib/apiResponse";
import { findReadablePost, postNotFound } from "@/entities/post/api/postAccess.server";

export async function POST(req: Request) {
    const auth = await requireSession();
    if (!auth.authorized) return auth.response;

    try {
        const { postId } = await req.json();
        const userId = auth.session.user.id;
        if (!Number.isSafeInteger(postId) || postId <= 0) return apiError("게시물 번호를 확인해주세요.", { status: 400 });

        if (!postId) {
            return apiError("postId가 필요합니다.", {
                resultCode: "BAD_REQUEST",
                status: 400,
                result: null,
            });
        }
        if (!(await findReadablePost(postId, userId))) return postNotFound();

        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

        const supabase = supabaseAdmin();

        const { data, error } = await supabase.from("likes").select("id").eq("post_id", postId).or(`user_id.eq.${userId},ip.eq.${ip}`).limit(1).single();

        if (error && error.code !== "PGRST116") throw error;

        const existing = data;

        if (!existing) {
            const admin = supabaseAdmin();

            const { error: insertError } = await admin.from("likes").insert({ post_id: postId, user_id: userId, ip });
            if (insertError) throw insertError;

            const { data: postData, error: selectError } = await admin.from("posts").select("likes").eq("idx", postId).single();
            if (selectError) throw selectError;

            const newLikes = (postData?.likes || 0) + 1;
            const { error: updateError } = await admin.from("posts").update({ likes: newLikes }).eq("idx", postId);
            if (updateError) throw updateError;
        }

        return apiSuccess(
            {
                success: true,
                likesIncremented: !existing,
                alreadyLiked: !!existing,
            },
            { resultMessage: "좋아요 처리 완료", pagination: null },
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "좋아요 처리 중 문제가 발생했습니다.";
        const status = typeof err === "object" && err !== null && "status" in err ? Number(err.status) : 500;

        return apiError(message, {
            status: Number.isFinite(status) ? status : 500,
            result: { success: false },
        });
    }
}
