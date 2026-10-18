"use client";

import useConfirmModalStore from "../model/useConfirmModalStore";

const TestModal = () => {
    const target = useConfirmModalStore((state) => state.target);
    const close = useConfirmModalStore((state) => state.close);

    if (target !== "test") {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
            role="dialog"
            aria-modal="true"
        >
            <div className="flex min-w-[28rem] flex-col gap-[1.6rem] rounded-[1.6rem] bg-white p-[2.4rem] shadow-lg">
                <p className="text-[1.6rem] font-semibold">테스트 모달</p>
                <p className="text-[var(--color-gray-500)]">라우트 scaffold 확인용 모달입니다.</p>
                <button
                    type="button"
                    className="self-end rounded-[0.8rem] bg-[var(--color-brand-500)] px-[1.6rem] py-[0.8rem] text-white"
                    onClick={close}
                >
                    닫기
                </button>
            </div>
        </div>
    );
};

export default TestModal;
