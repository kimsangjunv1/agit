import type {
    CreateReportFeedbackPayload,
    FivepixelsFeedbackRow,
    FivepixelsReplySummary,
    FivepixelsScope,
    ReportFeedback,
    UpdateReportFeedbackPayload,
} from "@/entities/fivepixels/model/fivepixels.type";

type ReportReply = FivepixelsFeedbackRow["replies"][number];

export type FivepixelsFeedbackInsert = Omit<FivepixelsFeedbackRow, "created_at" | "updated_at"> & {
    created_at: string;
    updated_at: string;
};

export type FivepixelsFeedbackUpdate = Partial<
    Pick<FivepixelsFeedbackRow, "cases" | "status" | "category" | "field_values" | "replies" | "reply_count" | "latest_reply" | "report_id" | "report_type" | "integrations" | "auth">
> & { updated_at: string };

function toIsoUtc(value: string): string {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

/** 마지막 reply를 latest_reply 요약으로 압축한다. */
export function summarizeReplies(replies: ReportReply[]) {
    const latest = replies.at(-1);

    const latestReply: FivepixelsReplySummary | null = latest
        ? {
              id: latest.id,
              message: latest.message,
              created_at: latest.created_at,
              status: latest.status,
              author_type: latest.author_type,
              author_name: latest.author_name,
              case_ids: latest.case_ids,
          }
        : null;

    return { reply_count: replies.length, latest_reply: latestReply };
}

/**
 * DB row → 라이브러리 `ReportFeedback`.
 * position / cases / replies / mentions 는 파싱된 원형을 그대로 넘긴다.
 */
export function mapRowToFeedback(row: FivepixelsFeedbackRow): ReportFeedback {
    return {
        id: row.id,
        pathname: row.pathname,
        report_id: row.report_id,
        report_type: row.report_type,
        target_selector: row.target_selector ?? undefined,
        cases: row.cases ?? [],
        status: row.status,
        fc_number: row.fc_number,
        category: row.category ?? null,
        field_values: row.field_values ?? {},
        replies: row.replies ?? [],
        reply_count: row.reply_count,
        latest_reply: row.latest_reply ?? null,
        position: row.position,
        created_at: toIsoUtc(row.created_at),
        environment: row.environment,
        app_version: row.app_version ?? undefined,
        author_id: row.author_id ?? undefined,
        author_name: row.author_name ?? undefined,
        auth: row.auth ?? undefined,
        integrations: row.integrations ?? undefined,
    };
}

/** create payload → insert row. 스코프(project/env)는 쿼리 값이 우선한다. */
export function mapPayloadToInsert(params: { id: string; fcNumber: number; scope: FivepixelsScope; payload: CreateReportFeedbackPayload; now: string }): FivepixelsFeedbackInsert {
    const { id, fcNumber, scope, payload, now } = params;
    const replies = payload.replies ?? [];
    const { reply_count, latest_reply } = summarizeReplies(replies);

    return {
        id,
        project_id: scope.projectId,
        environment: scope.environment,
        app_version: payload.app_version ?? null,
        pathname: payload.pathname,
        report_id: payload.report_id,
        report_type: payload.report_type,
        target_selector: payload.target_selector ?? null,
        status: payload.status ?? "open",
        fc_number: fcNumber,
        category: payload.category ?? null,
        field_values: payload.field_values ?? {},
        cases: payload.cases ?? [],
        replies,
        reply_count,
        latest_reply,
        position: payload.position,
        author_id: payload.author_id ?? null,
        author_name: payload.author_name ?? null,
        auth: payload.auth ?? null,
        integrations: payload.integrations ?? null,
        created_at: now,
        updated_at: now,
    };
}

/** update payload → update row. 전달된 키만 반영하고 배열·객체는 통째 교체한다. */
export function mapPayloadToUpdate(payload: UpdateReportFeedbackPayload, now: string): FivepixelsFeedbackUpdate {
    const update: FivepixelsFeedbackUpdate = { updated_at: now };

    if ("cases" in payload && payload.cases) update.cases = payload.cases;
    if ("status" in payload && payload.status) update.status = payload.status;
    if ("category" in payload) update.category = payload.category ?? null;
    if ("field_values" in payload && payload.field_values) update.field_values = payload.field_values;
    if ("report_id" in payload && payload.report_id) update.report_id = payload.report_id;
    if ("report_type" in payload && payload.report_type) update.report_type = payload.report_type;
    if ("integrations" in payload) update.integrations = payload.integrations ?? null;
    if ("auth" in payload) update.auth = payload.auth ?? null;

    if ("replies" in payload && payload.replies) {
        const { reply_count, latest_reply } = summarizeReplies(payload.replies);

        update.replies = payload.replies;
        update.reply_count = reply_count;
        update.latest_reply = latest_reply;
    }

    return update;
}
