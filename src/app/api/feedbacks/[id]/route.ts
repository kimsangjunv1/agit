import { NextResponse } from "next/server";

import { FIVEPIXELS_TABLE_NAME } from "@/entities/fivepixels/constants/fivepixels.constants";
import { FEEDBACK_NOT_FOUND_MESSAGE, FEEDBACK_SCOPE_REQUIRED_MESSAGE, feedbackError, feedbackErrorFrom } from "@/entities/fivepixels/lib/feedbackResponse";
import { mapPayloadToUpdate, mapRowToFeedback } from "@/entities/fivepixels/lib/mapFeedback";
import { parseFivepixelsScope } from "@/entities/fivepixels/lib/scope";
import { verifyFeedbackAuth } from "@/entities/fivepixels/lib/verifyFeedbackAuth";
import { readTeamAuthHeader, verifyTeamActor } from "@/entities/fivepixels/lib/verifyTeamActor";
import type { FivepixelsFeedbackRow, UpdateReportFeedbackPayload } from "@/entities/fivepixels/model/fivepixels.type";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

type FeedbackRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: FeedbackRouteContext) {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const scope = parseFivepixelsScope(searchParams);

    if (!scope) return feedbackError(FEEDBACK_SCOPE_REQUIRED_MESSAGE, 400);

    const payload = (await req.json().catch(() => null)) as UpdateReportFeedbackPayload | null;

    if (!payload) return feedbackError("수정할 내용이 없습니다.", 400);

    try {
        const verified = await verifyFeedbackAuth({
            scope,
            action: "feedback:update",
            payload,
        });

        if (!verified.ok) return verified.response;

        const supabase = supabaseAdmin();
        // 전달된 키만 shallow merge, 배열·객체 필드는 통째 교체된다.
        // auth 는 이번 요청 행위자 서명이며, author_* 는 create(POST) 시점 값을 유지한다.
        const update = mapPayloadToUpdate({ ...payload, auth: verified.author.auth }, new Date().toISOString());

        const { data, error } = await supabase.from(FIVEPIXELS_TABLE_NAME).update(update).eq("id", id).eq("project_id", scope.projectId).eq("environment", scope.environment).select("*").maybeSingle();

        if (error) throw error;
        if (!data) return feedbackError(FEEDBACK_NOT_FOUND_MESSAGE, 404);

        return NextResponse.json(mapRowToFeedback(data as FivepixelsFeedbackRow));
    } catch (error: unknown) {
        return feedbackErrorFrom(error, "피드백 수정에 실패했습니다.");
    }
}

/** DELETE 는 body 가 없으므로 서명을 x-fivepixels-auth 헤더로 받는다. 서명 대상 canonical payload. */
function deleteAuthPayload(id: string) {
    return { resource: "feedback:delete", id } as const;
}

export async function DELETE(req: Request, { params }: FeedbackRouteContext) {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const scope = parseFivepixelsScope(searchParams);

    if (!scope) return feedbackError(FEEDBACK_SCOPE_REQUIRED_MESSAGE, 400);

    try {
        // 등록된 활성 리뷰어의 서명만 삭제 허용 (requireReviewerKey UI 만으로는 curl 우회 가능).
        const verified = await verifyTeamActor({
            scope,
            proof: readTeamAuthHeader(req),
            payload: deleteAuthPayload(id),
        });

        if (!verified.ok) return verified.response;

        const supabase = supabaseAdmin();
        const { data, error } = await supabase.from(FIVEPIXELS_TABLE_NAME).delete().eq("id", id).eq("project_id", scope.projectId).eq("environment", scope.environment).select("id").maybeSingle();

        if (error) throw error;
        if (!data) return feedbackError(FEEDBACK_NOT_FOUND_MESSAGE, 404);

        return new NextResponse(null, { status: 204 });
    } catch (error: unknown) {
        return feedbackErrorFrom(error, "피드백 삭제에 실패했습니다.");
    }
}
