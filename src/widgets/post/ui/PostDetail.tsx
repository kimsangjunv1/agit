"use client";

import { Fragment, memo, useCallback, useEffect, useMemo, useRef } from "react";

import { Block, GetPostDetailResponse, PostPrevNextInfo, SectionContent } from "@/entities/post/model/post.type";
import { util } from "@/shared/lib/util";
import { highlightCodeWithHljs } from "@/shared/lib/codeHighlight";
import { sanitizeHtml } from "@/shared/lib/sanitizeHtml";
import CodeBlockPanel from "@/shared/ui/common/CodeBlockPanel";

import useNavigate from "@/shared/hooks/useNavigate";
import usePageTransitionReady from "@/shared/hooks/usePageTransitionReady";
import { useGetPostDetailQuery, useIncrementPostViewOnVisit } from "@/entities/post/api/post.query";

import UI from "@/shared/ui/common/UIComponent";
import IconComponent from "@/shared/ui/common/IconComponent";
import { BLOCK_COLUMN_CLASS, BLOCK_ROW_CLASS, POST_TIPTAP_CONTENT_CLASS } from "@/features/managePost/ui/blockEditor/blockEditorStyles";
import PostHero from "@/features/managePost/ui/PostHero";
import PostTocPanel from "@/features/managePost/ui/PostTocPanel";
import PostRichTextContent from "@/widgets/post/ui/PostRichTextContent";
import { isMainBlock } from "@/widgets/post/lib/blockMode";
import { getPostTocAnchorId } from "@/widgets/post/lib/postToc";
import PostThumbnail from "@/shared/ui/common/PostThumbnail";
import GiscusComments from "@/shared/ui/common/GiscusComments";
import AsyncErrorState from "@/shared/ui/common/AsyncErrorState";
import { PostNavigationActions, usePostNavigationActions } from "@/features/managePost";

import { useToastStore } from "@/shared/stores/useToastStore";
import { useCreatePostStore } from "@/shared/stores/useCreatePostStore";
import { usePostReadingSettingsStore } from "@/shared/stores/usePostReadingSettingsStore";
import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";
import { useScrollProgressBar } from "@/shared/hooks/useScrollProgress";

type PostDetailProps = {
    id: string;
    initialData: GetPostDetailResponse;
};

const PostDetail = ({ id, initialData }: PostDetailProps) => {
    const { setPostIdx } = useCreatePostStore();
    const postIdx = parseInt(id);

    useIncrementPostViewOnVisit(postIdx);

    useEffect(() => {
        setPostIdx(postIdx);
    }, [postIdx, setPostIdx]);

    return (
        <section className="flex flex-col w-full post">
            <section className="mx-auto post-inner flex flex-col w-full items-center">
                <RenderContents
                    id={id}
                    initialData={initialData}
                />
            </section>
        </section>
    );
};

const RenderContents = ({ id, initialData }: { id: string; initialData: GetPostDetailResponse }) => {
    const postIdx = parseInt(id);
    const { data: getPostListData, isLoading, isError, error, refetch } = useGetPostDetailQuery(postIdx, initialData);

    const hasContent = Boolean(getPostListData?.result?.title);
    const isDataReady = hasContent || isError || getPostListData?.resultCode === "ERROR";

    usePageTransitionReady("post-detail-data", isDataReady);

    if (isLoading && !hasContent) {
        return (
            <section className="flex items-center justify-center w-full h-[100svh]">
                <UI.Loading />
            </section>
        );
    }

    if (isError) {
        return (
            <AsyncErrorState
                title="게시물을 불러오지 못했습니다"
                message={error?.message}
                onRetry={() => refetch()}
                className="h-[100svh]"
            />
        );
    }

    if (getPostListData?.resultCode === "ERROR") {
        return (
            <AsyncErrorState
                title="게시물을 불러오지 못했습니다"
                message={getPostListData.resultMessage}
                onRetry={() => refetch()}
                className="h-[100svh]"
            />
        );
    }

    const DATA = getPostListData?.result;

    return (
        <>
            <Contents
                contents={DATA?.contents ?? []}
                prev={DATA?.prev}
                next={DATA?.next}
                postId={id}
                imageUrl={DATA?.thumbnail ?? ""}
                title={DATA?.title ?? ""}
                summary={DATA?.summary ?? ""}
                createDate={DATA?.created_at ?? ""}
                viewCount={DATA?.views ?? 0}
                likeCount={DATA?.likes ?? 0}
                thumbnailAlt={DATA?.title ?? ""}
            />

            <PostTocPanel contents={DATA?.contents ?? []} />
        </>
    );
};

