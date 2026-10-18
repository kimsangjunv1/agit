import type { SectionContent } from "@/entities/post/model/post.type";

export const normalizeBlockForEditor = (block: SectionContent): SectionContent => {
    if (block.type === 2) {
        return {
            ...block,
            type: 0,
            blockMode: "code",
            subtitle: "",
        };
    }

    return block;
};

export const normalizeBlocksForEditor = (rows: SectionContent[][]): SectionContent[][] => rows.map((row) => row.map(normalizeBlockForEditor));

export const normalizeBlockForSave = (block: SectionContent): SectionContent => {
    if (block.blockMode === "code" || block.type === 2) {
        const { blockMode: _blockMode, ...rest } = block;

        return {
            ...rest,
            type: 2,
            title: block.title?.trim() ?? "",
            subtitle: "",
            summary: block.summary ?? "",
            imageUrl: block.imageUrl ?? "",
        };
    }

    return block;
};

export const normalizeBlocksForSave = (rows: SectionContent[][]): SectionContent[][] => rows.map((row) => row.map(normalizeBlockForSave));
