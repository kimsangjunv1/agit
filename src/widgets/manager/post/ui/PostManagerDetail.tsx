"use client";
import { usePostManagerProvider } from "../model/PostManagerContext";
import PostThumbnail from "@/shared/ui/common/PostThumbnail";
import { util } from "@/shared/lib/util";
import UI from "@/shared/ui/common/UIComponent";
import ManagerDetailMetaGrid from "@/widgets/manager/shared/ui/ManagerDetailMetaGrid";
import ManagerDetailPane from "@/widgets/manager/shared/ui/ManagerDetailPane";
import ManagerDetailPaneHeader from "@/widgets/manager/shared/ui/ManagerDetailPaneHeader";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";
import { POST_TYPE_OPTIONS, POST_VISIBILITY_OPTIONS } from "@/entities/post/model/postSettings";

const PostManagerDetail = () => {
    const { pushToUrl, selectedPost, deletePostModal } = usePostManagerProvider();
    return (
        <ManagerDetailPane>
            {selectedPost ? (
                <article>
                    <ManagerDetailPaneHeader
                        title={selectedPost.title}
                        description={selectedPost.summary}
                    />
                    <div className="flex flex-col gap-[2.4rem] p-[2.4rem]">
                        <div className="relative min-h-[24rem] overflow-hidden rounded-[0.8rem] bg-[var(--color-gray-100)]">
                            <PostThumbnail
                                readinessKey={`manager-post-detail-thumbnail-${selectedPost.idx}`}
                                seed={selectedPost.idx}
                                src={selectedPost.thumbnail}
                                alt={selectedPost.title}
                                fill
                                sizes="50vw"
                                className="object-cover"
                            />
                        </div>
                        <ManagerDetailMetaGrid
                            items={[
                                { label: "글 종류", value: POST_TYPE_OPTIONS.find((option) => option.value === selectedPost.post_type)?.title ?? "일반 글" },
                                { label: "공개 설정", value: POST_VISIBILITY_OPTIONS.find((option) => option.value === selectedPost.visibility)?.title ?? "전체공개" },
                                {
                                    label: "Category",
                                    value: selectedPost.category?.title ?? "미분류",
                                },
                                { label: "Views", value: selectedPost.views ?? 0 },
                                {
                                    label: "Created",
                                    value: util.string.getCurrentDate(selectedPost.created_at, 4),
                                },
                            ]}
                        />
                        <div className="flex gap-[0.8rem]">
                            <UI.Button
                                className="rounded-[0.8rem] border border-[var(--color-gray-300)] px-[1.2rem] py-[0.8rem]"
                                onClick={() => pushToUrl(`/post/${selectedPost.idx}`)}
                            >
                                보기
                            </UI.Button>
                            <UI.Button
                                className="rounded-[0.8rem] border border-[var(--color-gray-300)] px-[1.2rem] py-[0.8rem]"
                                onClick={() => pushToUrl(`/post/${selectedPost.idx}/modify`)}
                            >
                                수정
                            </UI.Button>
                            <UI.Button
                                className="rounded-[0.8rem] border border-[var(--color-red-200)] px-[1.2rem] py-[0.8rem] text-[var(--color-red-600)]"
                                onClick={() => deletePostModal(selectedPost)}
                            >
                                삭제
                            </UI.Button>
                        </div>
                    </div>
                </article>
            ) : (
                <ManagerEmptyState variant="no-item" />
            )}
        </ManagerDetailPane>
    );
};
export default PostManagerDetail;
