"use client";

import { detectCodeLanguage } from "@/shared/lib/codeHighlight";

// prettier는 정렬 버튼을 누를 때만 필요하므로 에디터 초기 번들에서 분리한다.
const loadPrettier = () =>
    Promise.all([
        import("prettier/standalone"),
        import("prettier/plugins/babel"),
        import("prettier/plugins/estree"),
        import("prettier/plugins/html"),
        import("prettier/plugins/postcss"),
        import("prettier/plugins/typescript"),
    ]);

const getPrettierParser = (language: string) => {
    switch (language) {
        case "typescript":
            return "typescript";
        case "html":
        case "xml":
            return "html";
        case "css":
            return "css";
        case "json":
            return "json";
        case "bash":
            return "babel";
        case "python":
            return "babel";
        default:
            return "babel";
    }
};

export const formatCodeContent = async (code: string, language?: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
        return code;
    }

    const resolvedLanguage = language ?? detectCodeLanguage(trimmed);
    const [prettier, ...plugins] = await loadPrettier();

    return prettier.format(trimmed, {
        parser: getPrettierParser(resolvedLanguage),
        plugins,
        tabWidth: 4,
        printWidth: 100,
        semi: true,
        singleQuote: false,
        trailingComma: "all",
    });
};
