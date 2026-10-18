import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { FIVEPIXELS_REVIEWERS_TABLE_NAME } from "@/entities/fivepixels/constants/fivepixels.constants";
import { FEEDBACK_SCOPE_REQUIRED_MESSAGE, feedbackError, feedbackErrorFrom } from "@/entities/fivepixels/lib/feedbackResponse";
import { mapReviewerRowToItem } from "@/entities/fivepixels/lib/mapReviewer";
import { parseFivepixelsScope } from "@/entities/fivepixels/lib/scope";
import { canManageTeam, outranks } from "@/entities/fivepixels/lib/teamRank";
import { stripAuthFromPayload } from "@/entities/fivepixels/lib/verifyFeedbackAuth";
import { verifyTeamActor } from "@/entities/fivepixels/lib/verifyTeamActor";
import type { FivepixelsReviewerRow, RegisterReviewerPayload, ReportAuthProof } from "@/entities/fivepixels/model/fivepixels.type";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

/**
 * 리뷰어 명단 조회. team.reviewers 주입 + 패널 설정→팀 관리 표시용.
 * 활성/비활성 모두 반환한다(관리자가 비활성 멤버를 되살릴 수 있어야 함).
 * 가시성 필터는 클라이언트(라이브러리)가 role 기준으로 수행한다.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const scope = parseFivepixelsScope(searchParams);

    if (!scope) return feedbackError(FEEDBACK_SCOPE_REQUIRED_MESSAGE, 400);

    try {
        const supabase = supabaseAdmin();
        const { data, error } = await supabase
            .from(FIVEPIXELS_REVIEWERS_TABLE_NAME)
            .select("*")
            .eq("project_id", scope.projectId)
            .eq("environment", scope.environment)
            .order("created_at", { ascending: true });

        if (error) throw error;

        return NextResponse.json((data as FivepixelsReviewerRow[]).map(mapReviewerRowToItem));
    } catch (error: unknown) {
        return feedbackErrorFrom(error, "리뷰어 목록 조회에 실패했습니다.");
    }
}

type RegisterReviewerBody = RegisterReviewerPayload & {
    auth?: ReportAuthProof;
};

/**
 * 리뷰어 수동 등록/재활성화 (onRegisterReviewer).
 * 서명으로 호출자를 검증하고, 호출자 rank > 부여 role rank 일 때만 허용한다.
 */
export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const scope = parseFivepixelsScope(searchParams);

    if (!scope) return feedbackError(FEEDBACK_SCOPE_REQUIRED_MESSAGE, 400);

    const body = (await req.json().catch(() => null)) as RegisterReviewerBody | null;

    if (!body) return feedbackError("등록할 내용이 없습니다.", 400);

    const authorId = body.author_id?.trim();
    const authorName = body.author_name?.trim();
    const publicKey = body.public_key?.trim();
    const role = body.role ?? "member";

    if (!authorId || !authorName || !publicKey) {
        return feedbackError("author_id, author_name, public_key 는 필수입니다.", 400);
    }

    if (!publicKey.startsWith("stpub1.")) {
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

        if (!outranks(actorRole, role)) {
            return feedbackError("본인보다 낮은 등급만 부여할 수 있습니다.", 403);
        }

        const supabase = supabaseAdmin();
        const now = new Date().toISOString();

        // 동일 author_id 가 있으면 public_key/이름/role 을 갱신하고 다시 활성화한다.
        const { data: existing, error: existingError } = await supabase
            .from(FIVEPIXELS_REVIEWERS_TABLE_NAME)
            .select("*")
            .eq("project_id", scope.projectId)
            .eq("environment", scope.environment)
            .eq("author_id", authorId)
            .maybeSingle();

        if (existingError) throw existingError;

        if (existing) {
            const target = existing as FivepixelsReviewerRow;

            // 이미 존재하는 대상도 호출자보다 낮은 등급일 때만 수정 가능.
            if (!outranks(actorRole, target.role)) {
                return feedbackError("본인보다 낮은 등급의 리뷰어만 수정할 수 있습니다.", 403);
            }

            const { data, error } = await supabase
                .from(FIVEPIXELS_REVIEWERS_TABLE_NAME)
                .update({
                    author_name: authorName,
                    public_key: publicKey,
                    role,
                    is_active: true,
                    updated_at: now,
                })
                .eq("id", target.id)
                .select("*")
                .single();

            if (error) throw error;

            return NextResponse.json(mapReviewerRowToItem(data as FivepixelsReviewerRow));
        }

        const { data, error } = await supabase
            .from(FIVEPIXELS_REVIEWERS_TABLE_NAME)
            .insert({
                id: `fprev_${randomUUID()}`,
                project_id: scope.projectId,
                environment: scope.environment,
                author_id: authorId,
                author_name: authorName,
                public_key: publicKey,
                role,
                is_active: true,
                created_at: now,
                updated_at: now,
            })
            .select("*")
            .single();

        if (error) throw error;

        return NextResponse.json(mapReviewerRowToItem(data as FivepixelsReviewerRow), { status: 201 });
    } catch (error: unknown) {
        return feedbackErrorFrom(error, "리뷰어 등록에 실패했습니다.");
    }
}
