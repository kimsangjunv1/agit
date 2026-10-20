import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError } from "@/shared/lib/apiResponse";
import { findReadablePost, getPostReader, postNotFound } from "@/entities/post/api/postAccess.server";

export async function POST(req: Request) {
    try {
        const { postId } = await req.json();
        if (!Number.isSafeInteger(postId) || postId <= 0) return apiError("게시물 번호를 확인해주세요.", { status: 400 });
        const { userId, supabase } = await getPostReader();
        if (!postId) {
            return apiError("postId가 필요합니다.", {
                resultCode: "BAD_REQUEST",
                status: 400,
                result: null,
            });
        }
        if (!(await findReadablePost(postId, userId))) return postNotFound();

        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

        const filters: string[] = [];
        if (userId) filters.push(`user_id.eq.${userId}`);
        if (ip) filters.push(`ip.eq.${ip}`);

        let existing: { id: number } | null = null;
        if (filters.length > 0) {
            const { data, error } = await supabase.from("views").select("id").eq("post_id", postId).or(filters.join(",")).limit(1).single();

            if (error && error.code !== "PGRST116") throw error;
            existing = data;
        }

        if (!existing) {
            const admin = supabaseAdmin();

            const { error: insertError } = await admin.from("views").insert({ post_id: postId, user_id: userId ?? null, ip });
            if (insertError) throw insertError;

            const { data: postData, error: selectError } = await admin.from("posts").select("views").eq("idx", postId).single();
            if (selectError) throw selectError;

            const newViews = (postData?.views || 0) + 1;
            const { error: updateError } = await admin.from("posts").update({ views: newViews }).eq("idx", postId);
            if (updateError) throw updateError;
        }

        return apiSuccess(
            {
                success: true,
                viewsIncremented: !existing,
                alreadyViewed: !!existing,
            },
            { resultMessage: "조회수 처리 완료", pagination: null },
        );
    } catch (err: unknown) {
        const { message, status } = resolveRouteError(err, "조회수 처리 중 문제가 발생했습니다.");
        return apiError(message, {
            status,
            result: { success: false },
        });
    }
}
