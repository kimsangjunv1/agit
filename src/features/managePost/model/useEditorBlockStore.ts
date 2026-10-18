import { SectionContent } from "@/entities/post/model/post.type";
import { create } from "zustand";

export type Row = SectionContent[];

interface BlockStore {
    rows: Row[];
    copiedBlock: SectionContent | null;
    selectedPosition: { rowIndex: number; blockIndex: number } | null;
    currentRowStyle: Record<string, string>;
    currentRowPosition: Record<string, number> | null;
    currentLockKey: number;

    // 행/블록 조작
    addBlock: (rowIndex: number, direction: "right" | "down") => void;
    updateBlock: (rowIndex: number, blockIndex: number, newData: Partial<SectionContent>) => void;
    deleteBlock: (rowIndex: number, blockIndex: number) => void;
    deleteRow: (rowIndex: number) => void;

    // 복사/붙여넣기
    copyBlock: (rowIndex: number, blockIndex: number) => void;
    pasteBlock: () => void;
    selectBlock: (rowIndex: number, blockIndex: number) => void;
    unSelectBlock: () => void;
    unSelectRow: () => void;

    // 스타일
    setCurrentRowStyle: (style: Record<string, string>) => void;
    setCurrentRowPosition: (style: Record<string, number>) => void;
    setCurrentLockKey: (style: number) => void;

    // 초기화/설정
    setRows: (rows: Row[]) => void;
    reset: () => void; // 리셋 추가
}

const initialRow: Row[] = [
    [
        {
            id: Date.now().toString(),
            type: 0,
            title: "",
            subtitle: "",
            summary: "",
            content: "",
            imageUrl: "",
            blockMode: "sub",
        },
    ],
];

export const useBlockStore = create<BlockStore>((set, get) => ({
    rows: initialRow,
    copiedBlock: null,
    selectedPosition: null,
    currentRowStyle: {},
    currentRowPosition: {},
    currentLockKey: 999,

    setRows: (rows) => set({ rows }),

    addBlock: (rowIndex, direction) => {
        const newBlock: SectionContent = {
            id: Date.now().toString(),
            type: 0,
            title: "",
            subtitle: "",
            summary: "",
            content: "",
            imageUrl: "",
            blockMode: "sub",
        };
        set((state) => {
            const newRows = state.rows.map((row, i) => (i === rowIndex && direction === "right" && row.length < 2 ? [...row, newBlock] : row));
            if (direction === "down") {
                newRows.splice(rowIndex + 1, 0, [newBlock]);
            }
            return { rows: newRows };
        });
    },

    setCurrentRowStyle: (style) => set({ currentRowStyle: style }),
    setCurrentRowPosition: (style) => set({ currentRowPosition: style }),
    setCurrentLockKey: (style) => set({ currentLockKey: style }),

    updateBlock: (rowIndex, blockIndex, newData) =>
        set((state) => ({
            rows: state.rows.map((row, i) => (i === rowIndex ? row.map((b, j) => (j === blockIndex ? { ...b, ...newData } : b)) : row)),
        })),

    deleteBlock: (rowIndex, blockIndex) =>
        set((state) => ({
            rows: state.rows.map((row, i) => (i === rowIndex ? row.filter((_, j) => j !== blockIndex) : row)).filter((row) => row.length > 0),
        })),

    deleteRow: (rowIndex) =>
        set((state) => ({
            rows: state.rows.filter((_, i) => i !== rowIndex),
            selectedPosition: get().selectedPosition?.rowIndex === rowIndex ? null : get().selectedPosition,
        })),

    copyBlock: (rowIndex, blockIndex) => {
        const block = get().rows[rowIndex][blockIndex];
        set({ copiedBlock: { ...block } });
    },

    pasteBlock: () => {
        const { copiedBlock, selectedPosition, rows } = get();
        if (!copiedBlock || !selectedPosition) return;

        const newBlock = { ...copiedBlock, id: Date.now().toString() };
        const { rowIndex, blockIndex } = selectedPosition;

        const newRows = rows.map((row, i) => (i === rowIndex ? [...row.slice(0, blockIndex + 1), newBlock, ...row.slice(blockIndex + 1)] : row));
        set({ rows: newRows });
        set({ copiedBlock: null });
    },

    selectBlock: (rowIndex, blockIndex) => set({ selectedPosition: { rowIndex, blockIndex } }),
    unSelectBlock: () => set({ selectedPosition: null }),
    unSelectRow: () => set({ currentRowPosition: null }),

    // 초기 상태로 리셋
    reset: () =>
        set({
            rows: initialRow,
            copiedBlock: null,
            selectedPosition: null,
            currentRowStyle: {},
            currentRowPosition: {},
            currentLockKey: 999,
        }),
}));
