"use client";
import { NEW_POST_TYPE_ITEM } from "../model/usePostTypeManager";
import { usePostTypeManagerProvider } from "../model/PostTypeManagerContext";
import UI from "@/shared/ui/common/UIComponent";
import ManagerDetailPane from "@/widgets/manager/shared/ui/ManagerDetailPane";
import ManagerDetailPaneHeader from "@/widgets/manager/shared/ui/ManagerDetailPaneHeader";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";
import PostTypeForm from "./PostTypeForm";

const PostTypeManagerDetail = () => {
    const { list, selected, isNew, pending, save, remove } = usePostTypeManagerProvider();
    return (
        <ManagerDetailPane>
            {isNew || selected ? (
                <article>
                    <ManagerDetailPaneHeader title={isNew ? "글 종류 추가" : selected!.title} />
                    <div className="flex flex-col gap-[2.4rem] p-[2.4rem]">
                        <PostTypeForm
                            key={isNew ? NEW_POST_TYPE_ITEM : `${selected!.code}:${selected!.title}:${selected!.sort_no}`}
                            initialValue={isNew ? { code: "", title: "", sort_no: Math.min(9999, Math.max(-1, ...list.map((item) => item.sort_no)) + 1) } : selected!}
                            isNew={isNew}
                            pending={pending}
                            onSave={save}
                        />
                        {!isNew ? (
                            <div className="border-t border-[var(--color-gray-300)] pt-[2rem]">
                                <p className="mb-[1.2rem] text-[1.2rem] text-[var(--color-gray-600)]">일반 글은 기본 종류예요. 게시글이나 임시저장 글에서 사용 중인 종류도 삭제할 수 없어요.</p>
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
    );
};

export default PostTypeManagerDetail;
