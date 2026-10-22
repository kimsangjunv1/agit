"use client";

import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useMemo } from "react";

import { DEFAULT_CODE_LANGUAGE, highlightCodeWithHljs } from "@/shared/lib/codeHighlight";
import CodeBlockPanel from "@/shared/ui/common/CodeBlockPanel";
import { CODE_PRE_CLASS, CODE_TEXT_CLASS, POST_SNIPPET_BODY_CLASS } from "@/shared/lib/richText/styles";
import { TextInsertBars } from "@/shared/ui/common/richText/extensions/textInsertBar";

export function SnippetCodeBlockNodeView({ node, selected, editor, getPos }: NodeViewProps) {
    const language = (node.attrs.language as string | undefined) ?? DEFAULT_CODE_LANGUAGE;
    const code = node.textContent;

    const content = useMemo(() => `<pre class="code-block hljs"><code class="language-${language}">${code}</code></pre>`, [code, language]);

    const highlightedHtml = useMemo(() => highlightCodeWithHljs(code, language), [code, language]);

    return (
        <NodeViewWrapper
            as="div"
            className={`post-snippet-code-block relative ${selected ? "ring-2 ring-[#3b82f6] rounded-[2.4rem]" : ""}`}
            data-snippet-code-block=""
            data-language={language}
        >
            <TextInsertBars
                editor={editor}
                getPos={getPos}
                label="코드"
                nodeType="snippetCodeBlock"
            />
            <CodeBlockPanel
                content={content}
                variant="compact"
                showFormat={false}
                bodyClassName={POST_SNIPPET_BODY_CLASS}
            >
                <div className="snippet-code-block-editor relative min-w-0">
                    <pre
                        aria-hidden
                        className={`code-block hljs pointer-events-none absolute inset-0 overflow-hidden ${CODE_PRE_CLASS}`}
                    >
                        <code
                            className={`language-${language}`}
                            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                        />
                    </pre>
                    <pre className={`relative ${CODE_PRE_CLASS}`}>
                        <NodeViewContent
                            className={`snippet-code-block-editor__input text-transparent caret-slate-200 selection:bg-blue-500/35 language-${language} ${CODE_TEXT_CLASS} outline-none`}
                        />
                    </pre>
                </div>
            </CodeBlockPanel>
        </NodeViewWrapper>
    );
}
