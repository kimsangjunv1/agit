"use client";
import { usePostDetailProvider } from "../model/PostDetailContext";
import { Fragment } from "react";
import UI from "@/shared/ui/common/UIComponent";
import PostThumbnail from "@/shared/ui/common/PostThumbnail";
import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";

const RelatedPosts = () => {
    const { contents, prev, next, postId, imageUrl, title, summary, createDate, viewCount, likeCount, thumbnailAlt, pushToUrl, setToast, handleCopySentence } = usePostDetailProvider();
    return (
        <section className="max-w-[2560px] w-full mx-auto">
            <p className="max-w-[var(--size-tablet)] mx-auto px-[2rem] text-[2.4rem] font-bold my-[10rem_4.4rem]">OTHER CONTENTS</p>

            <section className="flex mobile:flex-col tablet:flex-row flex-wrap">
                <UI.Button
                    className={`flex-1 flex items-center justify-start gap-[0.8rem]  ${prev ? "" : "pointer-events-none"}`}
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
                                <p className="bg-[var(--color-surface-floating)] text-[#ff4321] text-left text-[2rem] font-semibold p-[0.8rem_0.8rem]">PREV</p>
                                <p className="bg-[var(--color-surface-floating)] text-inherit text-left mobile:text-[2.4rem] pc:text-[3.2rem] font-semibold p-[0.8rem_0.8rem] leading-[1.5] line-clamp-2">{prev.title}</p>
                                <MaterialIcon
                                    name={"arrow_back"}
                                    size={24}
                                    className="bg-[var(--color-surface-floating)] text-inherit p-[0.8rem_0.8rem]"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="relative h-[50svh] w-full shrink-0 overflow-hidden bg-[var(--color-surface-floating)]">
                            <div className="absolute left-[1.6rem] top-[50%] transform translate-y-[-50%] flex min-w-0 w-[calc(100%-(1.6rem*2))] leading-[1.5] flex-col items-start">
                                <p className="bg-[var(--color-surface-floating)] text-[#ff4321] text-left text-[2rem] font-semibold p-[0.8rem_0.8rem]">PREV</p>
                                <p className="bg-[var(--color-surface-floating)] text-[var(--color-text-primary)] text-left mobile:text-[2.4rem] pc:text-[3.2rem] font-semibold p-[0.8rem_0.8rem] leading-[1.5] line-clamp-2">이전글이 없어요</p>
                            </div>
                        </div>
                    )}
                </UI.Button>

                <UI.Button
                    className={`flex-1 flex items-center justify-end gap-[0.8rem]  ${next ? "" : "pointer-events-none"}`}
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
                                    <p className="bg-[var(--color-surface-floating)] text-[#ff4321] text-right text-[2rem] font-semibold p-[0.8rem_0.8rem]">NEXT</p>
                                    <p className="bg-[var(--color-surface-floating)] text-inherit text-right mobile:text-[2.4rem] pc:text-[3.2rem] font-semibold p-[0.8rem_0.8rem] leading-[1.5] line-clamp-2">{next.title}</p>
                                    <MaterialIcon
                                        name={"arrow_back"}
                                        size={20}
                                        className="bg-[var(--color-surface-floating)] text-[var(--color-text-primary)] p-[0.8rem_0.8rem] rotate-180"
                                    />
                                </div>
                            </div>
                        </Fragment>
                    ) : (
                        <div className="relative h-[50svh] w-full shrink-0 overflow-hidden bg-[var(--color-surface-floating)]">
                            <div className="absolute right-[1.6rem] top-[50%] transform translate-y-[-50%] flex min-w-0 w-[calc(100%-(1.6rem*2))] leading-[1.5] flex-col">
                                <p className="bg-[var(--color-surface-floating)] text-[#ff4321] text-right text-[2rem] font-semibold p-[0.8rem_0.8rem]">NEXT</p>
                                <p className="bg-[var(--color-surface-floating)] text-[var(--color-text-primary)] text-right mobile:text-[2.4rem] pc:text-[3.2rem] font-semibold p-[0.8rem_0.8rem] leading-[1.5] line-clamp-2">다음글이 없어요</p>
                            </div>
                        </div>
                    )}
                </UI.Button>
            </section>
        </section>
    );
};
export default RelatedPosts;
