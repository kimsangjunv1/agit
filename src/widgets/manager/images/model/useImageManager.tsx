"use client";
import { useMemo, useState } from "react";
import { useGetPostImageInventoryOnManagerQuery } from "@/entities/post-image/api/postImage.query";
import type { PostImageInventoryItem } from "@/entities/post-image/lib/postImageInventory";
import { formatBytes } from "@/entities/post-image/lib/postImageInventory";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useDeleteUnusedPostImagesWithToast } from "@/widgets/manager/images/model/useImageMutations";
import useManagerSelection from "@/widgets/manager/shared/model/useManagerSelection";

type FilterType = "all" | "used" | "unused";

const EMPTY_ITEMS: PostImageInventoryItem[] = [];

const filterItems = (items: PostImageInventoryItem[], filter: FilterType) => {
    if (filter === "used") return items.filter((item) => item.isUsed);
    if (filter === "unused") return items.filter((item) => !item.isUsed);
    return items;
};

const useImageManager = () => {
    const [filter, setFilter] = useState<FilterType>("all");
    const { setModal } = useModalStore();
    const { data, isLoading, isError, error, refetch } = useGetPostImageInventoryOnManagerQuery();
    const { mutate: optimizeImages, isPending } = useDeleteUnusedPostImagesWithToast();
    const { selectedItem, setSelectedItem } = useManagerSelection();
    const inventory = data?.result;
    const summary = inventory?.summary;
    const items = inventory?.items ?? EMPTY_ITEMS;
    const filteredItems = useMemo(() => filterItems(items, filter), [items, filter]);
    const selectedImage = items.find((item) => item.path === selectedItem);
    const openOptimizeModal = () => {
        if (!summary) return;

        setModal({
            type: "CHECK",
            title: "미사용 이미지를 정리할까요?",
            content: (
                <article className="flex flex-col gap-[1.2rem]">
                    <p className="text-[var(--color-gray-600)]">
                        미사용 이미지 {summary.unusedCount}개 ({formatBytes(summary.unusedSizeBytes)})를 스토리지에서 삭제합니다.
                    </p>
                    <p className="text-[1.2rem] text-[var(--color-gray-500)]">게시물에 연결된 이미지는 삭제되지 않습니다.</p>
                </article>
            ),
            cancel: { text: "취소" },
            confirm: {
                text: "최적화",
                onClick: () => optimizeImages(),
            },
            isOpen: true,
        });
    };
    return {
        filter,
        setFilter,
        setModal,
        data,
        isLoading,
        isError,
        error,
        refetch,
        optimizeImages,
        isPending,
        selectedItem,
        setSelectedItem,
        inventory,
        summary,
        items,
        filteredItems,
        selectedImage,
        openOptimizeModal,
    };
};
export default useImageManager;
