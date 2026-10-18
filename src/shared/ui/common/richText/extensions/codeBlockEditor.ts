import { styleSyntaxTree } from "@/shared/lib/richText/syntax";
import { CODE_PRE_CLASS, CODE_TEXT_CLASS } from "@/shared/lib/richText/styles";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Document from "@tiptap/extension-document";
import History from "@tiptap/extension-history";
import Text from "@tiptap/extension-text";
import { Extension, mergeAttributes } from "@tiptap/core";
import { all, createLowlight } from "lowlight";

import { CODE_TAB_STRING, DEFAULT_CODE_LANGUAGE, detectCodeLanguage } from "@/shared/lib/codeHighlight";

const lowlight = createLowlight(all);
export const codeBlockLowlight = {
    ...lowlight,
    highlight: (...args: Parameters<typeof lowlight.highlight>) => styleSyntaxTree(lowlight.highlight(...args)),
    highlightAuto: (...args: Parameters<typeof lowlight.highlightAuto>) => styleSyntaxTree(lowlight.highlightAuto(...args)),
};

const getCurrentLineRange = (state: {
    doc: {
        textBetween: (from: number, to: number, blockSeparator?: string, leafText?: string) => string;
    };
    selection: { $from: { start: () => number; end: () => number; pos: number } };
}) => {
    const blockStart = state.selection.$from.start();
    const blockEnd = state.selection.$from.end();
    const blockText = state.doc.textBetween(blockStart, blockEnd, "\n", "\n");
    const offsetInBlock = state.selection.$from.pos - blockStart;
    const beforeCursor = blockText.slice(0, offsetInBlock);
    const afterCursor = blockText.slice(offsetInBlock);
    const lineStartOffset = beforeCursor.lastIndexOf("\n") + 1;
    const lineEndOffset = afterCursor.indexOf("\n");
    const lineEnd = lineEndOffset === -1 ? blockText.length : offsetInBlock + lineEndOffset;

    return {
        lineStart: blockStart + lineStartOffset,
        lineEnd: blockStart + lineEnd,
        currentLine: blockText.slice(lineStartOffset, lineEnd),
    };
};

const toggleLineComment = (line: string) => {
    const trimmed = line.trimStart();
    const leadingSpaces = line.slice(0, line.length - trimmed.length);

    if (trimmed.startsWith("//")) {
        return `${leadingSpaces}${trimmed.replace(/^\/\/\s?/, "")}`;
    }

    return `${leadingSpaces}// ${trimmed}`;
};

export const CodeBlockShortcuts = Extension.create({
    name: "codeBlockShortcuts",

    addKeyboardShortcuts() {
        return {
            Tab: ({ editor }) => {
                if (!editor.isActive("codeBlock")) {
                    return false;
                }

                return editor.commands.insertContent(CODE_TAB_STRING);
            },
            "Shift-Tab": ({ editor }) => {
                if (!editor.isActive("codeBlock")) {
                    return false;
                }

                const { state } = editor;
                const { from } = state.selection;
                const beforeCursor = state.doc.textBetween(Math.max(0, from - CODE_TAB_STRING.length), from);

                if (beforeCursor === CODE_TAB_STRING) {
                    editor
                        .chain()
                        .focus()
                        .deleteRange({ from: from - CODE_TAB_STRING.length, to: from })
                        .run();
                    return true;
                }

                if (beforeCursor.endsWith("\t")) {
                    editor
                        .chain()
                        .focus()
                        .deleteRange({ from: from - 1, to: from })
                        .run();
                }

                return true;
            },
            "Mod-/": ({ editor }) => {
                if (!editor.isActive("codeBlock")) {
                    return false;
                }

                const { state } = editor;
                const { from, to } = state.selection;
                const selectedText = state.doc.textBetween(from, to, "\n");

                if (from !== to) {
                    const commented = selectedText
                        .split("\n")
                        .map((line) => toggleLineComment(line))
                        .join("\n");

                    editor.chain().focus().insertContentAt({ from, to }, commented).run();
                    return true;
                }

                const { lineStart, lineEnd, currentLine } = getCurrentLineRange(state);
                const nextLine = toggleLineComment(currentLine);
                editor.chain().focus().insertContentAt({ from: lineStart, to: lineEnd }, nextLine).run();
                return true;
            },
            "Mod-a": ({ editor }) => {
                if (!editor.isActive("codeBlock")) {
                    return false;
                }

                return editor.commands.selectAll();
            },
            Enter: ({ editor }) => {
                if (!editor.isActive("codeBlock")) {
                    return false;
                }

                return editor.commands.insertContent("\n");
            },
        };
    },
});

export const CodeBlockLanguageAutoDetect = Extension.create({
    name: "codeBlockLanguageAutoDetect",

    onUpdate({ editor }) {
        if (!editor.isActive("codeBlock")) {
            return;
        }

        const code = editor.state.doc.textContent;
        const detected = detectCodeLanguage(code);
        const current = editor.getAttributes("codeBlock").language as string | null | undefined;

        if (current !== detected) {
            editor.commands.updateAttributes("codeBlock", { language: detected });
        }
    },
});

const StyledCodeBlock = CodeBlockLowlight.extend({
    renderHTML({ HTMLAttributes }) {
        return ["pre", mergeAttributes(HTMLAttributes, { class: CODE_PRE_CLASS }), ["code", { class: CODE_TEXT_CLASS }, 0]];
    },
});
export const createCodeBlockEditorExtensions = () => [
    Document.extend({
        content: "codeBlock",
    }),
    Text,
    History.configure({ depth: 200 }),
    StyledCodeBlock.configure({
        lowlight: codeBlockLowlight,
        defaultLanguage: DEFAULT_CODE_LANGUAGE,
        HTMLAttributes: {
            class: "hljs code-block-editor",
        },
    }),
    CodeBlockShortcuts,
    CodeBlockLanguageAutoDetect,
];
