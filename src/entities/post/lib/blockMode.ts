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

const isContentBlock = (block: SectionContent) => !isMainBlock(block) && !isCodeBlock(block);

/** 다음 행과 사이가 5.2rem이 되어야 하는 행. 목록의 마지막 행은 제외한다. */
export const getSectionEndRowIndexes = (rows: SectionContent[][]) => {
    const sections: Array<{ mainRow: number; lastContentRow: number | null }> = [];
    let sectionMainRow: number | null = null;
    let lastContentRow: number | null = null;

    const closeSection = () => {
        if (sectionMainRow === null) return;

        sections.push({ mainRow: sectionMainRow, lastContentRow });
        sectionMainRow = null;
        lastContentRow = null;
    };

    rows.forEach((row, rowIndex) => {
        row.forEach((block) => {
            if (isCodeBlock(block)) return;

            if (isMainBlock(block)) {
                closeSection();
                sectionMainRow = rowIndex;
                return;
            }

            if (isContentBlock(block) && sectionMainRow !== null) {
                lastContentRow = rowIndex;
            }
        });
    });

    closeSection();

    const rowsWithFollowingContent = new Set(sections.filter((section) => section.lastContentRow !== null && section.lastContentRow !== section.mainRow).map((section) => section.mainRow));
    const endRows = new Set<number>();

    sections.forEach((section) => {
        const endRow = section.lastContentRow ?? section.mainRow;
        if (endRow >= rows.length - 1) return;
        if (section.lastContentRow === null && rowsWithFollowingContent.has(endRow)) return;

        endRows.add(endRow);
    });

    return endRows;
};

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
