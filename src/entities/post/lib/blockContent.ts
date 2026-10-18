import type { Block } from "@/entities/post/model/post.type";

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** TipTap HTML 문자열은 그대로, 구형 Block[] 데이터만 단순 p 태그로 변환 */
export const blockContentToHtml = (content: string | Block[]): string => {
    if (typeof content === "string") {
        return content;
    }

    if (!Array.isArray(content) || content.length === 0) {
        return "";
    }

    return content
        .flatMap((block) =>
            block.children.map((child) => {
                const text = escapeHtml(child.value).replace(/\n/g, "<br>");
                return `<p>${text}</p>`;
            }),
        )
        .join("");
};
