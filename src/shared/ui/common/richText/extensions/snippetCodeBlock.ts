import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Extension, mergeAttributes, type CommandProps } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { DEFAULT_CODE_LANGUAGE, detectCodeLanguage } from "@/shared/lib/codeHighlight";
import { SnippetCodeBlockNodeView } from "@/shared/ui/common/richText/extensions/SnippetCodeBlockNodeView";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        snippetCodeBlock: {
            insertSnippetCodeBlock: () => ReturnType;
            toggleSnippetCodeBlock: () => ReturnType;
        };
    }
}

export const SNIPPET_CODE_BLOCK_TAG = "post-snippet-code-block";

export const SnippetCodeBlock = CodeBlockLowlight.extend({
    name: "snippetCodeBlock",

    parseHTML() {
        return [
            {
                tag: `div.${SNIPPET_CODE_BLOCK_TAG}`,
                contentElement: (element) => element.querySelector("code") ?? element,
                preserveWhitespace: "full",
                getAttrs: (element) => {
                    if (!(element instanceof HTMLElement)) {
                        return {};
                    }

                    const codeElement = element.querySelector("code");
                    const languageFromData = element.getAttribute("data-language");
                    const languageFromClass = codeElement?.className.match(/language-([\w-]+)/)?.[1];

                    return {
                        language: languageFromData ?? languageFromClass ?? DEFAULT_CODE_LANGUAGE,
                    };
                },
            },
            {
                tag: 'div[data-snippet-code-block=""]',
                contentElement: (element) => element.querySelector("code") ?? element,
                preserveWhitespace: "full",
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        const language = (node.attrs.language as string | undefined) ?? DEFAULT_CODE_LANGUAGE;

        return [
            "div",
            mergeAttributes(HTMLAttributes, {
                class: SNIPPET_CODE_BLOCK_TAG,
                "data-snippet-code-block": "",
                "data-language": language,
            }),
            ["pre", { class: "code-block hljs" }, ["code", { class: `language-${language}` }, 0]],
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(SnippetCodeBlockNodeView, {
            contentDOMElementTag: "code",
        });
    },

    addCommands() {
        return {
            ...this.parent?.(),
            insertSnippetCodeBlock:
                () =>
                ({ commands }: CommandProps) =>
                    commands.insertContent({
                        type: this.name,
                        attrs: { language: DEFAULT_CODE_LANGUAGE },
                        content: [{ type: "text", text: "" }],
                    }),
            toggleSnippetCodeBlock:
                () =>
                ({ commands, editor }: CommandProps) => {
                    if (editor.isActive(this.name)) {
                        return commands.toggleNode(this.name, "paragraph");
                    }

                    return commands.insertSnippetCodeBlock();
                },
        };
    },
});

export const SnippetCodeBlockLanguageAutoDetect = Extension.create({
    name: "snippetCodeBlockLanguageAutoDetect",

    onUpdate({ editor }) {
        const { selection } = editor.state;
        const parent = selection.$from.parent;

        if (parent.type.name !== "snippetCodeBlock") {
            return;
        }

        const detected = detectCodeLanguage(parent.textContent);
        const current = parent.attrs.language as string | null | undefined;

        if (current !== detected) {
            editor.commands.updateAttributes("snippetCodeBlock", {
                language: detected,
            });
        }
    },
});
