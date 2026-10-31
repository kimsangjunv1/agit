"use client";
import { useGetFeedbackReviewerListQuery } from "@/entities/fivepixels/api/fivepixels.query";

import { useCallback } from "react";

import { FivePixels } from "@fivepixels-js/react";

import {
    setFeedbackReviewerRequestFetch,
    deleteFeedbackFetch,
    getFeedbackListFetch,
    getFeedbackListPagingFetch,
    getFeedbackReviewerListFetch,
    getFeedbackReviewerRequestListFetch,
    patchFeedbackFetch,
    setFeedbackReviewerFetch,
    patchFeedbackReviewerRequestFetch,
    setFeedbackFetch,
    patchFeedbackReviewerFetch,
} from "@/entities/fivepixels/api/fivepixels.api";
import type {
    CreateReportFeedbackPayload,
    CreateReviewerRequestPayload,
    RegisterReviewerPayload,
    ReportListAllParams,
    ResolveReviewerRequestPayload,
    UpdateReportFeedbackPayload,
    UpdateReviewerPayload,
} from "@/entities/fivepixels/model/fivepixels.type";
import { FIVEPIXELS_DEV_ONLY, FIVEPIXELS_PROJECT, FIVEPIXELS_SCOPE, FIVEPIXELS_USER } from "@/features/collectFeedback/lib/fivepixelsProject";
import { confirmAction } from "@/shared/lib/confirmAction";

const confirmFeedbackAction = async <T,>(title: string, onConfirm: () => Promise<T>): Promise<T> => {
    const result = await confirmAction({ title, onConfirm });
    if (!result.accepted) throw new Error("작업을 취소했어요.");
    return result.value;
};

/**
 * fivepixels 피드백 레이어.
 * onList/onCreate/onUpdate는 항상 함께 넘겨야 하며(하나라도 빠지면 localStorage 폴백),
 * handler는 useCallback으로 고정해 목록 API 반복 호출을 막는다.
 *
 * requireReviewerKey + reviewers(publicKey) 로 UI 잠금.
 * 서버는 POST/PATCH/DELETE 및 팀 관리 API 에서 auth 서명을 fivepixels_reviewers 와 대조해 검증한다.
 * 팀 handler(등록/수정/승인)는 개인키로 서명한다 → §docs P3-auth.
 */
export default function FivePixelsLayer() {
    const { data: reviewers = [] } = useGetFeedbackReviewerListQuery(FIVEPIXELS_SCOPE);

    const onList = useCallback(({ pathname }: { pathname: string }) => getFeedbackListFetch({ ...FIVEPIXELS_SCOPE, pathname }), []);

    const onListAll = useCallback(({ limit, cursor }: ReportListAllParams) => getFeedbackListPagingFetch({ ...FIVEPIXELS_SCOPE, limit, cursor }), []);

    const onCreate = useCallback((feedback: CreateReportFeedbackPayload) => confirmFeedbackAction("피드백을 등록할까요?", () => setFeedbackFetch({ ...FIVEPIXELS_SCOPE, feedback })), []);

    const onUpdate = useCallback((id: string, feedback: UpdateReportFeedbackPayload) => confirmFeedbackAction("피드백을 수정할까요?", () => patchFeedbackFetch({ ...FIVEPIXELS_SCOPE, id, feedback })), []);

    const onDelete = useCallback(async (id: string) => {
        await confirmFeedbackAction("피드백을 삭제할까요?", () => deleteFeedbackFetch({ ...FIVEPIXELS_SCOPE, id }));
    }, []);

    const onListReviewers = useCallback(() => getFeedbackReviewerListFetch(FIVEPIXELS_SCOPE), []);

    const onListReviewerRequests = useCallback(() => getFeedbackReviewerRequestListFetch(FIVEPIXELS_SCOPE), []);

    const onCreateReviewerRequest = useCallback((payload: CreateReviewerRequestPayload) => confirmFeedbackAction("검토자 등록을 요청할까요?", () => setFeedbackReviewerRequestFetch(FIVEPIXELS_SCOPE, payload)), []);

    const onResolveReviewerRequest = useCallback((id: string, payload: ResolveReviewerRequestPayload) => confirmFeedbackAction(payload.status === "approved" ? "검토자 요청을 승인할까요?" : "검토자 요청을 거절할까요?", () => patchFeedbackReviewerRequestFetch(FIVEPIXELS_SCOPE, id, payload)), []);

    const onRegisterReviewer = useCallback((payload: RegisterReviewerPayload) => confirmFeedbackAction("검토자를 등록할까요?", () => setFeedbackReviewerFetch(FIVEPIXELS_SCOPE, payload)), []);

    const onUpdateReviewer = useCallback((id: string, payload: UpdateReviewerPayload) => confirmFeedbackAction("검토자 정보를 수정할까요?", () => patchFeedbackReviewerFetch(FIVEPIXELS_SCOPE, id, payload)), []);

    return (
        <FivePixels
            project={FIVEPIXELS_PROJECT}
            team={{
                requireReviewerKey: true,
                user: FIVEPIXELS_USER,
                reviewers,
            }}
            visibility={{ enabled: true, devOnly: FIVEPIXELS_DEV_ONLY }}
            onList={onList}
            onListAll={onListAll}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onListReviewers={onListReviewers}
            onListReviewerRequests={onListReviewerRequests}
            onCreateReviewerRequest={onCreateReviewerRequest}
            onResolveReviewerRequest={onResolveReviewerRequest}
            onRegisterReviewer={onRegisterReviewer}
            onUpdateReviewer={onUpdateReviewer}
        />
    );
}
