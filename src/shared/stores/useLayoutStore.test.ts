import { beforeEach, describe, expect, it } from "vitest";

import { getPageReadinessProgress, useLayoutStore } from "./useLayoutStore";

const state = () => useLayoutStore.getState();
const progress = () => getPageReadinessProgress(state());
const begin = () => state().beginRouteTransition({ direction: "forward", navigation: { type: "push", url: "/post/1" } });

beforeEach(() => {
    useLayoutStore.setState(useLayoutStore.getInitialState(), true);
    begin();
});

describe("페이지 준비 진행률", () => {
    it("페이지 이동이 끝나기 전에는 진행률을 임의로 올리지 않는다", () => {
        expect(progress()).toBe(0);
        state().setTransitionPhase("navigating");
        state().registerPageBlocker("data", true);

        expect(progress()).toBe(0);
        state().completePageReadiness();
        expect(state().isPageReadinessComplete).toBe(false);
    });

    it("이동·데이터·이미지가 실제로 준비될 때 각 단계의 진행률을 반영한다", () => {
        state().setTransitionPhase("waiting");
        state().registerPageBlocker("data", false);
        expect(progress()).toBeCloseTo(1 / 3);

        state().registerPageBlocker("image-1", false, "image");
        state().registerPageBlocker("image-2", false, "image");
        state().registerPageBlocker("data", true);
        expect(progress()).toBeCloseTo(2 / 3);

        state().registerPageBlocker("image-1", true, "image");
        expect(progress()).toBeCloseTo(5 / 6);
        expect(state().pageReadinessBlockers).toEqual({ "image-2": true });

        state().registerPageBlocker("image-2", true, "image");
        expect(progress()).toBe(1);
        state().completePageReadiness();
        expect(state().isPageReadinessComplete).toBe(true);
    });

    it("데이터를 기다리는 중에도 먼저 준비된 이미지의 비율을 반영한다", () => {
        state().setTransitionPhase("waiting");
        state().registerPageBlocker("data-1", true);
        state().registerPageBlocker("data-2", false);
        state().registerPageBlocker("cached-image", true, "image");

        expect(progress()).toBeCloseTo(5 / 6);
        state().registerPageBlocker("data-2", true);
        expect(progress()).toBe(1);
    });

    it("이미지가 먼저 준비되면 데이터 완료를 기다리지 않고 진행률을 올린다", () => {
        state().setTransitionPhase("waiting");
        state().registerPageBlocker("data", false);
        state().registerPageBlocker("image-1", false, "image");
        state().registerPageBlocker("image-2", false, "image");
        expect(progress()).toBeCloseTo(1 / 3);

        state().registerPageBlocker("image-1", true, "image");
        expect(progress()).toBeCloseTo(0.5);
        state().registerPageBlocker("image-2", true, "image");
        expect(progress()).toBeCloseTo(2 / 3);
        state().completePageReadiness();
        expect(state().isPageReadinessComplete).toBe(false);
    });

    it("준비된 작업을 기록에 남기고 중복 보고는 무시한다", () => {
        state().setTransitionPhase("waiting");
        state().registerPageBlocker("data", false);
        state().registerPageBlocker("data", true);
        const before = state();
        state().registerPageBlocker("data", true);

        expect(state()).toBe(before);
        expect(state().pageReadinessTasks).toEqual({ data: { ready: true, kind: "data" } });
    });

    it("이미지가 없는 페이지는 데이터가 준비되면 완료할 수 있다", () => {
        state().setTransitionPhase("waiting");
        state().registerPageBlocker("data", true);
        state().completePageReadiness();

        expect(progress()).toBe(1);
        expect(state().isPageReadinessComplete).toBe(true);
    });

    it("화면에서 제거된 작업은 남은 준비를 막지 않는다", () => {
        state().setTransitionPhase("waiting");
        state().registerPageBlocker("data", true);
        state().registerPageBlocker("removed-image", false, "image");
        state().releasePageBlocker("removed-image");
        state().completePageReadiness();

        expect(state().pageReadinessTasks).not.toHaveProperty("removed-image");
        expect(state().isPageReadinessComplete).toBe(true);
    });

    it("시간 초과로 화면 대기를 끝내도 미완료 작업을 완료로 표시하지 않는다", () => {
        state().setTransitionPhase("waiting");
        state().registerPageBlocker("slow-image", false, "image");
        state().completePageReadiness();
        state().completeRouteTransition();

        expect(state().transitionPhase).toBe("idle");
        expect(state().isPageReadinessComplete).toBe(false);
        expect(state().pageReadinessTasks).toEqual({});
    });

    it("정상 완료 상태는 막대의 100% 표시가 끝날 때까지 유지한다", () => {
        state().setTransitionPhase("waiting");
        state().registerPageBlocker("data", true);
        state().completePageReadiness();
        state().completeRouteTransition();

        expect(state().isPageReadinessComplete).toBe(true);
        expect(state().pageReadinessTasks).toEqual({});
    });

    it("다음 이동에서는 완료 상태와 이전 작업을 초기화한다", () => {
        state().setTransitionPhase("waiting");
        state().registerPageBlocker("old-data", true);
        state().completePageReadiness();
        const previousId = state().pageReadinessId;
        begin();

        expect(state().pageReadinessId).toBe(previousId + 1);
        expect(state().isPageReadinessComplete).toBe(false);
        expect(state().pageReadinessTasks).toEqual({});
        expect(progress()).toBe(0);
    });
});
