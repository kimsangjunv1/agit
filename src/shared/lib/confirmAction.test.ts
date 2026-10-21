import { beforeEach, describe, expect, it, vi } from "vitest";

import { useModalStore } from "@/shared/stores/useModalStore";
import { confirmAction } from "./confirmAction";

beforeEach(() => {
    useModalStore.setState({ modal: { ...useModalStore.getState().initModal } });
});

describe("확인 후 실행", () => {
    it("확인하기 전과 취소했을 때는 작업을 실행하지 않는다", async () => {
        const onConfirm = vi.fn();
        const result = confirmAction({ title: "삭제할까요?", onConfirm });
        expect(onConfirm).not.toHaveBeenCalled();

        useModalStore.getState().closeModal();

        await expect(result).resolves.toEqual({ accepted: false });
        expect(onConfirm).not.toHaveBeenCalled();
        expect(useModalStore.getState().modal.isOpen).toBe(false);
    });

    it("확인하면 작업을 실행하고 결과를 반환한다", async () => {
        const onConfirm = vi.fn().mockResolvedValue({ id: 42 });
        const result = confirmAction({ title: "저장할까요?", onConfirm });

        await useModalStore.getState().modal.confirm?.onClick?.();

        expect(onConfirm).toHaveBeenCalledTimes(1);
        await expect(result).resolves.toEqual({ accepted: true, value: { id: 42 } });
    });

    it("실패 후에도 같은 모달에서 다시 확인할 수 있다", async () => {
        const onConfirm = vi.fn().mockRejectedValueOnce(new Error("저장 실패")).mockResolvedValueOnce("saved");
        const result = confirmAction({ title: "저장할까요?", onConfirm });
        const confirm = useModalStore.getState().modal.confirm?.onClick;

        await expect(confirm?.()).rejects.toThrow("저장 실패");
        expect(useModalStore.getState().modal.isOpen).toBe(true);
        await confirm?.();

        await expect(result).resolves.toEqual({ accepted: true, value: "saved" });
        expect(onConfirm).toHaveBeenCalledTimes(2);
    });

    it("입력 검증이 실패하면 확인을 완료하지 않고 취소할 수 있다", async () => {
        const result = confirmAction({ title: "저장할까요?", onConfirm: () => false });

        expect(await useModalStore.getState().modal.confirm?.onClick?.()).toBe(false);
        expect(useModalStore.getState().modal.isOpen).toBe(true);
        useModalStore.getState().closeModal();

        await expect(result).resolves.toEqual({ accepted: false });
    });

    it("이미 열린 확인창을 다른 작업으로 덮어쓰지 않는다", async () => {
        const firstAction = vi.fn();
        const secondAction = vi.fn();
        const first = confirmAction({ title: "첫 번째 작업", onConfirm: firstAction });
        const second = confirmAction({ title: "두 번째 작업", onConfirm: secondAction });

        await expect(second).resolves.toEqual({ accepted: false });
        expect(useModalStore.getState().modal.title).toBe("첫 번째 작업");
        expect(secondAction).not.toHaveBeenCalled();
        useModalStore.getState().closeModal();
        await expect(first).resolves.toEqual({ accepted: false });
    });
});

describe("모달 상태", () => {
    it("처리 중에는 취소로 모달이 닫히지 않는다", async () => {
        const result = confirmAction({ title: "삭제할까요?", onConfirm: vi.fn() });
        useModalStore.getState().trackingModalConfirmLoading(true);

        useModalStore.getState().closeModal();
        expect(useModalStore.getState().modal.isOpen).toBe(true);

        useModalStore.getState().trackingModalConfirmLoading(false);
        useModalStore.getState().closeModal();
        await expect(result).resolves.toEqual({ accepted: false });
    });

    it("다음 모달에 이전 작업의 내용이나 확인 콜백이 남지 않는다", () => {
        const store = useModalStore.getState();
        store.setModal({ type: "CHECK", content: "삭제 대상", confirm: { onClick: vi.fn() }, isOpen: true });
        store.setModal({ type: "INFO", title: "안내", isOpen: true });

        const modal = useModalStore.getState().modal;
        expect(modal.title).toBe("안내");
        expect(modal.content).toBeNull();
        expect(modal.confirm?.onClick).toBeUndefined();
        expect(modal.confirm?.loading).toBeNull();
    });
});
