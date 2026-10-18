"use client";
import { usePostManagerProvider } from "../model/PostManagerContext";
import PostThumbnail from "@/shared/ui/common/PostThumbnail";
import { util } from "@/shared/lib/util";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";
import ManagerListError from "@/widgets/manager/shared/ui/ManagerListError";
import ManagerListItemCard from "@/widgets/manager/shared/ui/ManagerListItemCard";
import ManagerListPane from "@/widgets/manager/shared/ui/ManagerListPane";
import ManagerListPaneHeader from "@/widgets/manager/shared/ui/ManagerListPaneHeader";
import ManagerListSkeleton from "@/widgets/manager/shared/ui/ManagerListSkeleton";

const PostManagerList = () => {
    const { data, isLoading, isError, error, refetch, selectedItem, setSelectedItem, list } = usePostManagerProvider();
    return (
        <ManagerListPane>
            <ManagerListPaneHeader
                title="게시물 관리"
                count={list.length}
                description="등록된 게시글을 조회·수정·삭제합니다."
            />
            <div className="p-[1.2rem]">
                {isLoading ? (
                    <ManagerListSkeleton />
                ) : isError || data?.resultCode === "ERROR" ? (
                    <ManagerListError
                        message={isError ? error?.message : data?.resultMessage}
                        onRetry={() => refetch()}
                    />
                ) : list.length === 0 ? (
                    <ManagerEmptyState
                        variant="no-list"
                        title="등록된 게시물이 없습니다"
                    />
                ) : (
                    <section className="flex flex-col gap-[0.8rem]">
                        {list.map((item) => (
                            <ManagerListItemCard
                                key={item.idx}
                                isSelected={selectedItem === String(item.idx)}
                                onClick={() => setSelectedItem(item.idx)}
                            >
                                <div className="flex gap-[1.2rem]">
                                    <div className="relative size-[4.8rem] shrink-0 overflow-hidden rounded-[0.8rem] bg-[var(--color-gray-100)]">
                                        <PostThumbnail
                                            readinessKey={`manager-post-thumbnail-${item.idx}`}
                                            seed={item.idx}
                                            src={item.thumbnail}
                                            alt=""
                                            fill
                                            sizes="48px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-[1.6rem] font-semibold">{item.title}</p>
                                        <p className="mt-[0.4rem] truncate text-[1.2rem] text-[var(--color-gray-500)]">
                                            {item.category?.title ?? "미분류"} · 조회 {item.views ?? 0} · {util.string.getCurrentDate(item.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </ManagerListItemCard>
                        ))}
                    </section>
                )}
            </div>
        </ManagerListPane>
    );
};
export default PostManagerList;
