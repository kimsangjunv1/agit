import DOMPurify from "isomorphic-dompurify";

import { POST_VIEW_PARAGRAPH_CLASS, RICH_TEXT_SPAN_CLASS, POST_VIEW_IMAGE_CLASS, RICH_TEXT_BLOCKQUOTE_CLASS, CODE_PRE_CLASS, CODE_TEXT_CLASS } from "@/shared/lib/richText/styles";

const SANITIZE_OPTIONS = {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "a", "img", "blockquote", "code", "pre", "span", "mark", "hr", "div"],
    ALLOWED_ATTR: ["href", "src", "alt", "class", "style", "target", "rel", "data-align", "data-image-width", "data-snippet-code-block", "data-language"],
};

export const sanitizeHtml = (dirty: string): string => DOMPurify.sanitize(dirty, SANITIZE_OPTIONS);

/** 저장된 HTML도 각 요소에 직접 Tailwind 클래스를 부여한다. */
export const styleRichTextHtml = (dirty: string): string => {
    const body = DOMPurify.sanitize(dirty, {
        ...SANITIZE_OPTIONS,
        RETURN_DOM: true,
    }) as HTMLElement;
    const classes: Record<string, string> = {
        p: POST_VIEW_PARAGRAPH_CLASS,
        span: RICH_TEXT_SPAN_CLASS,
        ul: "list-disc pl-[2rem] my-[0.8rem]",
        ol: "list-decimal pl-[2rem] my-[0.8rem]",
        blockquote: RICH_TEXT_BLOCKQUOTE_CLASS,
        img: POST_VIEW_IMAGE_CLASS,
        pre: CODE_PRE_CLASS,
        code: CODE_TEXT_CLASS,
    };
    body.querySelectorAll("p, span, ul, ol, blockquote, img, pre, code").forEach((element) => {
        const tokens = classes[element.tagName.toLowerCase()];
        if (tokens) element.classList.add(...tokens.split(" "));
        if (element.tagName === "IMG") element.classList.remove("my-[1.6rem]");
    });
    return body.innerHTML;
};
