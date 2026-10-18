"use client";

import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useMemo } from "react";

import { DEFAULT_CODE_LANGUAGE, highlightCodeWithHljs } from "@/shared/lib/codeHighlight";
import CodeBlockPanel from "@/shared/ui/common/CodeBlockPanel";

export function SnippetCodeBlockNodeView({ node, selected }: NodeViewProps) {
    const language = (node.attrs.language as string | undefined) ?? DEFAULT_CODE_LANGUAGE;
    const code = node.textContent;

    const content = useMemo(() => `<pre class="code-block hljs"><code class="language-${language}">${code}</code></pre>`, [code, language]);

    const highlightedHtml = useMemo(() => highlightCodeWithHljs(code, language), [code, language]);

    return (
        <NodeViewWrapper
            as="div"
            className={`post-snippet-code-block my-[1.6rem] ${selected ? "ring-2 ring-[#3b82f6] rounded-[2.4rem]" : ""}`}
            data-snippet-code-block=""
            data-language={language}
        >
            <CodeBlockPanel
                content={content}
                variant="compact"
                showFormat={false}
                bodyClassName="py-[1.2rem]"
            >
                <div className="snippet-code-block-editor relative min-w-0">
                    <pre
                        aria-hidden
                        className="code-block hljs pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre-wrap break-words bg-transparent font-mono text-[1.2rem] leading-[1.7]"
                    >
                        <code
                            className={`language-${language}`}
                            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                        />
                    </pre>
                    <pre className="relative m-0 bg-transparent">
                        <NodeViewContent
                            className={`snippet-code-block-editor__input text-transparent caret-slate-200 selection:bg-blue-500/35 language-${language} block whitespace-pre-wrap break-words bg-transparent font-mono text-[1.2rem] leading-[1.7] outline-none`}
                        />
                    </pre>
                </div>
            </CodeBlockPanel>
        </NodeViewWrapper>
    );
}
