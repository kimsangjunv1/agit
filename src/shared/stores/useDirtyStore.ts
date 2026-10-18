// stores/useDirtyStore.ts
import { create } from "zustand";

interface DirtyState {
    isDirty: boolean;
    setDirty: (value: boolean) => void;
    resetDirty: () => void; // 추가
}

export const useDirtyStore = create<DirtyState>((set) => ({
    isDirty: false,
    setDirty: (value) => set({ isDirty: value }),
    resetDirty: () => set({ isDirty: false }), // 초기화 함수
}));
