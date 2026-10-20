import { requirePostOwnerOrAdmin } from "@/shared/lib/auth/requireSession";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess } from "@/shared/lib/apiResponse";
import { revalidatePostPages } from "@/shared/lib/revalidatePost";
import { sanitizePostContents } from "@/entities/post/lib/sanitizePostContents";
import { parsePostPayload } from "@/entities/post/lib/parsePostPayload";
import { assertPostImagesReadable } from "@/entities/post/api/postAccess.server";

const TABLE_NAME = "posts";

export async function PATCH(req: Request) {
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const idx = segments[segments.length - 1];

    const auth = await requirePostOwnerOrAdmin(idx);
    if (!auth.authorized) return auth.response;

    try {
        const payload = parsePostPayload(await req.json(), false, auth.post.post_type);
        if (!payload) return apiError("게시글 정보를 확인해주세요.", { status: 400 });
        const supabase = supabaseAdmin();
        const sanitizedPayload = {
            ...payload,
            user_id: auth.post.user_id ?? auth.session.user.id,
            contents: sanitizePostContents(payload.contents),
        };
        await assertPostImagesReadable(sanitizedPayload, auth.session.user.id);

        const query = supabase.from(TABLE_NAME).update(sanitizedPayload).eq("idx", idx).select().single();

        const { data, error } = await query;

        if (error) throw error;

        revalidatePostPages(data.idx);

        return apiSuccess(
            {
                statusCode: 1,
                postIdx: data.idx,
            },
            { resultMessage: "수정성공", pagination: null },
        );
    } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === "23503") {
            return apiError("글 종류나 카테고리가 삭제되었어요. 다시 선택해주세요.", { status: 400 });
        }
        const message = error instanceof Error ? error.message : "문제가 생겼습니다";
        const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 500;

        return apiError(message, {
            status: Number.isFinite(status) ? status : 500,
            result: { statusCode: 0 },
        });
    }
}
