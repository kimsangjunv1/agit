import { NextResponse } from "next/server";

import { FIVEPIXELS_TABLE_NAME } from "@/entities/fivepixels/constants/fivepixels.constants";
import { FEEDBACK_SCOPE_REQUIRED_MESSAGE, feedbackError, feedbackErrorFrom } from "@/entities/fivepixels/lib/feedbackResponse";
import { mapRowToFeedback } from "@/entities/fivepixels/lib/mapFeedback";
import { parseFivepixelsListAllRange, parseFivepixelsScope } from "@/entities/fivepixels/lib/scope";
import type { FivepixelsFeedbackRow, GetFeedbackListPagingResponse } from "@/entities/fivepixels/model/fivepixels.type";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const scope = parseFivepixelsScope(searchParams);

    if (!scope) return feedbackError(FEEDBACK_SCOPE_REQUIRED_MESSAGE, 400);

    const { limit, offset } = parseFivepixelsListAllRange(searchParams);

    try {
        const supabase = supabaseAdmin();
        // limit + 1건을 읽어 다음 페이지 존재 여부를 판단한다 (마지막 페이지엔 nextCursor 미포함)
        const { data, error } = await supabase
            .from(FIVEPIXELS_TABLE_NAME)
            .select("*")
            .eq("project_id", scope.projectId)
            .eq("environment", scope.environment)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit);

        if (error) throw error;

        const rows = data as FivepixelsFeedbackRow[];
        const hasNext = rows.length > limit;
        const body: GetFeedbackListPagingResponse = {
            items: (hasNext ? rows.slice(0, limit) : rows).map(mapRowToFeedback),
        };

        if (hasNext) body.nextCursor = String(offset + limit);

        return NextResponse.json(body);
    } catch (error: unknown) {
        return feedbackErrorFrom(error, "전체 피드백 조회에 실패했습니다.");
    }
}
