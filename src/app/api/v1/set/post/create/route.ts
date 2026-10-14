import { requireSession } from "@/shared/lib/auth/requireSession";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess } from "@/shared/lib/apiResponse";
import { revalidatePostPages } from "@/shared/lib/revalidatePost";
import { sanitizePostContents } from "@/shared/lib/sanitizeHtml";

const TABLE_NAME = "posts";

export async function POST(req: Request) {
    const auth = await requireSession();
    if (!auth.authorized) return auth.response;

    const payload = await req.json();

    try {
        const supabase = supabaseAdmin();
        const { draftId, ...postPayload } = payload;
        const sanitizedPayload = {
            ...postPayload,
            user_id: auth.session.user.id,
            contents: sanitizePostContents(payload.contents),
        };

        const query = supabase.from(TABLE_NAME).insert(sanitizedPayload).select("idx").single();

        const { data, error } = await query;

        if (error) throw error;

        if (typeof draftId === "string") {
            await supabase.from("post_drafts")
                .delete()
                .eq("id", draftId)
                .eq("user_id", auth.session.user.id);
        }

        revalidatePostPages(data.idx);

        return apiSuccess(
            {
                statusCode: 1,
                postIdx: data.idx,
            },
            { resultMessage: "등록성공", pagination: null }
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
