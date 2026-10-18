import { useQuery } from "@tanstack/react-query";
import { getFeedbackReviewerListFetch } from "./fivepixels.api";
import type { GetFeedbackReviewerListPayload } from "../model/fivepixels.type";
import { AgitRoutes } from "@/shared/constants/entityKeys";
export const useGetFeedbackReviewerListQuery = (payload: GetFeedbackReviewerListPayload) =>
    useQuery({
        queryKey: [AgitRoutes.KEY_FEEDBACK, "reviewers", payload.projectId, payload.environment],
        queryFn: () => getFeedbackReviewerListFetch(payload),
        retry: false,
    });
