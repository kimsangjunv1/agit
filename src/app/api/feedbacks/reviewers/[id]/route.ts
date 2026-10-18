import { NextResponse } from "next/server";

import { FIVEPIXELS_REVIEWERS_TABLE_NAME } from "@/entities/fivepixels/constants/fivepixels.constants";
import { FEEDBACK_NOT_FOUND_MESSAGE, FEEDBACK_SCOPE_REQUIRED_MESSAGE, feedbackError, feedbackErrorFrom } from "@/entities/fivepixels/lib/feedbackResponse";
import { mapReviewerRowToItem } from "@/entities/fivepixels/lib/mapReviewer";
import { parseFivepixelsScope } from "@/entities/fivepixels/lib/scope";
import { canManageTeam, outranks } from "@/entities/fivepixels/lib/teamRank";
import { stripAuthFromPayload } from "@/entities/fivepixels/lib/verifyFeedbackAuth";
import { verifyTeamActor } from "@/entities/fivepixels/lib/verifyTeamActor";
import type { FivepixelsReviewerRow, ReportAuthProof, UpdateReviewerPayload } from "@/entities/fivepixels/model/fivepixels.type";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

type ReviewerRouteContext = { params: Promise<{ id: string }> };

/** id 는 서명 재사용(다른 대상으로 replay)을 막기 위해 서명 payload 에도 포함된다. */
type UpdateReviewerBody = UpdateReviewerPayload & {
    id?: string;
    auth?: ReportAuthProof;
};

/**
 * 리뷰어 수정 (onUpdateReviewer). URL :id 는 라이브러리가 넘기는 author_id.
 * 호출자 rank > 대상 rank 이고, role 변경 시 부여 role rank 도 낮아야 한다.
 */
export async function PATCH(req: Request, { params }: ReviewerRouteContext) {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const scope = parseFivepixelsScope(searchParams);

    if (!scope) return feedbackError(FEEDBACK_SCOPE_REQUIRED_MESSAGE, 400);

    const body = (await req.json().catch(() => null)) as UpdateReviewerBody | null;

    if (!body) return feedbackError("수정할 내용이 없습니다.", 400);

    // 서명은 { id, ...fields } 를 대상으로 하므로 URL id 와 반드시 일치해야 한다.
    if (body.id !== id) {
        return feedbackError("요청 대상이 서명과 일치하지 않습니다.", 400);
    }

    const nextPublicKey = body.public_key?.trim();

    if (nextPublicKey !== undefined && nextPublicKey !== "" && !nextPublicKey.startsWith("stpub1.")) {
        return feedbackError("public_key 형식이 올바르지 않습니다. (stpub1.…)", 400);
    }

    try {
        const verified = await verifyTeamActor({
            scope,
            proof: body.auth,
            payload: stripAuthFromPayload(body),
        });

        if (!verified.ok) return verified.response;

        const actorRole = verified.actor.reviewer.role;

        if (!canManageTeam(actorRole)) {
            return feedbackError("팀 관리 권한이 없습니다.", 403);
        }

        const supabase = supabaseAdmin();

        const { data: targetData, error: targetError } = await supabase
            .from(FIVEPIXELS_REVIEWERS_TABLE_NAME)
            .select("*")
            .eq("project_id", scope.projectId)
            .eq("environment", scope.environment)
            .eq("author_id", id)
            .maybeSingle();

        if (targetError) throw targetError;
        if (!targetData) return feedbackError(FEEDBACK_NOT_FOUND_MESSAGE, 404);

        const target = targetData as FivepixelsReviewerRow;

        // 동급·상위는 편집 금지. 엄격히 낮은 등급만.
        if (!outranks(actorRole, target.role)) {
            return feedbackError("본인보다 낮은 등급의 리뷰어만 수정할 수 있습니다.", 403);
        }

        if (body.role !== undefined && !outranks(actorRole, body.role)) {
            return feedbackError("본인보다 낮은 등급만 부여할 수 있습니다.", 403);
        }

        const update: Partial<FivepixelsReviewerRow> & { updated_at: string } = {
            updated_at: new Date().toISOString(),
        };

        if (body.author_name !== undefined) update.author_name = body.author_name.trim();
        if (nextPublicKey) update.public_key = nextPublicKey;
        if (body.role !== undefined) update.role = body.role;
        if (body.is_active !== undefined) update.is_active = body.is_active;

        const { data, error } = await supabase.from(FIVEPIXELS_REVIEWERS_TABLE_NAME).update(update).eq("id", target.id).select("*").single();

        if (error) throw error;

        return NextResponse.json(mapReviewerRowToItem(data as FivepixelsReviewerRow));
    } catch (error: unknown) {
        return feedbackErrorFrom(error, "리뷰어 수정에 실패했습니다.");
    }
}
