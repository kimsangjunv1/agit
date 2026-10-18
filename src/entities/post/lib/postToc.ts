import type { Block, SectionContent } from "@/entities/post/model/post.type";

import { isCodeBlock, isMainBlock } from "@/entities/post/lib/blockMode";

export type PostTocItem = {
    id: string;
    blockId: string;
    label: string;
    level: 1 | 2;
};

export const getPostTocAnchorId = (blockId: string) => `post-toc-${blockId}`;

const getMainBlockLabel = (block: SectionContent): string | null => {
    const title = block.title?.trim() ?? "";
    const subtitle = block.subtitle?.trim() ?? "";
    const label = title || subtitle;

    return label || null;
};

export const extractBlockPlainText = (content: string | Block[]): string => {
    if (typeof content === "string") {
        if (!content.trim()) return "";

        return content
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/gi, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, " ")
            .trim();
    }

    if (!Array.isArray(content) || content.length === 0) return "";

    return content
        .flatMap((block) => block.children.map((child) => child.value))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
};

const truncatePreview = (text: string, maxLength = 48): string => {
    if (text.length <= maxLength) return text;

    return `${text.slice(0, maxLength).trimEnd()}…`;
};

const getSubBlockLabel = (block: SectionContent): string | null => {
    const text = extractBlockPlainText(block.content);
    if (!text) return null;

    return truncatePreview(text);
};

export const buildPostToc = (contents: SectionContent[][]): PostTocItem[] => {
    const items: PostTocItem[] = [];
    let hasActiveSection = false;

    for (const row of contents) {
        for (const block of row) {
            if (isCodeBlock(block)) {
                continue;
            }

            if (isMainBlock(block)) {
                const label = getMainBlockLabel(block);
                if (!label) {
                    hasActiveSection = false;
                    continue;
                }

                hasActiveSection = true;
                items.push({
                    id: getPostTocAnchorId(block.id),
                    blockId: block.id,
                    label,
                    level: 1,
                });
                continue;
            }

            if (!hasActiveSection) continue;

            const label = getSubBlockLabel(block);
            if (!label) continue;

            items.push({
                id: getPostTocAnchorId(block.id),
                blockId: block.id,
                label,
                level: 2,
            });
        }
    }

    return items;
};
