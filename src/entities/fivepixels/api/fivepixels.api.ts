import { signTeamAction } from "@/entities/fivepixels/lib/signTeamAction";
import { FIVEPIXELS_TEAM_AUTH_HEADER } from "@/entities/fivepixels/constants/fivepixels.constants";
import type {
    CreateReviewerRequestPayload,
    DeleteFeedbackPayload,
    FivepixelsScope,
    GetFeedbackListPagingPayload,
    GetFeedbackListPagingResponse,
    GetFeedbackListPayload,
    GetFeedbackListResponse,
    GetFeedbackReviewerListPayload,
    GetFeedbackReviewerListResponse,
    GetFeedbackReviewerRequestListResponse,
    PatchFeedbackPayload,
    PatchFeedbackResponse,
    RegisterReviewerPayload,
    ReportAuthor,
    ReportReviewerRequest,
    ResolveReviewerRequestPayload,
    SetFeedbackPayload,
    SetFeedbackResponse,
    UpdateReviewerPayload,
} from "@/entities/fivepixels/model/fivepixels.type";
import { clientApi } from "@/shared/lib/api/client";

const FEEDBACKS_ENDPOINT = "/api/feedbacks";

function buildFeedbackQuery(params: Record<string, string | number | undefined>) {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") search.set(key, String(value));
    }

    return search.toString();
}

/** 팀 관리 요청: payload 에 서명해 body 를 { ...payload, auth } 로 만든다. 서버는 auth 제외 본문으로 검증. */
async function signedTeamBody<T extends Record<string, unknown>>(scope: FivepixelsScope, payload: T) {
    const auth = await signTeamAction({ scope, payload });

    if (!auth) throw new Error("개인 키가 없어 서명할 수 없습니다. 패널에서 키를 먼저 발급하세요.");

    return { ...payload, auth };
}

/** GET/DELETE 처럼 body 가 없는 요청: canonical payload 에 서명해 헤더로 전달한다. */
async function signedTeamHeader(scope: FivepixelsScope, payload: Record<string, unknown>) {
    const auth = await signTeamAction({ scope, payload });

    if (!auth) throw new Error("개인 키가 없어 서명할 수 없습니다. 패널에서 키를 먼저 발급하세요.");

    return { [FIVEPIXELS_TEAM_AUTH_HEADER]: JSON.stringify(auth) };
}

/** fivepixels 피드백 - 현재 pathname 목록 조회 */
export const getFeedbackListFetch = ({ projectId, environment, pathname }: GetFeedbackListPayload) => {
    const query = buildFeedbackQuery({
        project: projectId,
        env: environment,
        pathname,
    });

    return clientApi.get<GetFeedbackListResponse>(`${FEEDBACKS_ENDPOINT}?${query}`);
};

/** fivepixels 피드백 - 전체 페이지 목록 조회 (커서 페이지네이션) */
export const getFeedbackListPagingFetch = ({ projectId, environment, limit, cursor }: GetFeedbackListPagingPayload) => {
    const query = buildFeedbackQuery({
        project: projectId,
        env: environment,
        limit,
        cursor,
    });

    return clientApi.get<GetFeedbackListPagingResponse>(`${FEEDBACKS_ENDPOINT}/all?${query}`);
};

/** fivepixels 피드백 - 생성 (auth 서명은 라이브러리가 payload 에 붙여준다) */
export const setFeedbackFetch = ({ projectId, environment, feedback }: SetFeedbackPayload) => {
    const query = buildFeedbackQuery({ project: projectId, env: environment });

    return clientApi.post<SetFeedbackResponse>(`${FEEDBACKS_ENDPOINT}?${query}`, feedback);
};

/** fivepixels 피드백 - 수정 (auth 서명은 라이브러리가 payload 에 붙여준다) */
export const patchFeedbackFetch = ({ id, projectId, environment, feedback }: PatchFeedbackPayload) => {
    const query = buildFeedbackQuery({ project: projectId, env: environment });

    return clientApi.patch<PatchFeedbackResponse>(`${FEEDBACKS_ENDPOINT}/${id}?${query}`, feedback);
};

