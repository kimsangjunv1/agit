import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, singleItemPagination } from "@/shared/lib/apiResponse";
import { getPostReader, postNotFound, privatePostResponse } from "@/entities/post/api/postAccess.server";
import { resolvePostImages } from "@/entities/post/lib/collectPostImageUrls";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { supabase, userId, visibilityFilter } = await getPostReader();
        const url = new URL(req.url);
        const segments = url.pathname.split("/");
        const idx = segments[segments.length - 1];
        if (!Number.isSafeInteger(Number(idx)) || Number(idx) <= 0) return postNotFound();
        const { data: currentData, error: currentError } = await supabase.from("posts").select("*").eq("idx", idx).or(visibilityFilter).maybeSingle();
        if (currentError) throw currentError;
        if (!currentData) return postNotFound();

        const skipTracking = req.headers.get("x-internal-fetch") === "isr" || req.headers.get("x-skip-tracking") === "true";
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

        let alreadyViewed = false;
        let alreadyLiked = false;

        if (!skipTracking) {
            const filters: string[] = [];
            if (userId) filters.push(`user_id.eq.${userId}`);
            if (ip) filters.push(`ip.eq.${ip}`);

            if (filters.length > 0) {
                const [viewResult, likeResult] = await Promise.all([
                    supabase.from("views").select("id").eq("post_id", idx).or(filters.join(",")).limit(1).single(),
                    supabase.from("likes").select("id").eq("post_id", idx).or(filters.join(",")).limit(1).single(),
                ]);

                if (viewResult.error && viewResult.error.code !== "PGRST116") throw viewResult.error;
                if (likeResult.error && likeResult.error.code !== "PGRST116") throw likeResult.error;

                alreadyViewed = !!viewResult.data;
                alreadyLiked = !!likeResult.data;
            }
        }

        const [prevResult, nextResult] = await Promise.all([
            supabase.from("posts").select("idx, title, summary, thumbnail").or(visibilityFilter).eq("post_type", currentData.post_type).lt("idx", idx).order("idx", { ascending: false }).limit(1).maybeSingle(),
            supabase.from("posts").select("idx, title, summary, thumbnail").or(visibilityFilter).eq("post_type", currentData.post_type).gt("idx", idx).order("idx", { ascending: true }).limit(1).maybeSingle(),
        ]);
        if (prevResult.error) throw prevResult.error;
        if (nextResult.error) throw nextResult.error;

        if (!skipTracking && !alreadyViewed && currentData) {
            const admin = supabaseAdmin();

            const { error: insertError } = await admin.from("views").insert({ post_id: idx, user_id: userId ?? null, ip });
            if (insertError) throw insertError;

            const newViews = (currentData.views || 0) + 1;
            const { error: updateError } = await admin.from("posts").update({ views: newViews }).eq("idx", idx);
            if (updateError) throw updateError;

            currentData.views = newViews;
        }

        return privatePostResponse(apiSuccess(
            resolvePostImages({
                ...currentData,
                prev: prevResult.data,
                next: nextResult.data,
                viewsIncremented: !alreadyViewed,
                alreadyViewed,
                alreadyLiked,
            }),
            {
                resultMessage: "조회수 처리 및 포스트 정보 조회 완료",
                pagination: singleItemPagination(),
            },
        ));
    } catch (err: unknown) {
        const { message, status } = resolveRouteError(err, "조회수 처리 중 문제가 발생했습니다.");
        return apiError(message, {
            status,
            result: null,
        });
    }
}
