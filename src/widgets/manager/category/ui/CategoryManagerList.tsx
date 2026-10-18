"use client";
import { useCategoryManagerProvider } from "../model/CategoryManagerContext";
import { util } from "@/shared/lib/util";
import UI from "@/shared/ui/common/UIComponent";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";
import ManagerListError from "@/widgets/manager/shared/ui/ManagerListError";
import ManagerListItemCard from "@/widgets/manager/shared/ui/ManagerListItemCard";
import ManagerListPane from "@/widgets/manager/shared/ui/ManagerListPane";
import ManagerListPaneHeader from "@/widgets/manager/shared/ui/ManagerListPaneHeader";
import ManagerListSkeleton from "@/widgets/manager/shared/ui/ManagerListSkeleton";

const StatusBadge = ({ active }: { active: boolean }) => (
    <span
        className={`shrink-0 rounded-full px-[0.8rem] py-[0.4rem] text-[1.2rem] font-semibold ${active ? "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]" : "bg-[var(--color-gray-200)] text-[var(--color-gray-600)]"}`}
    >
        {active ? "활성" : "비활성"}
    </span>
);

const CategoryManagerList = () => {
    const { data, isLoading, isError, error, refetch, selectedItem, setSelectedItem, list, createCategoryModal } = useCategoryManagerProvider();
    return (
        <ManagerListPane>
            <ManagerListPaneHeader
                title="카테고리 관리"
                count={list.length}
                description="게시판에 노출되는 카테고리를 관리합니다."
                action={
                    <UI.Button
                        className="rounded-[0.8rem] bg-[var(--color-brand-500)] px-[1.2rem] py-[0.8rem] text-[1.2rem] font-semibold text-white"
                        onClick={createCategoryModal}
                    >
                        + 생성
                    </UI.Button>
                }
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
                        title="등록된 카테고리가 없습니다"
                    />
                ) : (
                    <section className="flex flex-col gap-[0.8rem]">
                        {list.map((item) => (
                            <ManagerListItemCard
                                key={item.idx}
                                isSelected={selectedItem === String(item.idx)}
                                onClick={() => setSelectedItem(item.idx)}
                            >
                                <div className="flex items-center justify-between gap-[1.2rem]">
                                    <div className="min-w-0">
                                        <p className="truncate text-[1.6rem] font-semibold">{item.title}</p>
                                        <p className="mt-[0.4rem] text-[1.2rem] text-[var(--color-gray-500)]">{util.string.getCurrentDate(item.created_at)}</p>
                                    </div>
                                    <StatusBadge active={item.is_enabled} />
                                </div>
                            </ManagerListItemCard>
                        ))}
                    </section>
                )}
            </div>
        </ManagerListPane>
    );
};
export default CategoryManagerList;
