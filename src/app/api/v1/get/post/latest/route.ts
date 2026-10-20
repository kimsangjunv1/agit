import { getPostReader, privatePostResponse } from "@/entities/post/api/postAccess.server";
import { resolvePostImages } from "@/entities/post/lib/collectPostImageUrls";
import { isPostType } from "@/entities/post/model/postSettings";
import { apiError, apiSuccess, resolveRouteError, singleItemPagination } from "@/shared/lib/apiResponse";

const TABLE_NAME_POST = "posts";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { supabase, visibilityFilter } = await getPostReader();
        const type = new URL(req.url).searchParams.get("type");
        if (type && !isPostType(type)) return apiError("글 종류를 확인해주세요.", { status: 400 });

        let query = supabase
            .from(TABLE_NAME_POST)
            .select("idx, title, thumbnail, summary, created_at, post_type, visibility, views, likes, category!left(title)")
            .or(visibilityFilter)
            .order("created_at", { ascending: false })
            .limit(10);
        if (type) query = query.eq("post_type", type);
        const { data, error } = await query;

        if (error) throw error;

        const formattedData = data?.map((item) => ({
            ...item,
            category: (Array.isArray(item.category) ? item.category[0] : item.category) ?? { title: "" },
        }));

        return privatePostResponse(apiSuccess(resolvePostImages(formattedData ?? []), {
            resultMessage: "조회성공",
            pagination: singleItemPagination(),
        }));
    } catch (error: unknown) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
