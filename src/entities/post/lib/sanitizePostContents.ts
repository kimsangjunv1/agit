import type { SectionContent } from "@/entities/post/model/post.type";
import { sanitizeHtml } from "@/shared/lib/sanitizeHtml";

export const sanitizePostContents = (contents: SectionContent[][] | undefined): SectionContent[][] => {
    if (!contents) return [];

    return contents.map((row) =>
        row.map((block) => {
            if (typeof block.content !== "string") {
                return block;
            }

            return {
                ...block,
                content: sanitizeHtml(block.content),
            };
        }),
    );
};
