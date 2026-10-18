"use client";
import { useRef } from "react";
import { useGetCategoryListOnManagerQuery } from "@/entities/category/api/category.query";
import type { CategoryItemManager, PatchCategoryPayload, SetCategoryPayload } from "@/entities/category/model/category.type";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import ModalContent from "@/widgets/manager/shared/ui/ModalContent";
import { useDeleteCategoryWithToast, usePatchCategoryWithToast, useSetCategoryWithToast } from "@/widgets/manager/category/model/useCategoryMutations";
import useManagerSelection from "@/widgets/manager/shared/model/useManagerSelection";

const useCategoryManager = () => {
    const categoryCreateValueRef = useRef<SetCategoryPayload>({
        title: "",
        description: "",
    });
    const categoryPatchValueRef = useRef<PatchCategoryPayload>({
        idx: 0,
        title: "",
        is_enabled: true,
        description: "",
    });
    const { data, isLoading, isError, error, refetch } = useGetCategoryListOnManagerQuery();
    const { mutate: createCategory } = useSetCategoryWithToast();
    const { mutate: patchCategory } = usePatchCategoryWithToast();
    const { mutate: deleteCategory } = useDeleteCategoryWithToast();
    const { setToast } = useToastStore();
    const { setModal } = useModalStore();
    const { selectedItem, setSelectedItem } = useManagerSelection();
    const list = data?.result ?? [];
    const selectedCategory = list.find((item) => String(item.idx) === selectedItem);
    const createCategoryModal = () =>
        setModal({
            type: "CHECK",
            title: "카테고리 생성",
            content: <ModalContent.Post.AddCategory onChange={(value) => (categoryCreateValueRef.current = value)} />,
            cancel: { text: "닫기" },
            confirm: {
                text: "확인",
                onClick: () => {
                    if (!categoryCreateValueRef.current.title || !categoryCreateValueRef.current.description) {
                        setToast({ msg: "카테고리 이름과 설명을 입력해주세요", time: 2 });
                        return false;
                    }
                    createCategory(categoryCreateValueRef.current);
                    categoryCreateValueRef.current = { title: "", description: "" };
                },
            },
            isOpen: true,
        });
    const modifyCategoryModal = (item: CategoryItemManager) =>
        setModal({
            type: "CHECK",
            title: "카테고리 수정",
            content: (
                <ModalContent.Post.ModifyCategory
                    info={item}
                    onChange={(value) => (categoryPatchValueRef.current = value)}
                />
            ),
            cancel: { text: "닫기" },
            confirm: {
                text: "확인",
                onClick: () => {
                    if (!categoryPatchValueRef.current.title || !categoryPatchValueRef.current.description) {
                        setToast({ msg: "카테고리 이름과 설명을 입력해주세요", time: 2 });
                        return false;
                    }
                    patchCategory(categoryPatchValueRef.current);
                },
            },
            isOpen: true,
        });
    const deleteCategoryModal = (item: CategoryItemManager) =>
        setModal({
            type: "CHECK",
            title: "카테고리를 삭제할까요?",
            content: <p className="text-[var(--color-gray-600)]">삭제 대상: {item.title}</p>,
            cancel: { text: "취소" },
            confirm: {
                text: "삭제하기",
                onClick: () => deleteCategory({ idx: item.idx }),
            },
            isOpen: true,
        });
    return {
        categoryCreateValueRef,
        categoryPatchValueRef,
        data,
        isLoading,
        isError,
        error,
        refetch,
        createCategory,
        patchCategory,
        deleteCategory,
        setToast,
        setModal,
        selectedItem,
        setSelectedItem,
        list,
        selectedCategory,
        createCategoryModal,
        modifyCategoryModal,
        deleteCategoryModal,
    };
};
export default useCategoryManager;
