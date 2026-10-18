import { requirePostOwnerOrAdmin, requireSession } from "@/shared/lib/auth/requireSession";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess } from "@/shared/lib/apiResponse";
import { revalidatePostPages } from "@/shared/lib/revalidatePost";
import { sanitizePostContents } from "@/entities/post/lib/sanitizePostContents";

const TABLE_NAME = "posts";

export async function PATCH(req: Request) {
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const idx = segments[segments.length - 1];

    const auth = await requirePostOwnerOrAdmin(idx);
    if (!auth.authorized) return auth.response;

    const payload = await req.json();

    try {
        const supabase = supabaseAdmin();
        const { user_id: _userId, idx: _idx, ...rest } = payload;
        const sanitizedPayload = {
            ...rest,
            contents: sanitizePostContents(payload.contents),
        };

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
        const message = error instanceof Error ? error.message : "문제가 생겼습니다";
        const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 500;

        return apiError(message, {
            status: Number.isFinite(status) ? status : 500,
            result: { statusCode: 0 },
        });
    }
}