/** fivepixels 피드백 - 삭제. 활성 리뷰어 서명을 헤더로 전달한다. */
export const deleteFeedbackFetch = async ({ id, projectId, environment }: DeleteFeedbackPayload) => {
    const scope: FivepixelsScope = { projectId, environment };
    const query = buildFeedbackQuery({ project: projectId, env: environment });
    const headers = await signedTeamHeader(scope, {
        resource: "feedback:delete",
        id,
    });

    return clientApi.delete<void>(`${FEEDBACKS_ENDPOINT}/${id}?${query}`, {
        headers,
    });
};

/** fivepixels 리뷰어 - 명단 조회 (team.reviewers 주입 · 활성/비활성 모두) */
export const getFeedbackReviewerListFetch = ({ projectId, environment }: GetFeedbackReviewerListPayload) => {
    const query = buildFeedbackQuery({ project: projectId, env: environment });

    return clientApi.get<GetFeedbackReviewerListResponse>(`${FEEDBACKS_ENDPOINT}/reviewers?${query}`);
};

/** fivepixels 리뷰어 - 수동 등록/재활성화 (onRegisterReviewer, admin/sub_admin) */
export const setFeedbackReviewerFetch = async (scope: FivepixelsScope, payload: RegisterReviewerPayload) => {
    const query = buildFeedbackQuery({
        project: scope.projectId,
        env: scope.environment,
    });
    const body = await signedTeamBody(scope, { ...payload });

    return clientApi.post<ReportAuthor>(`${FEEDBACKS_ENDPOINT}/reviewers?${query}`, body);
};

/** fivepixels 리뷰어 - 수정 (onUpdateReviewer, admin/sub_admin). id 를 서명에 포함해 replay 방지. */
export const patchFeedbackReviewerFetch = async (scope: FivepixelsScope, id: string, payload: UpdateReviewerPayload) => {
    const query = buildFeedbackQuery({
        project: scope.projectId,
        env: scope.environment,
    });
    const body = await signedTeamBody(scope, { id, ...payload });

    return clientApi.patch<ReportAuthor>(`${FEEDBACKS_ENDPOINT}/reviewers/${id}?${query}`, body);
};

/** fivepixels 등록 요청 - 승인 대기 목록 (onListReviewerRequests, admin/sub_admin). 서명 헤더 전달. */
export const getFeedbackReviewerRequestListFetch = async (scope: FivepixelsScope) => {
    const query = buildFeedbackQuery({
        project: scope.projectId,
        env: scope.environment,
    });
    const headers = await signedTeamHeader(scope, {
        resource: "reviewer-requests:list",
    });

    return clientApi.get<GetFeedbackReviewerRequestListResponse>(`${FEEDBACKS_ENDPOINT}/reviewer-requests?${query}`, { headers });
};

/** fivepixels 등록 요청 - 제출 (onCreateReviewerRequest, 온보딩 중 자기 서명) */
export const setFeedbackReviewerRequestFetch = async (scope: FivepixelsScope, payload: CreateReviewerRequestPayload) => {
    const query = buildFeedbackQuery({
        project: scope.projectId,
        env: scope.environment,
    });
    const body = await signedTeamBody(scope, { ...payload });

    return clientApi.post<ReportReviewerRequest>(`${FEEDBACKS_ENDPOINT}/reviewer-requests?${query}`, body);
};

/** fivepixels 등록 요청 - 승인/거절 (onResolveReviewerRequest, admin/sub_admin). id 를 서명에 포함. */
export const patchFeedbackReviewerRequestFetch = async (scope: FivepixelsScope, id: string, payload: ResolveReviewerRequestPayload) => {
    const query = buildFeedbackQuery({
        project: scope.projectId,
        env: scope.environment,
    });
    const body = await signedTeamBody(scope, { id, ...payload });

    return clientApi.post<ReportReviewerRequest>(`${FEEDBACKS_ENDPOINT}/reviewer-requests/${id}/resolve?${query}`, body);
};
