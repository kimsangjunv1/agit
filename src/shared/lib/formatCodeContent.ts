"use client";

import * as prettier from "prettier/standalone";
import * as prettierPluginBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";
import * as prettierPluginHtml from "prettier/plugins/html";
import * as prettierPluginPostcss from "prettier/plugins/postcss";
import * as prettierPluginTypescript from "prettier/plugins/typescript";

import { detectCodeLanguage } from "@/shared/lib/codeHighlight";

const FORMAT_PLUGINS = [prettierPluginBabel, prettierPluginEstree, prettierPluginHtml, prettierPluginPostcss, prettierPluginTypescript];

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

    return prettier.format(trimmed, {
        parser: getPrettierParser(resolvedLanguage),
        plugins: FORMAT_PLUGINS,
        tabWidth: 4,
        printWidth: 100,
        semi: true,
        singleQuote: false,
        trailingComma: "all",
    });
};
