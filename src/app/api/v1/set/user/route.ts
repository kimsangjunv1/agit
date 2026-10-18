import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError, apiSuccess, singleItemPagination } from "@/shared/lib/apiResponse";
import { getInviteCodeStatus } from "@/shared/lib/invitation/validateInviteCode";
import bcrypt from "bcrypt";

const USERS_TABLE = "users";
const INVITE_CODES_TABLE = "invite_codes";

export async function POST(req: Request) {
    try {
        const supabase = supabaseAdmin();
        const { name, email, password, inviteCode } = await req.json();

        const trimmedCode = typeof inviteCode === "string" ? inviteCode.trim() : "";
        if (!trimmedCode) {
            return apiError("초대코드가 필요합니다", { status: 400 });
        }

        if (!name || !email || !password) {
            return apiError("필수 정보가 누락되었습니다", { status: 400 });
        }

        const { data: inviteData, error: inviteError } = await supabase.from(INVITE_CODES_TABLE).select("id, is_active, is_used, expire_at").eq("code", trimmedCode).maybeSingle();

        if (inviteError) throw inviteError;

        const inviteStatus = getInviteCodeStatus(inviteData);
        if (!inviteStatus.isValid) {
            return apiError(inviteStatus.resultMessage, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: userData, error: userError } = await supabase
            .from(USERS_TABLE)
            .insert([{ email, name, password: hashedPassword }])
            .select("id")
            .single();

        if (userError) throw userError;

        const { data: updatedCode, error: updateError } = await supabase
            .from(INVITE_CODES_TABLE)
            .update({ is_used: true, used_by: userData.id })
            .eq("code", trimmedCode)
            .eq("is_used", false)
            .select("id")
            .maybeSingle();

        if (updateError || !updatedCode) {
            await supabase.from(USERS_TABLE).delete().eq("id", userData.id);
            return apiError("이미 사용된 코드입니다", { status: 409 });
        }

        return apiSuccess(
            { id: userData.id },
            {
                resultMessage: "등록성공",
                pagination: singleItemPagination(),
            },
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "문제가 생겼습니다";
        const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 500;

        return apiError(message, { status });
    }
}
