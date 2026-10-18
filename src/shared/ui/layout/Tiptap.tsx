"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Highlight } from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useRef } from "react";

import TipTapBubbleMenu from "@/shared/ui/layout/TipTapBubbleMenu";
import TipTapImageBubbleMenu from "@/shared/ui/layout/TipTapImageBubbleMenu";
import TipTapToolbar from "@/shared/ui/layout/TipTapToolbar";
import { TIPTAP_PROSE_CLASS, RICH_TEXT_PARAGRAPH_CLASS, RICH_TEXT_SPAN_CLASS, RICH_TEXT_BLOCKQUOTE_CLASS } from "@/shared/lib/richText/styles";
import { createCodeBlockEditorExtensions } from "@/shared/ui/common/richText/extensions/codeBlockEditor";
import { DEFAULT_CODE_LANGUAGE } from "@/shared/lib/codeHighlight";
import { codeBlockLowlight } from "@/shared/ui/common/richText/extensions/codeBlockEditor";
import { DraftImageDrop } from "@/shared/ui/common/richText/extensions/draftImageDrop";
import { ResizableImage } from "@/shared/ui/common/richText/extensions/resizableImage";
import { SnippetCodeBlock, SnippetCodeBlockLanguageAutoDetect } from "@/shared/ui/common/richText/extensions/snippetCodeBlock";

type Props = {
    content?: string;
    onChange?: (html: string) => void;
    showToolbar?: boolean;
    onEditorFocus?: (editor: Editor) => void;
    onEditorBlur?: () => void;
};

const TIPTAP_EDITOR_CLASS = ["tiptap-editor-content min-h-[12rem] outline-none focus:outline-none", TIPTAP_PROSE_CLASS].join(" ");

const TIPTAP_WRAPPER_CLASS = "min-h-[12rem] h-full rounded-[1.6rem] outline-none";

const CustomTextStyle = TextStyle.configure({
    HTMLAttributes: { class: RICH_TEXT_SPAN_CLASS },
}).extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            fontSize: {
                default: null,
                parseHTML: (element) => element.style.fontSize || null,
                renderHTML: (attributes) => {
                    if (!attributes.fontSize) return {};
                    return { style: `font-size: ${attributes.fontSize}` };
                },
            },
            lineHeight: {
                default: null,
                parseHTML: (element) => element.style.lineHeight || null,
                renderHTML: (attributes) => {
                    if (!attributes.lineHeight) return {};
                    return { style: `line-height: ${attributes.lineHeight}` };
                },
            },
        };
    },
});

const Normal = ({ content = "", onChange, showToolbar = true, onEditorFocus, onEditorBlur }: Props) => {
    const lastEmittedHtml = useRef(content);

    const editor = useEditor({
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
        editorProps: {
            attributes: {
                autocomplete: "off",
                autocorrect: "off",
                autocapitalize: "off",
                "aria-label": "본문 입력",
                class: TIPTAP_EDITOR_CLASS,
            },
        },
        extensions: [
            StarterKit.configure({
                paragraph: { HTMLAttributes: { class: RICH_TEXT_PARAGRAPH_CLASS } },
                bulletList: {
                    HTMLAttributes: { class: "list-disc pl-[2rem] my-[0.8rem]" },
                },
                orderedList: {
                    HTMLAttributes: { class: "list-decimal pl-[2rem] my-[0.8rem]" },
                },
                blockquote: { HTMLAttributes: { class: RICH_TEXT_BLOCKQUOTE_CLASS } },
                horizontalRule: false,
                trailingNode: false,
                link: {
                    openOnClick: false,
                    enableClickSelection: true,
                },
            }),
            Underline,
            CustomTextStyle,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Highlight.configure({ multicolor: true }),
            ResizableImage.configure({
                allowBase64: true,
                inline: false,
            }),
            SnippetCodeBlock.configure({
                lowlight: codeBlockLowlight,
                defaultLanguage: DEFAULT_CODE_LANGUAGE,
            }),
            SnippetCodeBlockLanguageAutoDetect,
            DraftImageDrop,
        ],
        content,
        onFocus: ({ editor: currentEditor }) => onEditorFocus?.(currentEditor),
        onBlur: () => onEditorBlur?.(),
        onUpdate: ({ editor: currentEditor }) => {
            const html = currentEditor.getHTML();
            lastEmittedHtml.current = html;
            onChange?.(html);
        },
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        if (content === lastEmittedHtml.current) {
            return;
        }

        const editorHtml = editor.getHTML();
        if (content === editorHtml) {
            lastEmittedHtml.current = content;
            return;
        }

        editor.commands.setContent(content, { emitUpdate: false });
        lastEmittedHtml.current = content;
    }, [content, editor]);

    if (!editor) return null;

    return (
        <div
            className="w-full h-full rounded-[1.2rem]"
            onClick={(e) => e.stopPropagation()}
        >
            {showToolbar ? <TipTapToolbar editor={editor} /> : null}
            <TipTapBubbleMenu editor={editor} />
            <TipTapImageBubbleMenu editor={editor} />
            <EditorContent
                editor={editor}
                className={TIPTAP_WRAPPER_CLASS}
            />
        </div>
    );
};

const Code = ({ content = "", onChange }: Props) => {
    const lastEmittedHtml = useRef(content);
    const initialContent = useRef(content);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: createCodeBlockEditorExtensions(),
        content: initialContent.current || '<pre><code class="language-javascript"></code></pre>',
        editorProps: {
            attributes: {
                autocomplete: "off",
                autocorrect: "off",
                autocapitalize: "off",
                spellcheck: "false",
                "aria-label": "코드 입력",
                class: "tiptap-code-editor h-full min-h-[12rem] outline-none focus:outline-none font-mono text-[1.6rem] leading-[1.6] text-slate-200 bg-transparent",
            },
        },
        onUpdate: ({ editor: currentEditor }) => {
            const html = currentEditor.getHTML();
            lastEmittedHtml.current = html;
            onChange?.(html);
        },
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        if (!editor.isActive("codeBlock")) {
            editor.commands.setCodeBlock({ language: DEFAULT_CODE_LANGUAGE });
        }
    }, [editor]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        if (content === lastEmittedHtml.current) {
            return;
        }

        const editorHtml = editor.getHTML();
        if (content === editorHtml) {
            lastEmittedHtml.current = content;
            return;
        }

        editor.commands.setContent(content || '<pre><code class="language-javascript"></code></pre>', { emitUpdate: false });
        lastEmittedHtml.current = content;
    }, [content, editor]);

    if (!editor) return null;

    return (
        <div
            className="w-full h-full min-h-[12rem] flex-1"
            onClick={(e) => e.stopPropagation()}
        >
            <EditorContent
                editor={editor}
                className="tiptap-code-editor-wrapper h-full min-h-[12rem]"
            />
        </div>
    );
};

const TipTap = {
    Normal,
    Code,
};

export default TipTap;
