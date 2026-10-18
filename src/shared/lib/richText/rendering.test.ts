import { describe, expect, it } from "vitest";
import { styleRichTextHtml } from "@/shared/lib/sanitizeHtml";
import { highlightCodeWithHljs } from "@/shared/lib/codeHighlight";
import { styleSyntaxTree } from "./syntax";

describe("rich text rendering", () => {
    it("removes executable markup while applying styles to stored content", () => {
        const html = styleRichTextHtml('<p onclick="alert(1)">본문<script>alert(1)</script></p><img src="/test.png" data-align="right">');
        expect(html).not.toMatch(/onclick|<script/);
        expect(html).toContain("본문");
        expect(html).toContain("last:mb-0");
        expect(html).toContain("data-[align=right]:ml-auto");
    });

    it("preserves highlighted code and adds token colors without a stylesheet", () => {
        const html = highlightCodeWithHljs("const answer = 42;", "javascript");
        expect(html).toContain("hljs-keyword text-pink-400");
        expect(html).toContain("hljs-number text-violet-300");
        expect(html.replace(/<[^>]+>/g, "")).toBe("const answer = 42;");
    });

    it("styles lowlight tokens while preserving the original text", () => {
        const tree = { type: "root", children: [{ type: "element", properties: { className: ["hljs-number"] }, children: [{ type: "text", value: "42" }] }] };
        styleSyntaxTree(tree);
        expect(tree.children[0].properties.className).toContain("text-violet-300");
        expect(tree.children[0].children[0].value).toBe("42");
    });
});
