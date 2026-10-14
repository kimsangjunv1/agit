import { requireSession } from "@/shared/lib/auth/requireSession";
import { apiError, apiSuccess, resolveRouteError } from "@/shared/lib/apiResponse";
import { sanitizePostContents } from "@/shared/lib/sanitizeHtml";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

const TABLE_NAME = "post_drafts";

export async function GET() {
    const auth = await requireSession();
    if (!auth.authorized) return auth.response;

    try {
        const { data, error } = await supabaseAdmin()
            .from(TABLE_NAME)
            .select("id, title, updated_at")
            .eq("user_id", auth.session.user.id)
            .order("updated_at", { ascending: false });

        if (error) throw error;
        return apiSuccess(data ?? []);
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
        const { id, title, summary, thumbnail, category_idx, contents } = body;

        if (
            (id !== undefined && (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id))) ||
            typeof title !== "string" ||
            typeof summary !== "string" ||
            typeof thumbnail !== "string" ||
            !Number.isInteger(category_idx) ||
            !Array.isArray(contents) ||
            !contents.every((row: unknown) => Array.isArray(row) && row.every((block) => block && typeof block === "object"))
        ) {
            return apiError("임시저장 데이터가 올바르지 않습니다.", { status: 400 });
        }

        const payload = {
            title,
            summary,
            thumbnail,
            category_idx,
            contents: sanitizePostContents(contents),
        };
        const supabase = supabaseAdmin();
        const query = id
            ? supabase.from(TABLE_NAME)
                .update({ title, payload, updated_at: new Date().toISOString() })
                .eq("id", id)
                .eq("user_id", auth.session.user.id)
                .select("id")
                .maybeSingle()
            : supabase.from(TABLE_NAME)
                .insert({ user_id: auth.session.user.id, title, payload })
                .select("id")
                .single();
        const { data, error } = await query;

        if (error) throw error;
        if (!data) return apiError("임시저장 글을 찾을 수 없습니다.", { status: 404 });
        return apiSuccess(data);
    } catch (error) {
        const { message, status } = resolveRouteError(error);
        return apiError(message, { status });
    }
}
