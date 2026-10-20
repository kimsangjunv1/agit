"use client";

import { useDeletePostTypeMutation, useGetPostTypesQuery, useSavePostTypeMutation } from "@/entities/postType/api/postType.query";
import type { PostTypePayload } from "@/entities/postType/model/postType.type";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import UI from "@/shared/ui/common/UIComponent";
import useManagerSelection from "@/widgets/manager/shared/model/useManagerSelection";
import ManagerDetailPane from "@/widgets/manager/shared/ui/ManagerDetailPane";
import ManagerDetailPaneHeader from "@/widgets/manager/shared/ui/ManagerDetailPaneHeader";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";
import ManagerListError from "@/widgets/manager/shared/ui/ManagerListError";
import ManagerListItemCard from "@/widgets/manager/shared/ui/ManagerListItemCard";
import ManagerListPane from "@/widgets/manager/shared/ui/ManagerListPane";
import ManagerListPaneHeader from "@/widgets/manager/shared/ui/ManagerListPaneHeader";
import ManagerListSkeleton from "@/widgets/manager/shared/ui/ManagerListSkeleton";
import PostTypeForm from "./ui/PostTypeForm";

const NEW_ITEM = "__new__";

export default function PostTypeManagerPanel() {
    const { data, isLoading, isError, error, refetch } = useGetPostTypesQuery();
    const saveMutation = useSavePostTypeMutation();
    const deleteMutation = useDeletePostTypeMutation();
    const { selectedItem, setSelectedItem } = useManagerSelection();
    const setToast = useToastStore((state) => state.setToast);
    const setModal = useModalStore((state) => state.setModal);
    const list = data?.result ?? [];
    const selected = list.find((item) => item.code === selectedItem);
    const isNew = selectedItem === NEW_ITEM;
    const pending = saveMutation.isPending || deleteMutation.isPending;

    const save = async (payload: PostTypePayload) => {
        try {
            await saveMutation.mutateAsync({ payload, isNew });
            setSelectedItem(payload.code);
            setToast({ msg: isNew ? "글 종류를 추가했어요" : "글 종류를 수정했어요", type: "success" });
        } catch (cause) {
            setToast({ msg: cause instanceof Error ? cause.message : "저장하지 못했어요", type: "fail" });
        }
    };

    const remove = () => {
        if (!selected) return;
        setModal({
            type: "CHECK",
            title: "글 종류를 삭제할까요?",
            content: <p>삭제 대상: {selected.title}</p>,
            cancel: { text: "취소" },
            confirm: {
                text: "삭제",
                onClick: async () => {
                    try {
                        await deleteMutation.mutateAsync(selected.code);
                        setSelectedItem(null);
                        setToast({ msg: "글 종류를 삭제했어요", type: "success" });
                    } catch (cause) {
                        setToast({ msg: cause instanceof Error ? cause.message : "삭제하지 못했어요", type: "fail" });
                        return false;
                    }
                },
            },
            isOpen: true,
        });
    };

    return (
        <>
            <ManagerListPane>
                <ManagerListPaneHeader
                    title="글 종류 관리"
                    count={list.length}
                    description="메인 메뉴와 작성 화면에 표시되는 글 종류를 관리합니다."
                    action={
                        <UI.Button
                            onClick={() => setSelectedItem(NEW_ITEM)}
                            className="rounded-[0.8rem] bg-[var(--color-brand-500)] px-[1.2rem] py-[0.8rem] text-[1.2rem] font-semibold"
                        >
                            + 추가
                        </UI.Button>
                    }
                />
                <div className="p-[1.2rem]">
                    {isLoading ? (
                        <ManagerListSkeleton />
                    ) : isError ? (
                        <ManagerListError
                            message={error?.message}
                            onRetry={() => refetch()}
                        />
                    ) : (
                        <section className="flex flex-col gap-[0.8rem]">
                            {list.map((item) => (
                                <ManagerListItemCard
                                    key={item.code}
                                    isSelected={selectedItem === item.code}
                                    onClick={() => setSelectedItem(item.code)}
                                >
                                    <p className="text-[1.6rem] font-semibold">{item.title}</p>
                                    <p className="mt-[0.4rem] text-[1.2rem] text-[var(--color-text-muted)]">
                                        {item.code} · 순서 {item.sort_no}
                                    </p>
                                </ManagerListItemCard>
                            ))}
                        </section>
                    )}
                </div>
            </ManagerListPane>
            <ManagerDetailPane>
                {isNew || selected ? (
                    <article>
                        <ManagerDetailPaneHeader title={isNew ? "글 종류 추가" : selected!.title} />
                        <div className="flex flex-col gap-[2.4rem] p-[2.4rem]">
                            <PostTypeForm
                                key={isNew ? NEW_ITEM : `${selected!.code}:${selected!.title}:${selected!.sort_no}`}
                                initialValue={isNew ? { code: "", title: "", sort_no: Math.min(9999, Math.max(-1, ...list.map((item) => item.sort_no)) + 1) } : selected!}
                                isNew={isNew}
                                pending={pending}
                                onSave={save}
                            />
                            {!isNew ? (
                                <div className="border-t border-[var(--color-border)] pt-[2rem]">
                                    <p className="mb-[1.2rem] text-[1.2rem] text-[var(--color-text-muted)]">일반 글은 기본 종류예요. 게시글이나 임시저장 글에서 사용 중인 종류도 삭제할 수 없어요.</p>
                                    <UI.Button
                                        disabled={pending || selected?.code === "article"}
                                        onClick={remove}
                                        className="rounded-[0.8rem] border border-[var(--color-red-200)] px-[1.2rem] py-[0.8rem] text-[var(--color-red-600)] disabled:opacity-40"
                                    >
                                        삭제
                                    </UI.Button>
                                </div>
                            ) : null}
                        </div>
                    </article>
                ) : (
                    <ManagerEmptyState variant="no-item" />
                )}
            </ManagerDetailPane>
        </>
    );
}
