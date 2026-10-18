import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError } from "@/shared/lib/apiResponse";
import { getInviteCodeStatus } from "@/shared/lib/invitation/validateInviteCode";

const TABLE_NAME = "invite_codes";

export async function GET(req: Request) {
    try {
        const supabase = supabaseAdmin();
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json({
                pagination: null,
                result: null,
                statusCode: 0,
                resultCode: "ERROR",
                resultMessage: "code 값이 필요합니다",
            });
        }

        const { data, error } = await supabase.from(TABLE_NAME).select("id, is_active, is_used, expire_at").eq("code", code).maybeSingle();

        if (error) throw error;

        const inviteStatus = getInviteCodeStatus(data);

        return NextResponse.json({
            pagination: null,
            result: inviteStatus.isValid ? data : null,
            statusCode: inviteStatus.statusCode,
            resultCode: inviteStatus.isValid ? "SUCCESS" : "ERROR",
            resultMessage: inviteStatus.resultMessage,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "문제가 생겼습니다";
        const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 500;

        return apiError(message, { status, result: null });
    }
}
