import type { SectionContent } from "@/entities/post/model/post.type";
import { isPostType, isPostVisibility, type PostType } from "@/entities/post/model/postSettings";

export const parsePostPayload = (body: unknown, draft = false, currentPostType: PostType = "article") => {
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    const { title, summary, thumbnail, category_idx, contents, post_type, visibility } = body as Record<string, unknown>;
    const effectiveType = post_type ?? currentPostType;
    if (
        typeof title !== "string" ||
        (!draft && !title.trim()) ||
        typeof summary !== "string" ||
        typeof thumbnail !== "string" ||
        !(category_idx === null || (typeof category_idx === "number" && Number.isSafeInteger(category_idx) && category_idx >= 0)) ||
        (!draft && effectiveType === "article" && (typeof category_idx !== "number" || category_idx < 1)) ||
        !Array.isArray(contents) ||
        !contents.every((row) => Array.isArray(row) && row.every((block) => block && typeof block === "object" && !Array.isArray(block))) ||
        (post_type !== undefined && !isPostType(post_type)) ||
        (visibility !== undefined && !isPostVisibility(visibility))
    )
        return null;

    return {
        title,
        summary,
        thumbnail,
        category_idx: effectiveType === "article" ? (category_idx as number | null) : null,
        contents: contents as SectionContent[][],
        ...(isPostType(post_type) ? { post_type } : {}),
        ...(isPostVisibility(visibility) ? { visibility } : {}),
    };
};
