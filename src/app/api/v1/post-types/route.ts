import { isPostType } from "@/entities/post/model/postSettings";
import { requireAdmin } from "@/shared/lib/auth/requireSession";
import { apiError, apiSuccess, resolveRouteError } from "@/shared/lib/apiResponse";
import { supabaseAdmin, supabaseServer } from "@/shared/lib/supabase/supabaseServer";

const TABLE = "post_types";
const COLUMNS = "code, title, sort_no, created_at";
export const dynamic = "force-dynamic";

const routeError = (error: unknown) => {
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : null;
    if (code === "23505") return apiError("이미 사용 중인 주소 이름이에요.", { status: 409 });
    if (code === "23503" || code === "23001") return apiError("게시글이나 임시저장 글에서 사용 중인 종류는 삭제할 수 없어요.", { status: 409 });
    if (error instanceof SyntaxError) return apiError("글 종류 정보를 확인해주세요.", { status: 400 });
    const { message, status } = resolveRouteError(error);
    return apiError(message, { status });
};

export async function GET() {
    try {
        const supabase = await supabaseServer();
        const { data, error } = await supabase.from(TABLE).select(COLUMNS).order("sort_no").order("created_at").order("code");
        if (error) throw error;
        const response = apiSuccess(data ?? []);
        response.headers.set("Cache-Control", "no-store");
        return response;
    } catch (error) {
        return routeError(error);
    }
}

const save = async (req: Request, isNew: boolean) => {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    try {
        const body = await req.json();
        const { code, title, sort_no } = body ?? {};
        if (!isPostType(code) || typeof title !== "string" || !title.trim() || title.trim().length > 40 || !Number.isInteger(sort_no) || sort_no < 0 || sort_no > 9999) {
            return apiError("이름, 주소 이름과 표시 순서를 확인해주세요.", { status: 400 });
        }
        const supabase = supabaseAdmin();
        const values = { title: title.trim(), sort_no };
        const query = isNew ? supabase.from(TABLE).insert({ code, ...values }) : supabase.from(TABLE).update(values).eq("code", code);
        const { data, error } = await query.select(COLUMNS).maybeSingle();
        if (error) throw error;
        if (!data) return apiError("글 종류를 찾을 수 없어요.", { status: 404 });
        return apiSuccess(data, { resultMessage: isNew ? "글 종류를 추가했어요." : "글 종류를 수정했어요." });
    } catch (error) {
        return routeError(error);
    }
};

export const POST = (req: Request) => save(req, true);
export const PATCH = (req: Request) => save(req, false);

export async function DELETE(req: Request) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    try {
        const { code } = (await req.json()) ?? {};
        if (!isPostType(code)) return apiError("글 종류를 확인해주세요.", { status: 400 });
        if (code === "article") return apiError("일반 글은 기본 종류라 삭제할 수 없어요.", { status: 409 });
        const { data, error } = await supabaseAdmin().from(TABLE).delete().eq("code", code).select("code").maybeSingle();
        if (error) throw error;
        if (!data) return apiError("글 종류를 찾을 수 없어요.", { status: 404 });
        return apiSuccess(data, { resultMessage: "글 종류를 삭제했어요." });
    } catch (error) {
        return routeError(error);
    }
}
