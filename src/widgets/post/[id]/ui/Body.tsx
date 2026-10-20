"use client";
import { usePostDetailProvider } from "../model/PostDetailContext";
import { Fragment, memo, useMemo } from "react";
import { Block, SectionContent } from "@/entities/post/model/post.type";
import { highlightCodeWithHljs } from "@/shared/lib/codeHighlight";
import { sanitizeHtml, styleRichTextHtml } from "@/shared/lib/sanitizeHtml";
import CodeBlockPanel from "@/shared/ui/common/CodeBlockPanel";
import { BLOCK_COLUMN_CLASS, BLOCK_ROW_CLASS, POST_BLOCK_HEADING_CLASS, POST_BLOCK_IMAGE_CLASS, POST_BLOCK_LIST_CLASS, POST_BLOCK_SUBTITLE_CLASS, POST_BLOCK_TITLE_CLASS, POST_CODE_BODY_CLASS, POST_CONTENT_WIDTH_CLASS, POST_TIPTAP_CONTENT_CLASS } from "@/shared/lib/richText/styles";
import PostRichTextContent from "@/widgets/post/[id]/ui/PostRichTextContent";
import { isMainBlock } from "@/entities/post/lib/blockMode";
import { getPostTocAnchorId } from "@/entities/post/lib/postToc";

const ContentColumn = memo(({ col, rowLength, onCopySentence }: { col: SectionContent; rowLength: number; onCopySentence: (text: string) => void }) => {
    const sanitizedContent = useMemo(() => (typeof col.content === "string" ? sanitizeHtml(col.content) : ""), [col.content]);
    const subtitle = col.subtitle?.trim() ?? "";
    const title = col.title?.trim() ?? "";
    const showHeading = isMainBlock(col) && Boolean(subtitle || title);
    const columnClassName = `${BLOCK_COLUMN_CLASS} ${rowLength !== 0 ? "" : ""} ${rowLength === 1 ? "tablet:col-span-2" : ""} ${col.type === 0 ? "" : ""} ${col.type === 1 || col.type === 2 ? "rounded-[2.4rem] overflow-hidden" : ""} ${col.type === 2 ? "flex-col" : ""}`;
    // const columnClassName = `${BLOCK_COLUMN_CLASS} ${rowLength !== 0 ? "" : ""} ${rowLength === 1 ? "tablet:col-span-2" : ""} ${col.type === 0 ? "flex flex-col gap-[1.6rem]" : ""} ${col.type === 1 || col.type === 2 ? "rounded-[2.4rem] overflow-hidden" : ""} ${col.type === 2 ? "flex-col" : ""}`;
    // const columnClassName = `${BLOCK_COLUMN_CLASS} ${rowLength !== 0 ? "flex gap-[2.4rem]" : ""} ${rowLength === 1 ? "tablet:col-span-2" : "tablet:min-h-[36.0rem]"} ${col.type === 0 ? "flex flex-col gap-[1.6rem]" : ""} ${col.type === 1 || col.type === 2 ? "rounded-[2.4rem] overflow-hidden" : ""} ${col.type === 2 ? "flex-col" : ""}`;

    return (
        <section
            id={col.type === 0 ? getPostTocAnchorId(col.id) : undefined}
            className={`${columnClassName} !border-transparent ${col.type === 0 ? "scroll-mt-[18rem] tablet:scroll-mt-[12rem]" : ""}`}
        >
            {col.type === 0 ? (
                <Fragment>
                    {showHeading ? (
                        <section className={POST_BLOCK_HEADING_CLASS}>
                            {subtitle ? <p className={POST_BLOCK_SUBTITLE_CLASS}>{subtitle}</p> : null}
                            {title ? <h5 className={POST_BLOCK_TITLE_CLASS}>{title}</h5> : null}
                        </section>
                    ) : null}

                    {typeof col.content === "string" ? (
                        <PostRichTextContent
                            className={POST_TIPTAP_CONTENT_CLASS}
                            html={sanitizedContent}
                            onParagraphClick={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.tagName === "P" || target.closest("p")) {
                                    const paragraph = target.tagName === "P" ? target : target.closest("p");
                                    onCopySentence(paragraph?.textContent ?? "");
                                }
                            }}
                        />
                    ) : (
                        <section className="flex flex-col items-start gap-[1.6rem] overflow-x-auto">
                            {(col.content as Block[]).map((e) =>
                                e.children.map((itemInfo, itemIdx) => (
                                    <p
                                        key={`${col.id}-${itemIdx}`}
                                        style={{
                                            lineHeight: itemInfo.style?.lineHeight,
                                            fontSize: `${itemInfo.style?.fontSize}rem`,
                                            fontWeight: itemInfo.style?.fontWeight,
                                            color: itemInfo.style?.color,
                                            textAlign: itemInfo.style?.textAlign as React.CSSProperties["textAlign"],
                                            background: `${itemInfo.style?.backgroundColor}`,
                                        }}
                                        className="whitespace-break-spaces transition-colors border border-transparent cursor-pointer hover:bg-[var(--color-surface-floating)] hover:text-[var(--color-text-primary)] rounded-[0.8rem]"
                                        onClick={() => onCopySentence(itemInfo.value)}
                                    >
                                        {itemInfo.value}
                                    </p>
                                )),
                            )}
                        </section>
                    )}
                </Fragment>
            ) : null}

            {col.type === 1 && col.imageUrl ? (
                <img
                    src={col.imageUrl}
                    alt=""
                    className={POST_BLOCK_IMAGE_CLASS}
                />
            ) : null}

            {col.type === 2 ? (
                <CodeBlockContent
                    content={`${col.content}`}
                    fileName={col.title}
                />
            ) : null}
        </section>
    );
});

const CodeBlockContent = memo(({ content, fileName }: { content: string; fileName?: string }) => {
    const html = useMemo(() => styleRichTextHtml(`<pre class="code-block hljs"><code>${highlightCodeWithHljs(content)}</code></pre>`), [content]);

    return (
        <CodeBlockPanel
            content={content}
            fileName={fileName}
            bodyClassName={POST_CODE_BODY_CLASS}
        >
            <div
                className="code-block-view select-text"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </CodeBlockPanel>
    );
});

const Body = () => {
    const { contents, prev, next, postId, imageUrl, title, summary, createDate, viewCount, likeCount, thumbnailAlt, pushToUrl, setToast, handleCopySentence } = usePostDetailProvider();
    return (
        <section className={POST_CONTENT_WIDTH_CLASS}>
            <div className={POST_BLOCK_LIST_CLASS}>
                {contents?.map((row, rowIdx) => (
                    <section
                        key={rowIdx}
                        className={BLOCK_ROW_CLASS}
                    >
                        {row.map((col) => (
                            <ContentColumn
                                key={col.id}
                                col={col}
                                rowLength={row.length}
                                onCopySentence={handleCopySentence}
                            />
                        ))}
                    </section>
                ))}
            </div>
        </section>
    );
};
export default Body;
CodeBlockContent.displayName = "CodeBlockContent";
ContentColumn.displayName = "ContentColumn";
