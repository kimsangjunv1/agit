import { FIVEPIXELS_TEAM_AUTH_HEADER } from "@/entities/fivepixels/constants/fivepixels.constants";
import { verifyReportAuthProof } from "@fivepixels-js/react";
import type { ReportAuthProof } from "@fivepixels-js/react";

import { FIVEPIXELS_REVIEWERS_TABLE_NAME, FIVEPIXELS_TEAM_AUTH_ACTION } from "@/entities/fivepixels/constants/fivepixels.constants";
import { feedbackError } from "@/entities/fivepixels/lib/feedbackResponse";
import type { FivepixelsReviewerRow, FivepixelsScope } from "@/entities/fivepixels/model/fivepixels.type";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

export type VerifiedTeamActor = {
    reviewer: FivepixelsReviewerRow;
};

type VerifyTeamActorResult = { ok: true; actor: VerifiedTeamActor } | { ok: false; response: Response };

/** GET 은 헤더로, POST/PATCH 는 body.auth 로 온 서명을 파싱한다. */
export { FIVEPIXELS_TEAM_AUTH_HEADER } from "@/entities/fivepixels/constants/fivepixels.constants";

export function readTeamAuthHeader(req: Request): ReportAuthProof | null {
    const raw = req.headers.get(FIVEPIXELS_TEAM_AUTH_HEADER);

    if (!raw) return null;

    try {
        return JSON.parse(raw) as ReportAuthProof;
    } catch {
        return null;
    }
}

/**
 * 팀 관리 API(등록/수정/승인/목록) 호출자의 auth 서명을 검증한다.
 * requireReviewerKey UI 잠금만으로는 curl 우회를 막지 못하므로 서버에서 반드시 호출한다.
 * payload 는 서명 대상과 값이 동일해야 하며(auth 제외 본문 또는 canonical 객체), 검증 성공 시
 * 호출자의 활성 리뷰어 row(=role 포함)를 돌려주어 rank 검사에 사용한다.
 */
export async function verifyTeamActor(params: { scope: FivepixelsScope; proof: ReportAuthProof | null | undefined; payload: unknown }): Promise<VerifyTeamActorResult> {
    const { scope, proof, payload } = params;

    if (!proof) {
        return {
            ok: false,
            response: feedbackError("auth 서명이 필요합니다.", 401),
        };
    }

    if (proof.action !== FIVEPIXELS_TEAM_AUTH_ACTION) {
        return {
            ok: false,
            response: feedbackError("auth.action 이 요청과 일치하지 않습니다.", 401),
        };
    }

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
        .from(FIVEPIXELS_REVIEWERS_TABLE_NAME)
        .select("*")
        .eq("project_id", scope.projectId)
        .eq("environment", scope.environment)
        .eq("author_id", proof.author_id)
        .eq("is_active", true)
        .maybeSingle();

    if (error) throw error;

    const reviewer = data as FivepixelsReviewerRow | null;

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
        action: FIVEPIXELS_TEAM_AUTH_ACTION,
        payload,
    });

    if (!valid) {
        return {
            ok: false,
            response: feedbackError("auth 서명 검증에 실패했습니다.", 401),
        };
    }

    return { ok: true, actor: { reviewer } };
}
