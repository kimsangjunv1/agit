import { supabaseAdmin, supabaseServer } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, singleItemPagination } from "@/shared/lib/apiResponse";

export async function GET(req: Request) {
    try {
        const supabase = await supabaseServer();
        const url = new URL(req.url);
        const segments = url.pathname.split("/");
        const idx = segments[segments.length - 1];

        const skipTracking = req.headers.get("x-internal-fetch") === "isr" || req.headers.get("x-skip-tracking") === "true";
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

        let alreadyViewed = false;
        let alreadyLiked = false;
        const userId = req.headers.get("x-user-id") || undefined;

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

        const [currentResult, postsResult] = await Promise.all([
            supabase.from("posts").select("*").eq("idx", idx).single(),
            supabase.from("posts").select("idx, title, summary, thumbnail").or(`idx.lt.${idx},idx.gt.${idx}`),
        ]);

        const currentData = currentResult.data;
        const postsData = postsResult.data;

        if (!currentData) {
            return apiError("글을 찾을 수 없습니다.", {
                resultCode: "NOT_FOUND",
                status: 404,
                result: null,
            });
        }

        const prevData = postsData?.filter((p) => p.idx < Number(idx)).sort((a, b) => b.idx - a.idx)[0] ?? null;
        const nextData = postsData?.filter((p) => p.idx > Number(idx)).sort((a, b) => a.idx - b.idx)[0] ?? null;

        if (!skipTracking && !alreadyViewed && currentData) {
            const admin = supabaseAdmin();

            const { error: insertError } = await admin.from("views").insert({ post_id: idx, user_id: userId ?? null, ip });
            if (insertError) throw insertError;

            const newViews = (currentData.views || 0) + 1;
            const { error: updateError } = await admin.from("posts").update({ views: newViews }).eq("idx", idx);
            if (updateError) throw updateError;

            currentData.views = newViews;
        }

        return apiSuccess(
            {
                ...currentData,
                prev: prevData,
                next: nextData,
                viewsIncremented: !alreadyViewed,
                alreadyViewed,
                alreadyLiked,
            },
            {
                resultMessage: "조회수 처리 및 포스트 정보 조회 완료",
                pagination: singleItemPagination(),
            },
        );
    } catch (err: unknown) {
        const { message, status } = resolveRouteError(err, "조회수 처리 중 문제가 발생했습니다.");
        return apiError(message, {
            status,
            result: null,
        });
    }
}
