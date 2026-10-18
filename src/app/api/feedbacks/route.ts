import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { FIVEPIXELS_FC_NUMBER_RETRY_COUNT, FIVEPIXELS_TABLE_NAME, POSTGRES_UNIQUE_VIOLATION_CODE } from "@/entities/fivepixels/constants/fivepixels.constants";
import { FEEDBACK_SCOPE_REQUIRED_MESSAGE, feedbackError, feedbackErrorFrom } from "@/entities/fivepixels/lib/feedbackResponse";
import { mapPayloadToInsert, mapRowToFeedback } from "@/entities/fivepixels/lib/mapFeedback";
import { parseFivepixelsScope } from "@/entities/fivepixels/lib/scope";
import { verifyFeedbackAuth } from "@/entities/fivepixels/lib/verifyFeedbackAuth";
import type { CreateReportFeedbackPayload, FivepixelsFeedbackRow, FivepixelsScope } from "@/entities/fivepixels/model/fivepixels.type";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

/** 스코프 내 최대 fc_number + 1. 유니크 충돌 시 호출부에서 재시도한다. */
async function resolveNextFcNumber(supabase: SupabaseClient, scope: FivepixelsScope) {
    const { data, error } = await supabase
        .from(FIVEPIXELS_TABLE_NAME)
        .select("fc_number")
        .eq("project_id", scope.projectId)
        .eq("environment", scope.environment)
        .order("fc_number", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;

    return (data?.fc_number ?? 0) + 1;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const scope = parseFivepixelsScope(searchParams);

    if (!scope) return feedbackError(FEEDBACK_SCOPE_REQUIRED_MESSAGE, 400);

    // 프론트가 보낸 문자열 그대로 exact match (슬래시 정규화 금지)
    const pathname = searchParams.get("pathname");

    if (!pathname) return feedbackError("pathname 쿼리가 필요합니다.", 400);

    try {
        const supabase = supabaseAdmin();
        const { data, error } = await supabase
            .from(FIVEPIXELS_TABLE_NAME)
            .select("*")
            .eq("project_id", scope.projectId)
            .eq("environment", scope.environment)
            .eq("pathname", pathname)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json((data as FivepixelsFeedbackRow[]).map(mapRowToFeedback));
    } catch (error: unknown) {
        return feedbackErrorFrom(error, "피드백 목록 조회에 실패했습니다.");
    }
}

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const scope = parseFivepixelsScope(searchParams);

    if (!scope) return feedbackError(FEEDBACK_SCOPE_REQUIRED_MESSAGE, 400);

    const payload = (await req.json().catch(() => null)) as CreateReportFeedbackPayload | null;

    if (!payload?.pathname || !payload.report_id || !payload.position) {
        return feedbackError("pathname, report_id, position 은 필수입니다.", 400);
    }

    try {
        const verified = await verifyFeedbackAuth({
            scope,
            action: "feedback:create",
            payload,
        });

        if (!verified.ok) return verified.response;

        // 위조 방지: author 는 서명된 리뷰어 명단 값으로 고정
        const trustedPayload: CreateReportFeedbackPayload = {
            ...payload,
            author_id: verified.author.authorId,
            author_name: verified.author.authorName,
            auth: verified.author.auth,
        };

        const supabase = supabaseAdmin();
        const now = new Date().toISOString();

        for (let attempt = 0; attempt < FIVEPIXELS_FC_NUMBER_RETRY_COUNT; attempt += 1) {
            const fcNumber = trustedPayload.fc_number ?? (await resolveNextFcNumber(supabase, scope));
            const insert = mapPayloadToInsert({
                id: `fdbk_${randomUUID()}`,
                fcNumber,
                scope,
                payload: trustedPayload,
                now,
            });

            const { data, error } = await supabase.from(FIVEPIXELS_TABLE_NAME).insert(insert).select("*").single();

            if (!error) {
                return NextResponse.json(mapRowToFeedback(data as FivepixelsFeedbackRow), { status: 201 });
            }

            // 동시 생성으로 fc_number가 겹친 경우에만 재발급 후 재시도
            if (error.code !== POSTGRES_UNIQUE_VIOLATION_CODE || trustedPayload.fc_number !== undefined) throw error;
        }

        return feedbackError("fc_number 발급이 계속 충돌했습니다. 다시 시도해 주세요.", 409);
    } catch (error: unknown) {
        return feedbackErrorFrom(error, "피드백 생성에 실패했습니다.");
    }
}
