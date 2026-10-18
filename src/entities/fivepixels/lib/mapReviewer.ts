import type { FivepixelsReviewerItem, FivepixelsReviewerRequestRow, FivepixelsReviewerRow, ReportReviewerRequest } from "@/entities/fivepixels/model/fivepixels.type";

/** DB row → 라이브러리 `ReportAuthor`(team.reviewers 항목). publicKey/role/isActive 노출. */
export function mapReviewerRowToItem(row: FivepixelsReviewerRow): FivepixelsReviewerItem {
    return {
        id: row.author_id,
        name: row.author_name,
        publicKey: row.public_key,
        role: row.role,
        isActive: row.is_active,
    };
}

/** DB row → 라이브러리 `ReportReviewerRequest`(승인 큐 항목). */
export function mapReviewerRequestRowToItem(row: FivepixelsReviewerRequestRow): ReportReviewerRequest {
    return {
        id: row.id,
        author_id: row.author_id,
        author_name: row.author_name,
        public_key: row.public_key,
        status: row.status,
        created_at: row.created_at,
        resolved_at: row.resolved_at,
        resolved_by: row.resolved_by,
    };
}
