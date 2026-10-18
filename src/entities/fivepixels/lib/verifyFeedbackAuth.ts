import { verifyReportAuthProof } from "@fivepixels-js/react";
import type { ReportAuthProof } from "@fivepixels-js/react";

import { FIVEPIXELS_REVIEWERS_TABLE_NAME } from "@/entities/fivepixels/constants/fivepixels.constants";
import { feedbackError } from "@/entities/fivepixels/lib/feedbackResponse";
import type { FivepixelsReviewerRow, FivepixelsScope } from "@/entities/fivepixels/model/fivepixels.type";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

export type FeedbackAuthAction = "feedback:create" | "feedback:update";

type AuthBearingPayload = {
    auth?: ReportAuthProof;
};

export type VerifiedFeedbackAuthor = {
    authorId: string;
    authorName: string;
    publicKey: string;
    auth: ReportAuthProof;
};

type VerifyFeedbackAuthResult = { ok: true; author: VerifiedFeedbackAuthor } | { ok: false; response: Response };

/** 클라이언트가 서명할 때는 auth 붙이기 전 본문이다. 검증도 auth 를 제외한 payload 로 한다. */
export function stripAuthFromPayload<T extends AuthBearingPayload>(payload: T): Omit<T, "auth"> {
    const { auth: _auth, ...rest } = payload;
    return rest;
}

async function findActiveReviewer(scope: FivepixelsScope, authorId: string) {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
        .from(FIVEPIXELS_REVIEWERS_TABLE_NAME)
        .select("*")
        .eq("project_id", scope.projectId)
        .eq("environment", scope.environment)
        .eq("author_id", authorId)
        .eq("is_active", true)
        .maybeSingle();

    if (error) throw error;

    return data as FivepixelsReviewerRow | null;
}

/**
 * POST/PATCH 본문의 auth 서명을 등록된 publicKey 로 검증한다.
 * requireReviewerKey UI 잠금만으로는 curl 우회를 막지 못하므로 서버에서 반드시 호출한다.
 */
export async function verifyFeedbackAuth(params: { scope: FivepixelsScope; action: FeedbackAuthAction; payload: AuthBearingPayload }): Promise<VerifyFeedbackAuthResult> {
    const { scope, action, payload } = params;
    const proof = payload.auth;

    if (!proof) {
        return {
            ok: false,
            response: feedbackError("auth 서명이 필요합니다.", 401),
        };
    }

    if (proof.action !== action) {
        return {
            ok: false,
            response: feedbackError("auth.action 이 요청과 일치하지 않습니다.", 401),
        };
    }

    const reviewer = await findActiveReviewer(scope, proof.author_id);

    if (!reviewer) {
        return {
            ok: false,
            response: feedbackError("등록되지 않은 리뷰어이거나 비활성 상태입니다.", 403),
        };
    }

    const valid = await verifyReportAuthProof({
        proof,
        publicKey: reviewer.public_key,
        projectId: scope.projectId,
        environment: scope.environment,
        action,
        payload: stripAuthFromPayload(payload),
    });

    if (!valid) {
        return {
            ok: false,
            response: feedbackError("auth 서명 검증에 실패했습니다.", 401),
        };
    }

    return {
        ok: true,
        author: {
            authorId: reviewer.author_id,
            authorName: reviewer.author_name,
            publicKey: reviewer.public_key,
            auth: proof,
        },
    };
}
