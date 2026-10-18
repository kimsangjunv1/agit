import { create } from "zustand";

type ConfirmModalTarget = "test" | null;

type ConfirmModalState = {
    target: ConfirmModalTarget;
    open: (target: ConfirmModalTarget) => void;
    close: () => void;
};

const useConfirmModalStore = create<ConfirmModalState>((set) => ({
    target: null,
    open: (target) => set({ target }),
    close: () => set({ target: null }),
}));

export default useConfirmModalStore;
