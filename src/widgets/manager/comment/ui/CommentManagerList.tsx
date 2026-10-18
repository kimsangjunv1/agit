"use client";
import { useCommentManagerProvider } from "../model/CommentManagerContext";
import { util } from "@/shared/lib/util";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";
import ManagerListError from "@/widgets/manager/shared/ui/ManagerListError";
import ManagerListItemCard from "@/widgets/manager/shared/ui/ManagerListItemCard";
import ManagerListPane from "@/widgets/manager/shared/ui/ManagerListPane";
import ManagerListPaneHeader from "@/widgets/manager/shared/ui/ManagerListPaneHeader";
import ManagerListSkeleton from "@/widgets/manager/shared/ui/ManagerListSkeleton";

const CommentManagerList = () => {
    const { data, isLoading, isError, error, refetch, selectedItem, setSelectedItem, list } = useCommentManagerProvider();
    return (
        <ManagerListPane>
            <ManagerListPaneHeader
                title="댓글 관리"
                count={list.length}
                description="등록된 댓글을 조회·삭제합니다."
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
                        title="등록된 댓글이 없습니다"
                    />
                ) : (
                    <section className="flex flex-col gap-[0.8rem]">
                        {list.map((item) => (
                            <ManagerListItemCard
                                key={item.idx}
                                isSelected={selectedItem === String(item.idx)}
                                onClick={() => setSelectedItem(item.idx)}
                            >
                                <div className="flex items-center gap-[0.8rem]">
                                    <p className="text-[1.2rem] font-semibold">{item.author}</p>
                                    {item.is_admin && <span className="rounded-full bg-[var(--color-brand-100)] px-[0.8rem] py-[0.4rem] text-[1.2rem] text-[var(--color-brand-700)]">관리자</span>}
                                </div>
                                <p className="mt-[0.8rem] truncate text-[1.2rem] text-[var(--color-gray-700)]">{item.msg}</p>
                                <p className="mt-[0.4rem] truncate text-[1.2rem] text-[var(--color-gray-500)]">
                                    {item.posts?.title ?? "연결 게시물"} · {util.string.getCurrentDate(item.created_at)}
                                </p>
                            </ManagerListItemCard>
                        ))}
                    </section>
                )}
            </div>
        </ManagerListPane>
    );
};
export default CommentManagerList;
