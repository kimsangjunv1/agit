import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { FIVEPIXELS_REVIEWERS_TABLE_NAME, FIVEPIXELS_REVIEWER_REQUESTS_TABLE_NAME } from "@/entities/fivepixels/constants/fivepixels.constants";
import { FEEDBACK_NOT_FOUND_MESSAGE, FEEDBACK_SCOPE_REQUIRED_MESSAGE, feedbackError, feedbackErrorFrom } from "@/entities/fivepixels/lib/feedbackResponse";
import { mapReviewerRequestRowToItem } from "@/entities/fivepixels/lib/mapReviewer";
import { parseFivepixelsScope } from "@/entities/fivepixels/lib/scope";
import { canManageTeam, outranks } from "@/entities/fivepixels/lib/teamRank";
import { stripAuthFromPayload } from "@/entities/fivepixels/lib/verifyFeedbackAuth";
import { verifyTeamActor } from "@/entities/fivepixels/lib/verifyTeamActor";
import type { FivepixelsReviewerRequestRow, FivepixelsReviewerRow, ReportAuthProof, ReportAuthorRole, ResolveReviewerRequestPayload } from "@/entities/fivepixels/model/fivepixels.type";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

type ResolveRouteContext = { params: Promise<{ id: string }> };

type ResolveRequestBody = ResolveReviewerRequestPayload & {
    id?: string;
    auth?: ReportAuthProof;
};

/**
 * 등록 요청 승인/거절 (onResolveReviewerRequest). admin/sub_admin 만.
 * 승인 시 부여 role 은 호출자보다 낮아야 하며, reviewers 에 upsert 한다.
 */
export async function POST(req: Request, { params }: ResolveRouteContext) {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const scope = parseFivepixelsScope(searchParams);

    if (!scope) return feedbackError(FEEDBACK_SCOPE_REQUIRED_MESSAGE, 400);

    const body = (await req.json().catch(() => null)) as ResolveRequestBody | null;

    if (!body) return feedbackError("처리할 내용이 없습니다.", 400);

    // 서명은 { id, status, role? } 를 대상으로 한다. URL id 와 일치해야 replay 를 막는다.
    if (body.id !== id) {
        return feedbackError("요청 대상이 서명과 일치하지 않습니다.", 400);
    }

    const status = body.status;

    if (status !== "approved" && status !== "rejected") {
        return feedbackError("status 는 approved 또는 rejected 여야 합니다.", 400);
    }

    const grantRole: ReportAuthorRole = body.role ?? "member";

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

        if (status === "approved" && !outranks(actorRole, grantRole)) {
            return feedbackError("본인보다 낮은 등급만 부여할 수 있습니다.", 403);
        }

        const supabase = supabaseAdmin();
        const now = new Date().toISOString();

        const { data: requestData, error: requestError } = await supabase
            .from(FIVEPIXELS_REVIEWER_REQUESTS_TABLE_NAME)
            .select("*")
            .eq("id", id)
            .eq("project_id", scope.projectId)
            .eq("environment", scope.environment)
            .eq("status", "pending")
            .maybeSingle();

        if (requestError) throw requestError;
        if (!requestData) return feedbackError(FEEDBACK_NOT_FOUND_MESSAGE, 404);

        const request = requestData as FivepixelsReviewerRequestRow;

        if (status === "approved") {
            // 동일 author_id 리뷰어가 있으면 갱신·재활성화, 없으면 신규 등록.
            const { data: existing, error: existingError } = await supabase
                .from(FIVEPIXELS_REVIEWERS_TABLE_NAME)
                .select("id")
                .eq("project_id", scope.projectId)
                .eq("environment", scope.environment)
                .eq("author_id", request.author_id)
                .maybeSingle();

            if (existingError) throw existingError;

            if (existing) {
                const { error: updateError } = await supabase
                    .from(FIVEPIXELS_REVIEWERS_TABLE_NAME)
                    .update({
                        author_name: request.author_name,
                        public_key: request.public_key,
                        role: grantRole,
                        is_active: true,
                        updated_at: now,
                    })
                    .eq("id", (existing as { id: string }).id);

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase.from(FIVEPIXELS_REVIEWERS_TABLE_NAME).insert({
                    id: `fprev_${randomUUID()}`,
                    project_id: scope.projectId,
                    environment: scope.environment,
                    author_id: request.author_id,
                    author_name: request.author_name,
                    public_key: request.public_key,
                    role: grantRole,
                    is_active: true,
                    created_at: now,
                    updated_at: now,
                });

                if (insertError) throw insertError;
            }
        }

        const { data: resolved, error: resolveError } = await supabase
            .from(FIVEPIXELS_REVIEWER_REQUESTS_TABLE_NAME)
            .update({
                status,
                resolved_at: now,
                resolved_by: verified.actor.reviewer.author_id,
            })
            .eq("id", request.id)
            .select("*")
            .single();

        if (resolveError) throw resolveError;

        return NextResponse.json(mapReviewerRequestRowToItem(resolved as FivepixelsReviewerRequestRow));
    } catch (error: unknown) {
        return feedbackErrorFrom(error, "등록 요청 처리에 실패했습니다.");
    }
}
