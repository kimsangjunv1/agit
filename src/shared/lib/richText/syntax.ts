/** highlight.js와 lowlight가 만든 각 토큰에 직접 적용할 Tailwind 클래스. */
export const getSyntaxClass = (tokens: string[]): string[] => {
    const styles = new Set<string>();
    const colors: Record<string, string> = {
        "hljs-comment": "text-slate-500 italic",
        "hljs-quote": "text-slate-500 italic",
        "hljs-keyword": "text-pink-400 font-medium",
        "hljs-selector-tag": "text-pink-400 font-medium",
        "hljs-built_in": "text-pink-400 font-medium",
        "hljs-selector-id": "text-pink-400 font-medium",
        "hljs-selector-class": "text-pink-400 font-medium",
        "hljs-tag": "text-pink-400",
        "hljs-name": "text-pink-400",
        "hljs-number": "text-violet-300",
        "hljs-literal": "text-violet-300",
        "hljs-symbol": "text-violet-300",
        "hljs-function": "text-sky-300",
        "hljs-title": "text-sky-300",
        "hljs-type": "text-amber-300",
        "hljs-class": "text-amber-300",
        "hljs-meta": "text-slate-400",
        "hljs-regexp": "text-slate-400",
        "hljs-deletion": "text-slate-400",
        "hljs-params": "text-slate-200",
        "hljs-variable": "text-slate-200",
        "hljs-template-variable": "text-slate-200",
        "hljs-property": "text-slate-300",
        "hljs-subst": "text-slate-300",
        "hljs-attr": "text-sky-400 font-medium",
        "hljs-attribute": "text-sky-400 font-medium",
        "hljs-string": "text-slate-200",
        "hljs-addition": "text-slate-200",
    };
    tokens.forEach((token) => colors[token]?.split(" ").forEach((style) => styles.add(style)));
    return [...styles];
};

export const styleSyntaxHtml = (html: string): string =>
    html.replace(/class="([^"]+)"/g, (_, value: string) => {
        const tokens = value.split(/\s+/);
        return `class="${[...tokens, ...getSyntaxClass(tokens)].join(" ")}"`;
    });

type SyntaxNode = {
    type: string;
    properties?: { className?: Array<string | number> };
    children?: SyntaxNode[];
};
export const styleSyntaxTree = <T extends SyntaxNode>(tree: T): T => {
    const tokens = tree.properties?.className;
    if (tokens) tokens.push(...getSyntaxClass(tokens.map(String)));
    tree.children?.forEach(styleSyntaxTree);
    return tree;
};
