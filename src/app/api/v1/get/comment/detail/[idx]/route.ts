import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, resolveRouteError, buildPagination } from "@/shared/lib/apiResponse";
import { findReadablePost, postNotFound, privatePostResponse } from "@/entities/post/api/postAccess.server";

export const dynamic = "force-dynamic";

const TABLE_NAME_POST = "comments";
const PAGE_SIZE = 10;

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const segments = url.pathname.split("/");
        const idx = segments[segments.length - 1];
        const post_id = Number(idx);

        if (!Number.isSafeInteger(post_id) || post_id <= 0) {
            return apiError("게시물 번호를 확인해주세요.", { status: 400, resultCode: "BAD_REQUEST" });
        }
        const page = Number(url.searchParams.get("page") ?? "1");
        if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(page * PAGE_SIZE)) {
            return apiError("페이지 정보를 확인해주세요.", { status: 400, resultCode: "BAD_REQUEST" });
        }
        if (!(await findReadablePost(post_id))) return postNotFound();

        const supabase = supabaseAdmin();
        const from = (page - 1) * PAGE_SIZE;
        const { data: currentData, count, error: currentError } = await supabase
            .from(TABLE_NAME_POST)
            .select("idx, id, post_id, profile, author, msg, is_admin, is_modified, created_at, updated_at", { count: "exact" })
            .eq("post_id", post_id)
            .or("is_secret.is.null,is_secret.eq.false")
            .order("idx", { ascending: true })
            .range(from, from + PAGE_SIZE - 1);

        if (currentError) throw currentError;

        return privatePostResponse(apiSuccess(currentData ?? [], {
            resultMessage: "조회성공",
            pagination: buildPagination({
                page,
                pageSize: PAGE_SIZE,
                totalCount: count ?? 0,
            }),
        }));
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
