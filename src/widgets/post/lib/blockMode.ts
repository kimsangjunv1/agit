import type { SectionContent } from "@/entities/post/model/post.type";

export type BlockMode = "main" | "sub" | "code";

export const resolveBlockMode = (block: SectionContent): BlockMode => {
    if (block.type === 2 || block.blockMode === "code") {
        return "code";
    }

    if (block.blockMode === "main" || block.blockMode === "sub") {
        return block.blockMode;
    }

    const hasHeading = Boolean(block.title?.trim() || block.subtitle?.trim());
    return hasHeading ? "main" : "sub";
};

export const isMainBlock = (block: SectionContent) => resolveBlockMode(block) === "main";

export const isCodeBlock = (block: SectionContent) => resolveBlockMode(block) === "code";

export const getBlockModeLabel = (block: SectionContent) => {
    const mode = resolveBlockMode(block);

    if (mode === "main") return "메인";
    if (mode === "code") return "코드";
    return "서브";
};

export const getNextBlockModePatch = (block: SectionContent): Partial<SectionContent> => {
    const mode = resolveBlockMode(block);

    if (mode === "main") {
        return { blockMode: "sub", type: 0 };
    }

    if (mode === "sub") {
        return {
            blockMode: "code",
            type: 0,
            title: "",
            subtitle: "",
        };
    }

    return {
        blockMode: "main",
        type: 0,
        title: "",
        subtitle: "",
    };
};
