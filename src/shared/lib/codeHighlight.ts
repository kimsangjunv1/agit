import { styleSyntaxHtml } from "@/shared/lib/richText/syntax";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";

export const DEFAULT_CODE_LANGUAGE = "javascript";
export const CODE_TAB_SIZE = 4;
export const CODE_TAB_STRING = " ".repeat(CODE_TAB_SIZE);

const AUTO_DETECT_LANGUAGES = ["javascript", "typescript", "html", "xml", "css", "json", "python", "bash"] as const;

const HTML_TAG_PATTERN = /<\/?[a-zA-Z][\w-]*(\s|\/>|>)/;
const JS_JSX_PATTERN =
    /\b(import|export|from|const|let|var|function|return|class|extends|async|await|new|if|else|for|while|switch|case|default|try|catch|finally|throw|typeof|instanceof|void|delete|in|of|do|yield|await)\b|=>|\(\)\s*=>|\{|\}|;/;

export const isJsxLikeCode = (code: string) => HTML_TAG_PATTERN.test(code) && JS_JSX_PATTERN.test(code);

const REGISTERED_LANGUAGES: Array<[string, Parameters<typeof hljs.registerLanguage>[1]]> = [
    ["javascript", javascript],
    ["typescript", typescript],
    ["css", css],
    ["json", json],
    ["bash", bash],
    ["python", python],
    ["html", xml],
    ["xml", xml],
];

REGISTERED_LANGUAGES.forEach(([name, grammar]) => {
    hljs.registerLanguage(name, grammar);
});

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const decodeHtmlEntities = (text: string) =>
    text
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"');

const extractLanguageFromClass = (className: string) => {
    const match = className.match(/language-([\w-]+)/);
    return match?.[1] ?? DEFAULT_CODE_LANGUAGE;
};

/** TipTap CodeBlock HTML, legacy `<p>` HTML, plain text 모두 지원 */
export const extractCodeFromContent = (content: string): { language: string; code: string } => {
    if (!content.trim()) {
        return { language: DEFAULT_CODE_LANGUAGE, code: "" };
    }

    if (!content.includes("<")) {
        return { language: DEFAULT_CODE_LANGUAGE, code: content };
    }

    if (typeof document !== "undefined") {
        const template = document.createElement("template");
        template.innerHTML = content;
        const codeEl = template.content.querySelector("pre code") ?? template.content.querySelector("code");

        if (codeEl) {
            return {
                language: extractLanguageFromClass(codeEl.className),
                code: decodeHtmlEntities(codeEl.textContent ?? ""),
            };
        }
    }

    const preCodeMatch = content.match(/<pre[^>]*>\s*<code[^>]*class="[^"]*language-([\w-]+)[^"]*"[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/i);
    if (preCodeMatch) {
        return {
            language: preCodeMatch[1] ?? DEFAULT_CODE_LANGUAGE,
            code: decodeHtmlEntities(preCodeMatch[2].replace(/<[^>]+>/g, "")),
        };
    }

    const legacyParagraphs = content.match(/<p>([\s\S]*?)<\/p>/gi);
    if (legacyParagraphs?.length) {
        const code = legacyParagraphs.map((paragraph) => paragraph.replace(/<\/?p>/gi, "")).join("\n");

        return { language: DEFAULT_CODE_LANGUAGE, code: decodeHtmlEntities(code) };
    }

    const stripped = content.replace(/<[^>]+>/g, "\n").trim();
    return {
        language: DEFAULT_CODE_LANGUAGE,
        code: decodeHtmlEntities(stripped),
    };
};

export const toCodeBlockHtml = (code: string, language = DEFAULT_CODE_LANGUAGE) => {
    const escaped = escapeHtml(code);
    const resolvedLanguage = language === DEFAULT_CODE_LANGUAGE ? detectCodeLanguage(code) : language;
    return `<pre><code class="language-${resolvedLanguage}">${escaped}</code></pre>`;
};

const CODE_FILE_EXTENSIONS: Record<string, string> = {
    html: ".html",
    xml: ".html",
    javascript: ".js",
    typescript: ".ts",
    css: ".css",
    json: ".json",
    python: ".py",
    bash: ".sh",
};

const CODE_FILE_DEFAULT_BASE_NAMES: Record<string, string> = {
    html: "index",
    xml: "index",
    javascript: "script",
    typescript: "index",
    css: "styles",
    json: "data",
    python: "main",
    bash: "script",
};

/** highlight.js / lowlight 에서 사용할 언어 추론 */
export const detectCodeLanguage = (code: string): string => {
    const trimmed = code.trim();
    if (!trimmed) {
        return DEFAULT_CODE_LANGUAGE;
    }

    const hasHtmlTags = HTML_TAG_PATTERN.test(code);
    const hasTypeScript = /\b(interface|type\s+[A-Z]\w*)\b/.test(code) || /:\s*(string|number|boolean|void|unknown|never|React[A-Za-z]*|JSX\.[A-Za-z]*)\b/.test(code);

    if (hasHtmlTags && isJsxLikeCode(code)) {
        return hasTypeScript ? "typescript" : "javascript";
    }

    if (hasHtmlTags) {
        return "html";
    }

    try {
        const { language } = hljs.highlightAuto(trimmed, [...AUTO_DETECT_LANGUAGES]);
        if (language && hljs.getLanguage(language)) {
            return language;
        }
    } catch {
        // fall through
    }

    return DEFAULT_CODE_LANGUAGE;
};

export const getCodeLanguageExtension = (language: string, code?: string) => {
    if (code && isJsxLikeCode(code)) {
        if (language === "typescript") return ".tsx";
        if (language === "javascript") return ".jsx";
    }

    return CODE_FILE_EXTENSIONS[language] ?? "";
};

export const getDefaultCodeFileBaseName = (language: string) => CODE_FILE_DEFAULT_BASE_NAMES[language] ?? "code";

export const sanitizeCodeFileBaseName = (value: string) =>
    value
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\.(html?|css|jsx?|tsx?|json|py|sh|bash|ts|xml)$/i, "")
        .trim();

export const resolveCodeBlockFileName = (content: string, customBaseName?: string) => {
    const { code } = extractCodeFromContent(content);
    const language = detectCodeLanguage(code);
    const extension = getCodeLanguageExtension(language, code);
    const baseName = sanitizeCodeFileBaseName(customBaseName ?? "") || getDefaultCodeFileBaseName(language);
    const label = extension ? `${baseName}${extension}` : baseName;

    return { baseName, extension, label, language };
};

export const highlightCodeWithHljs = (content: string, language?: string): string => {
    const { language: storedLanguage, code } = extractCodeFromContent(content);
    const targetLanguage = language ?? (storedLanguage === DEFAULT_CODE_LANGUAGE ? detectCodeLanguage(code) : storedLanguage);

    if (!code.trim()) {
        return "";
    }

    try {
        if (targetLanguage && targetLanguage !== "plaintext" && hljs.getLanguage(targetLanguage)) {
            return styleSyntaxHtml(hljs.highlight(code, { language: targetLanguage }).value);
        }

        return styleSyntaxHtml(hljs.highlightAuto(code).value);
    } catch {
        return escapeHtml(code);
    }
};

export { hljs };
