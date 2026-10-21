"use client";

import { useMemo } from "react";

import { extractCodeFromContent, highlightCodeWithHljs } from "@/shared/lib/codeHighlight";
import { sanitizeHtml, styleRichTextHtml } from "@/shared/lib/sanitizeHtml";
import CodeBlockPanel from "@/shared/ui/common/CodeBlockPanel";
import UI from "@/shared/ui/common/UIComponent";
import { SNIPPET_CODE_BLOCK_TAG } from "@/shared/ui/common/richText/extensions/snippetCodeBlock";
import { POST_SNIPPET_BODY_CLASS } from "@/shared/lib/richText/styles";

type RichTextPart = { type: "html"; content: string } | { type: "snippet"; content: string; language: string };

export const parsePostRichTextHtml = (html: string): RichTextPart[] => {
    if (!html.trim()) {
        return [];
    }

    if (typeof document === "undefined") {
        return [{ type: "html", content: html }];
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    const parts: RichTextPart[] = [];

    wrapper.childNodes.forEach((node) => {
        if (node instanceof HTMLElement && node.classList.contains(SNIPPET_CODE_BLOCK_TAG)) {
            const { language, code } = extractCodeFromContent(node.innerHTML);
            parts.push({
                type: "snippet",
                content: code,
                language,
            });
            return;
        }

        const content = node instanceof HTMLElement ? node.outerHTML : (node.textContent ?? "");
        if (content.trim()) {
            const previous = parts[parts.length - 1];
            if (previous?.type === "html") {
                previous.content += content;
            } else {
                parts.push({ type: "html", content });
            }
        }
    });

    return parts.length > 0 ? parts : [{ type: "html", content: html }];
};

type PostRichTextContentProps = {
    html: string;
    className?: string;
    onParagraphClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

type HtmlPart = { type: "html"; html: string } | { type: "img"; html: string };

const readTagAttr = (tag: string, name: string) => {
    const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
    return match?.[1] ?? match?.[2] ?? "";
};

const splitHtmlByImages = (html: string): HtmlPart[] => {
    const parts: HtmlPart[] = [];
    const pattern = /<img\b[^>]*>/gi;
    let lastIndex = 0;

    for (const match of html.matchAll(pattern)) {
        const index = match.index ?? 0;
        if (index > lastIndex) parts.push({ type: "html", html: html.slice(lastIndex, index) });
        parts.push({ type: "img", html: match[0] });
        lastIndex = index + match[0].length;
    }

    if (lastIndex < html.length) parts.push({ type: "html", html: html.slice(lastIndex) });
    return parts;
};

const RichTextHtml = ({ html }: { html: string }) => {
    const parts = useMemo(() => splitHtmlByImages(html), [html]);

    return parts.map((part, index) => {
        if (part.type === "img") {
            const src = readTagAttr(part.html, "src");
            if (!src) return null;

            const width = readTagAttr(part.html, "style").match(/(?:^|;)\s*width\s*:\s*([^;]+)/i)?.[1]?.trim();
            const align = readTagAttr(part.html, "data-align");
            const imageWidth = readTagAttr(part.html, "data-image-width");

            return (
                <UI.Window
                    key={`img-${index}`}
                    openOnContentClick
                >
                    <img
                        src={src}
                        alt={readTagAttr(part.html, "alt")}
                        className={readTagAttr(part.html, "class") || undefined}
                        style={width ? { width } : undefined}
                        data-align={align || undefined}
                        data-image-width={imageWidth || undefined}
                        draggable={false}
                    />
                </UI.Window>
            );
        }

        if (!part.html.trim()) return null;

        return (
            <div
                key={`html-${index}`}
                dangerouslySetInnerHTML={{ __html: part.html }}
            />
        );
    });
};

const SnippetBlockView = ({ content, language }: { content: string; language: string }) => {
    const panelContent = useMemo(() => `<pre class="code-block hljs"><code class="language-${language}">${content}</code></pre>`, [content, language]);
    const highlightedHtml = useMemo(() => styleRichTextHtml(`<pre class="code-block hljs"><code>${highlightCodeWithHljs(content, language)}</code></pre>`), [content, language]);

    return (
        <CodeBlockPanel
            content={panelContent}
            variant="compact"
            showFormat={false}
            bodyClassName={POST_SNIPPET_BODY_CLASS}
        >
            <div
                className="code-block-view select-text"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
        </CodeBlockPanel>
    );
};

const PostRichTextContent = ({ html, className, onParagraphClick }: PostRichTextContentProps) => {
    const parts = useMemo(() => parsePostRichTextHtml(styleRichTextHtml(html)), [html]);

    return (
        <section
            className={className}
            onClick={onParagraphClick}
        >
            {parts.map((part, index) => {
                if (part.type === "snippet") {
                    return (
                        <SnippetBlockView
                            key={`snippet-${index}`}
                            content={part.content}
                            language={part.language}
                        />
                    );
                }

                return (
                    <RichTextHtml
                        key={`html-${index}`}
                        html={part.content}
                    />
                );
            })}
        </section>
    );
};

export default PostRichTextContent;