const CodeBlockContent = memo(({ content, fileName }: { content: string; fileName?: string }) => {
    const html = useMemo(() => sanitizeHtml(`<pre class="code-block hljs"><code>${highlightCodeWithHljs(content)}</code></pre>`), [content]);

    return (
        <CodeBlockPanel
            content={content}
            fileName={fileName}
            bodyClassName="p-0 px-[1.6rem] py-[1.4rem]"
        >
            <div
                className="code-block-view select-text"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </CodeBlockPanel>
    );
});
CodeBlockContent.displayName = "CodeBlockContent";

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
            className={`${columnClassName} ${col.type === 0 ? "scroll-mt-[12rem]" : ""}`}
        >
            {col.type === 0 ? (
                <Fragment>
                    {showHeading ? (
                        <section className="flex flex-col gap-[0.8rem]">
                            {subtitle ? <p className="mobile:text-[1.6rem] pc:text-[2.0rem] leading-[1.5] font-semibold">{subtitle}</p> : null}
                            {title ? <h5 className="mobile:text-[2.4rem] pc:text-[2.8rem] leading-[1.5] font-bold">{title}</h5> : null}
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
                                        className="whitespace-break-spaces transition-colors border border-transparent cursor-pointer hover:bg-black hover:text-white rounded-[0.8rem]"
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
                    className="w-full rounded-[2.4rem] shadow-[var(--shadow-normal)]"
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
ContentColumn.displayName = "ContentColumn";

const PostDetailActions = ({ postIdx }: { postIdx: number }) => {
    const { pushToUrl } = useNavigate();
    const progressBarRef = useRef<HTMLDivElement>(null);
    useScrollProgressBar(progressBarRef);
    const { alreadyLiked, likeCount, navVisibility, hasNavActions, isDeletePending, handleNavAction } = usePostNavigationActions({
        postIdx,
        isView: true,
        isCreate: false,
        isEdit: false,
        pushToUrl,
    });

    if (!hasNavActions) {
        return null;
    }

    return (
        // <section className="sticky bottom-0 flex h-[5.2rem] w-full flex-wrap justify-center bg-black">
        <section className="sticky bottom-0 flex mobile:h-[5.2rem] pc:h-[7.2rem] w-full flex-wrap justify-center bg-black">
            <div className="mx-auto flex w-full max-w-[var(--size-tablet)]">
                <PostNavigationActions
                    {...navVisibility}
                    likeCount={likeCount}
                    alreadyLiked={alreadyLiked}
                    isDeletePending={isDeletePending}
                    onAction={handleNavAction}
                />
            </div>

            {/* <div className="absolute top-[calc((0.8rem/2)*-1)] left-0 w-full h-[0.8rem]"> */}
            <div className="absolute top-[calc((0.8rem/1)*-1)] left-0 w-full h-[0.8rem]">
                <div
                    ref={progressBarRef}
                    className="h-full w-0 will-change-[width]"
                />
            </div>
        </section>
    );
};

type ContentsProps = {
    contents: SectionContent[][];
    prev?: PostPrevNextInfo;
    next?: PostPrevNextInfo;
    postId: string;
    imageUrl: string;
    title: string;
    summary: string;
    createDate: string;
    viewCount: number;
    likeCount: number;
    thumbnailAlt: string;
};

const Contents = ({ contents, prev, next, postId, imageUrl, title, summary, createDate, viewCount, likeCount, thumbnailAlt }: ContentsProps) => {
    const { pushToUrl } = useNavigate();
    const { setToast } = useToastStore();
    const { fontScale, lineHeight, hydrate } = usePostReadingSettingsStore();

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    const handleCopySentence = useCallback(
        (text: string) => {
            util.dom.setCopyOnClipboard(text);
            setToast({ msg: "선택하신 문장을 복사했어요", time: 2 });
        },
        [setToast],
    );

    return (
        <>
            <section className="flex flex-col justify-center items-center gap-[3.2rem] h-[100svh] w-full fixed top-0 left-0">
                <PostHero
                    mode="view"
                    imageUrl={imageUrl}
                    placeholderSeed={postId}
                    title={title}
                    summary={summary}
                    createDate={createDate}
                    viewCount={viewCount}
                    likeCount={likeCount}
                    thumbnailAlt={thumbnailAlt}
                />
            </section>

            {/* <article className="flex gap-[0.4rem] w-full max-w-[var(--size-tablet)] min-w-0 px-[1.2rem] [content-visibility:auto]"> */}
            <article
                className="post-reading-root z-[100] mt-[100svh] pt-[10.0rem] flex w-full gap-[0.4rem] bg-white"
                style={{
                    ["--post-read-scale" as string]: fontScale,
                    ["--post-read-line-height" as string]: lineHeight,
                }}
            >
                <section className="flex flex-col flex-1 min-w-0">
                    <section className="w-full max-w-[var(--size-tablet)] mx-auto">
                        <div className="mx-[1.6rem_6.2rem] flex flex-col mobile:gap-[5.2rem] pc:gap-[2.4rem]">
                            {contents?.map((row, rowIdx) => (
                                <section key={rowIdx} className={BLOCK_ROW_CLASS}>
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

                    <GiscusComments
                        term={`post-${postId}`}
                        className="max-w-[var(--size-tablet)] w-full mx-auto my-[5.2rem] px-[2.0rem]"
                    />

                    <section className="max-w-[2560px] w-full mx-auto">
                        <p className="max-w-[var(--size-tablet)] mx-auto px-[2.0rem] text-[2.4rem] font-bold my-[9.8rem_4.2rem]">OTHER CONTENTS</p>

                        <section className="flex mobile:flex-col tablet:flex-row flex-wrap">
                            <UI.Button
                                className={`hover:brightness-50 flex-1 flex items-center justify-start gap-[0.8rem]  ${prev ? "" : "pointer-events-none"}`}
                                onClick={() => {
                                    if (prev) {
                                        pushToUrl(`/post/${prev?.idx}`);
                                    } else {
                                        setToast({ msg: "이전 글이 없어요", time: 2 });
                                    }
                                }}
                            >
                                {prev ? (
                                    <div className="relative h-[50svh] w-full shrink-0 overflow-hidden">
                                        <PostThumbnail
                                            readinessKey={`post-prev-thumbnail-${prev.idx}`}
                                            seed={prev.idx}
                                            src={prev.thumbnail}
                                            alt={prev.title}
                                            fill
                                            className="object-cover sacle-[1] hover:scale-[1.1] transition-transform"
                                        />

                                        <div className="absolute left-[1.6rem] top-[50%] transform translate-y-[-50%] flex min-w-0 w-[calc(100%-(1.6rem*2))] leading-[1.5] flex-col items-start">
                                            <p className="bg-black text-[#ff4321] text-left text-[2.0rem] font-semibold p-[0.6rem_0.8rem]">PREV</p>
                                            <p className="bg-black text-white text-left mobile:text-[2.4rem] pc:text-[3.2rem] font-semibold p-[0.6rem_0.8rem] leading-[1.5] line-clamp-2">
                                                {prev.title}
                                            </p>
                                            <MaterialIcon
                                                name={"arrow_back"}
                                                size={24}
                                                className="bg-black  text-white p-[0.6rem_0.8rem]"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative h-[50svh] w-full shrink-0 overflow-hidden bg-black">
                                        <div className="absolute left-[1.6rem] top-[50%] transform translate-y-[-50%] flex min-w-0 w-[calc(100%-(1.6rem*2))] leading-[1.5] flex-col items-start">
                                            <p className="bg-black text-[#ff4321] text-left text-[2.0rem] font-semibold p-[0.6rem_0.8rem]">PREV</p>
                                            <p className="bg-black text-white text-left mobile:text-[2.4rem] pc:text-[3.2rem] font-semibold p-[0.6rem_0.8rem] leading-[1.5] line-clamp-2">
                                                이전글이 없어요
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </UI.Button>

                            <UI.Button
                                className={`hover:brightness-50 flex-1 flex items-center justify-end gap-[0.8rem]  ${next ? "" : "pointer-events-none"}`}
                                onClick={() => {
                                    if (next) {
                                        pushToUrl(`/post/${next?.idx}`);
                                    } else {
                                        setToast({ msg: "다음 글이 없어요", time: 2 });
                                    }
                                }}
                            >
                                {next ? (
                                    <Fragment>
                                        <div className="relative h-[50svh] w-full shrink-0 overflow-hidden">
                                            <PostThumbnail
                                                readinessKey={`post-next-thumbnail-${next.idx}`}
                                                seed={next.idx}
                                                src={next.thumbnail}
                                                alt={next.title}
                                                fill
                                                className="object-cover sacle-[1] hover:scale-[1.1] transition-transform"
                                            />

                                            <div className="absolute right-[1.6rem] top-[50%] transform translate-y-[-50%] flex min-w-0 w-[calc(100%-(1.6rem*2))] leading-[1.5] flex-col items-end">
                                                <p className="bg-black text-[#ff4321] text-right text-[2.0rem] font-semibold p-[0.6rem_0.8rem]">NEXT</p>
                                                <p className="bg-black text-white text-right mobile:text-[2.4rem] pc:text-[3.2rem] font-semibold p-[0.6rem_0.8rem] leading-[1.5] line-clamp-2">
                                                    {next.title}
                                                </p>
                                                <MaterialIcon
                                                    name={"arrow_back"}
                                                    size={18}
                                                    className="bg-black text-white p-[0.6rem_0.8rem] rotate-180"
                                                />
                                            </div>
                                        </div>
                                    </Fragment>
                                ) : (
                                    <div className="relative h-[50svh] w-full shrink-0 overflow-hidden bg-black">
                                        <div className="absolute right-[1.6rem] top-[50%] transform translate-y-[-50%] flex min-w-0 w-[calc(100%-(1.6rem*2))] leading-[1.5] flex-col">
                                            <p className="bg-black text-[#ff4321] text-right text-[2.0rem] font-semibold p-[0.6rem_0.8rem]">NEXT</p>
                                            <p className="bg-black text-white text-right mobile:text-[2.4rem] pc:text-[3.2rem] font-semibold p-[0.6rem_0.8rem] leading-[1.5] line-clamp-2">
                                                다음글이 없어요
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </UI.Button>
                        </section>
                    </section>

                    <PostDetailActions postIdx={parseInt(postId)} />
                </section>
            </article>
        </>
    );
};

export default PostDetail;
