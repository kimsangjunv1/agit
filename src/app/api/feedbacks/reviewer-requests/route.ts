import { randomUUID } from "node:crypto";

import { verifyReportAuthProof } from "@fivepixels-js/react";
import { NextResponse } from "next/server";

import { FIVEPIXELS_REVIEWER_REQUESTS_TABLE_NAME, FIVEPIXELS_TEAM_AUTH_ACTION, POSTGRES_UNIQUE_VIOLATION_CODE } from "@/entities/fivepixels/constants/fivepixels.constants";
import { FEEDBACK_SCOPE_REQUIRED_MESSAGE, feedbackError, feedbackErrorFrom } from "@/entities/fivepixels/lib/feedbackResponse";
import { mapReviewerRequestRowToItem } from "@/entities/fivepixels/lib/mapReviewer";
import { parseFivepixelsScope } from "@/entities/fivepixels/lib/scope";
import { canManageTeam } from "@/entities/fivepixels/lib/teamRank";
import { stripAuthFromPayload } from "@/entities/fivepixels/lib/verifyFeedbackAuth";
import { readTeamAuthHeader, verifyTeamActor } from "@/entities/fivepixels/lib/verifyTeamActor";
import type { CreateReviewerRequestPayload, FivepixelsReviewerRequestRow, ReportAuthProof } from "@/entities/fivepixels/model/fivepixels.type";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

/** GET 목록 조회 시 서명 대상이 되는 canonical payload. */
const LIST_REQUEST_PAYLOAD = { resource: "reviewer-requests:list" } as const;

/**
 * 승인 대기(pending) 목록 (onListReviewerRequests). admin/sub_admin 만.
 * GET 은 body 가 없으므로 서명을 x-fivepixels-auth 헤더로 받는다.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const scope = parseFivepixelsScope(searchParams);

    if (!scope) return feedbackError(FEEDBACK_SCOPE_REQUIRED_MESSAGE, 400);

    try {
        const verified = await verifyTeamActor({
            scope,
            proof: readTeamAuthHeader(req),
            payload: LIST_REQUEST_PAYLOAD,
        });

        if (!verified.ok) return verified.response;

        if (!canManageTeam(verified.actor.reviewer.role)) {
            return feedbackError("팀 관리 권한이 없습니다.", 403);
        }

        const supabase = supabaseAdmin();
        const { data, error } = await supabase
            .from(FIVEPIXELS_REVIEWER_REQUESTS_TABLE_NAME)
            .select("*")
            .eq("project_id", scope.projectId)
            .eq("environment", scope.environment)
            .eq("status", "pending")
            .order("created_at", { ascending: true });

        if (error) throw error;

        return NextResponse.json((data as FivepixelsReviewerRequestRow[]).map(mapReviewerRequestRowToItem));
    } catch (error: unknown) {
        return feedbackErrorFrom(error, "등록 요청 목록 조회에 실패했습니다.");
    }
}

type CreateReviewerRequestBody = CreateReviewerRequestPayload & {
    auth?: ReportAuthProof;
};

/**
 * 등록 요청 제출 (onCreateReviewerRequest). 온보딩 중 아직 미등록 사용자가 호출한다.
 * 활성 리뷰어가 아니므로 reviewers 대조 대신, 제출한 public_key 에 대한 자기 서명을 검증한다
 * (남의 공개키로 위조 요청하는 것을 막는다).
 */
export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const scope = parseFivepixelsScope(searchParams);

    if (!scope) return feedbackError(FEEDBACK_SCOPE_REQUIRED_MESSAGE, 400);

    const body = (await req.json().catch(() => null)) as CreateReviewerRequestBody | null;
    const authorId = body?.author_id?.trim();
    const authorName = body?.author_name?.trim();
    const publicKey = body?.public_key?.trim();

    if (!authorId || !authorName || !publicKey) {
        return feedbackError("author_id, author_name, public_key 는 필수입니다.", 400);
    }

    if (!publicKey.startsWith("stpub1.")) {
        return feedbackError("public_key 형식이 올바르지 않습니다. (stpub1.…)", 400);
    }

    const proof = body?.auth;

    if (!proof || proof.author_id !== authorId || proof.action !== FIVEPIXELS_TEAM_AUTH_ACTION) {
        return feedbackError("auth 서명이 필요합니다.", 401);
    }

    try {
        const selfSigned = await verifyReportAuthProof({
            proof,
            publicKey,
            projectId: scope.projectId,
            environment: scope.environment,
            action: FIVEPIXELS_TEAM_AUTH_ACTION,
            payload: stripAuthFromPayload(body!),
        });

        if (!selfSigned) {
            return feedbackError("auth 서명 검증에 실패했습니다.", 401);
        }

        const supabase = supabaseAdmin();
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from(FIVEPIXELS_REVIEWER_REQUESTS_TABLE_NAME)
            .insert({
                id: `fpreq_${randomUUID()}`,
                project_id: scope.projectId,
                environment: scope.environment,
                author_id: authorId,
                author_name: authorName,
                public_key: publicKey,
                status: "pending",
                created_at: now,
                resolved_at: null,
                resolved_by: null,
            })
            .select("*")
            .single();

        if (error) {
            // 이미 pending 요청이 있으면(부분 유니크 인덱스) 그대로 성공 취급.
            if (error.code === POSTGRES_UNIQUE_VIOLATION_CODE) {
                const { data: existing, error: existingError } = await supabase
                    .from(FIVEPIXELS_REVIEWER_REQUESTS_TABLE_NAME)
                    .select("*")
                    .eq("project_id", scope.projectId)
                    .eq("environment", scope.environment)
                    .eq("author_id", authorId)
                    .eq("status", "pending")
                    .maybeSingle();

                if (existingError) throw existingError;
                if (existing) {
                    return NextResponse.json(mapReviewerRequestRowToItem(existing as FivepixelsReviewerRequestRow));
                }
            }

            throw error;
        }

        return NextResponse.json(mapReviewerRequestRowToItem(data as FivepixelsReviewerRequestRow), { status: 201 });
    } catch (error: unknown) {
        return feedbackErrorFrom(error, "등록 요청 제출에 실패했습니다.");
    }
}
