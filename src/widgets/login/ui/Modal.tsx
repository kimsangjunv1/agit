"use client";
import TestModal from "../modal/TestModal";
import useConfirmModalStore from "../model/useConfirmModalStore";
const Modal = () => {
    const open = useConfirmModalStore((state) => state.open);
    return (
        <>
            {process.env.NODE_ENV === "development" && (
                <button
                    type="button"
                    onClick={() => open("test")}
                    className="fixed bottom-[1.6rem] right-[1.6rem] z-[90] rounded-[0.8rem] bg-black px-[1.2rem] py-[0.8rem] text-[1.2rem] text-white"
                >
                    테스트 모달
                </button>
            )}
            <TestModal />
        </>
    );
};
export default Modal;
