import { requireSession } from "@/shared/lib/auth/requireSession";
import { apiError, apiSuccess, resolveRouteError } from "@/shared/lib/apiResponse";
import { sanitizePostContents } from "@/entities/post/lib/sanitizePostContents";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { parsePostPayload } from "@/entities/post/lib/parsePostPayload";
import { assertPostImagesReadable, privatePostResponse } from "@/entities/post/api/postAccess.server";

const TABLE_NAME = "post_drafts";

export async function GET() {
    const auth = await requireSession();
    if (!auth.authorized) return auth.response;

    try {
        const { data, error } = await supabaseAdmin().from(TABLE_NAME).select("id, title, updated_at").eq("user_id", auth.session.user.id).order("updated_at", { ascending: false });

        if (error) throw error;
        return privatePostResponse(apiSuccess(data ?? []));
    } catch (error) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}

export async function POST(req: Request) {
    const auth = await requireSession();
    if (!auth.authorized) return auth.response;

    try {
        const body = await req.json();
        const { id } = body;
        const parsed = parsePostPayload(body, true);

        if ((id !== undefined && (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id))) || !parsed) {
            return apiError("임시저장 데이터가 올바르지 않습니다.", { status: 400 });
        }

        const payload = {
            ...parsed,
            post_type: parsed.post_type ?? "article",
            visibility: parsed.visibility ?? "public",
            contents: sanitizePostContents(parsed.contents),
        };
        const { title } = payload;
        await assertPostImagesReadable(payload, auth.session.user.id);
        const supabase = supabaseAdmin();
        const query = id
            ? supabase.from(TABLE_NAME).update({ title, payload, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", auth.session.user.id).select("id").maybeSingle()
            : supabase.from(TABLE_NAME).insert({ user_id: auth.session.user.id, title, payload }).select("id").single();
        const { data, error } = await query;

        if (error) throw error;
        if (!data) return apiError("임시저장 글을 찾을 수 없습니다.", { status: 404 });
        return apiSuccess(data);
    } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === "23503") {
            return apiError("글 종류가 삭제되었어요. 다시 선택해주세요.", { status: 400 });
        }
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
