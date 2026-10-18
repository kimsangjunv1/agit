"use client";
import { useCategoryManagerProvider } from "../model/CategoryManagerContext";
import { util } from "@/shared/lib/util";
import UI from "@/shared/ui/common/UIComponent";
import ManagerDetailMetaGrid from "@/widgets/manager/shared/ui/ManagerDetailMetaGrid";
import ManagerDetailPane from "@/widgets/manager/shared/ui/ManagerDetailPane";
import ManagerDetailPaneHeader from "@/widgets/manager/shared/ui/ManagerDetailPaneHeader";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";

const CategoryManagerDetail = () => {
    const { patchCategory, selectedCategory, modifyCategoryModal, deleteCategoryModal } = useCategoryManagerProvider();
    return (
        <ManagerDetailPane>
            {selectedCategory ? (
                <article>
                    <ManagerDetailPaneHeader
                        title={selectedCategory.title}
                        description={selectedCategory.description}
                    />
                    <div className="flex flex-col gap-[2.4rem] p-[2.4rem]">
                        <div className="flex items-center justify-between border-b border-[var(--color-gray-300)] pb-[1.6rem]">
                            <span className="text-[1.2rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Status</span>
                            <UI.Switch
                                states={selectedCategory.is_enabled}
                                onChange={(is_enabled) => patchCategory({ idx: selectedCategory.idx, is_enabled })}
                            />
                        </div>
                        <ManagerDetailMetaGrid
                            items={[
                                { label: "Title", value: selectedCategory.title },
                                {
                                    label: "Created",
                                    value: util.string.getCurrentDate(selectedCategory.created_at, 4),
                                },
                                {
                                    label: "Status",
                                    value: selectedCategory.is_enabled ? "활성" : "비활성",
                                },
                            ]}
                        />
                        <div className="flex gap-[0.8rem]">
                            <UI.Button
                                className="rounded-[0.8rem] border border-[var(--color-gray-300)] px-[1.2rem] py-[0.8rem]"
                                onClick={() => modifyCategoryModal(selectedCategory)}
                            >
                                수정
                            </UI.Button>
                            <UI.Button
                                className="rounded-[0.8rem] border border-[var(--color-red-200)] px-[1.2rem] py-[0.8rem] text-[var(--color-red-600)]"
                                onClick={() => deleteCategoryModal(selectedCategory)}
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
export default CategoryManagerDetail;
