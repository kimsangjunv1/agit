"use client";
import { useImageManagerProvider } from "../model/ImageManagerContext";
import { formatBytes } from "@/entities/post-image/lib/postImageInventory";
import UI from "@/shared/ui/common/UIComponent";
import ImageListItem from "@/widgets/manager/images/ui/ImageListItem";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";
import ManagerListPane from "@/widgets/manager/shared/ui/ManagerListPane";
import ManagerListError from "@/widgets/manager/shared/ui/ManagerListError";
import ManagerListSkeleton from "@/widgets/manager/shared/ui/ManagerListSkeleton";
import ManagerListPaneHeader from "@/widgets/manager/shared/ui/ManagerListPaneHeader";

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "used", label: "사용중" },
    { value: "unused", label: "미사용" },
];

function SummaryCard({ label, count, size }: { label: string; count: number; size: number }) {
    return (
        <article className="border-l-2 border-[var(--color-gray-300)] pl-[0.8rem]">
            <p className="text-[1.2rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-gray-500)]">{label}</p>
            <p className="mt-[0.4rem] text-[1.6rem] font-bold text-[var(--color-gray-900)]">{count}개</p>
            <p className="mt-[0.4rem] text-[1.2rem] text-[var(--color-gray-500)]">{formatBytes(size)}</p>
        </article>
    );
}

type FilterType = "all" | "used" | "unused";

const ImageManagerList = () => {
    const { filter, setFilter, data, isLoading, isError, error, refetch, isPending, selectedItem, setSelectedItem, summary, items, filteredItems, openOptimizeModal } = useImageManagerProvider();
    return (
        <ManagerListPane>
            <ManagerListPaneHeader
                title="이미지 관리"
                count={filteredItems.length}
                description="게시물 이미지의 사용 현황과 용량을 확인합니다."
                action={
                    <UI.Button
                        type="button"
                        disabled={!summary || summary.unusedCount === 0 || isPending}
                        onClick={openOptimizeModal}
                        className="shrink-0 rounded-[0.8rem] bg-[var(--color-brand-500)] px-[1.2rem] py-[0.8rem] text-[1.2rem] font-semibold text-[var(--color-text-primary)] disabled:opacity-50"
                    >
                        {isPending ? "정리 중..." : "최적화"}
                    </UI.Button>
                }
                filter={
                    <div className="flex flex-col gap-[1.2rem]">
                        {summary && (
                            <section className="grid grid-cols-3 gap-[0.8rem]">
                                <SummaryCard
                                    label="전체"
                                    count={summary.totalCount}
                                    size={summary.totalSizeBytes}
                                />
                                <SummaryCard
                                    label="사용중"
                                    count={summary.usedCount}
                                    size={summary.usedSizeBytes}
                                />
                                <SummaryCard
                                    label="미사용"
                                    count={summary.unusedCount}
                                    size={summary.unusedSizeBytes}
                                />
                            </section>
                        )}
                        <div className="flex gap-[0.8rem]">
                            {FILTER_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFilter(option.value)}
                                    className={`rounded-full px-[1.2rem] py-[0.4rem] text-[1.2rem] font-semibold transition-colors ${
                                        filter === option.value ? "bg-[var(--color-surface-floating)] text-[var(--color-text-primary)]" : "border border-[var(--color-gray-300)] bg-[var(--color-surface)] text-[var(--color-gray-600)]"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                }
            />

            <div className="p-[1.2rem]">
                {isLoading ? (
                    <ManagerListSkeleton count={5} />
                ) : isError || data?.resultCode === "ERROR" ? (
                    <ManagerListError
                        message={isError ? error?.message : data?.resultMessage}
                        onRetry={() => refetch()}
                    />
                ) : !summary ? (
                    <ManagerEmptyState
                        variant="no-list"
                        title="이미지 정보를 불러오지 못했습니다"
                        description="잠시 후 다시 시도해주세요."
                    />
                ) : filteredItems.length === 0 ? (
                    <ManagerEmptyState
                        variant="no-list"
                        title={items.length === 0 ? "업로드된 이미지가 없습니다" : "표시할 이미지가 없습니다"}
                    />
                ) : (
                    <section className="flex flex-col gap-[0.8rem]">
                        {filteredItems.map((item) => (
                            <ImageListItem
                                key={item.path}
                                item={item}
                                isSelected={selectedItem === item.path}
                                onClick={() => setSelectedItem(item.path)}
                            />
                        ))}
                    </section>
                )}
            </div>
        </ManagerListPane>
    );
};
export default ImageManagerList;
