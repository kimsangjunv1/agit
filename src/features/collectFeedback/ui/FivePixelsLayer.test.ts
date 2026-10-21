import React, { createElement } from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/entities/fivepixels/api/fivepixels.api";
import { useModalStore } from "@/shared/stores/useModalStore";
import FivePixelsLayer from "./FivePixelsLayer";

const captured = vi.hoisted(() => ({ props: {} as Record<string, (...args: unknown[]) => Promise<unknown>> }));

vi.mock("@fivepixels-js/react", () => ({
    FivePixels: (props: typeof captured.props) => {
        captured.props = props;
        return null;
    },
}));

vi.mock("@/entities/fivepixels/api/fivepixels.api", () => Object.fromEntries([
    "setFeedbackFetch", "patchFeedbackFetch", "deleteFeedbackFetch", "getFeedbackListFetch", "getFeedbackListPagingFetch", "getFeedbackReviewerListFetch", "getFeedbackReviewerRequestListFetch", "setFeedbackReviewerRequestFetch", "patchFeedbackReviewerRequestFetch", "setFeedbackReviewerFetch", "patchFeedbackReviewerFetch",
].map((name) => [name, vi.fn().mockResolvedValue({ id: "saved" })])));

beforeEach(() => {
    vi.stubGlobal("React", React);
    vi.clearAllMocks();
    useModalStore.setState({ modal: { ...useModalStore.getState().initModal } });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    renderToString(createElement(QueryClientProvider, { client }, createElement(FivePixelsLayer)));
    client.clear();
});

afterEach(() => vi.unstubAllGlobals());

describe("피드백 확인", () => {
    it.each([
        ["onCreate", "setFeedbackFetch", [{}]],
        ["onUpdate", "patchFeedbackFetch", ["feedback-1", {}]],
        ["onDelete", "deleteFeedbackFetch", ["feedback-1"]],
        ["onCreateReviewerRequest", "setFeedbackReviewerRequestFetch", [{}]],
        ["onResolveReviewerRequest", "patchFeedbackReviewerRequestFetch", ["request-1", { status: "approved" }]],
        ["onRegisterReviewer", "setFeedbackReviewerFetch", [{}]],
        ["onUpdateReviewer", "patchFeedbackReviewerFetch", ["reviewer-1", {}]],
    ] as const)("%s는 확인한 뒤 요청하고 호출자에게 결과를 돌려준다", async (handler, fetchName, args) => {
        const result = captured.props[handler](...args);
        expect(api[fetchName]).not.toHaveBeenCalled();

        await useModalStore.getState().modal.confirm?.onClick?.();

        expect(api[fetchName]).toHaveBeenCalledTimes(1);
        await expect(result).resolves.toEqual(handler === "onDelete" ? undefined : { id: "saved" });
    });

    it("취소한 요청은 실행하거나 저장 성공으로 처리하지 않는다", async () => {
        const result = captured.props.onCreate({});
        const rejection = expect(result).rejects.toThrow("작업을 취소했어요.");
        useModalStore.getState().closeModal();

        await rejection;
        expect(api.setFeedbackFetch).not.toHaveBeenCalled();
    });
});
