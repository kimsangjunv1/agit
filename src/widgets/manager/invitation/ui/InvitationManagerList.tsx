"use client";
import { useInvitationManagerProvider } from "../model/InvitationManagerContext";
import { util } from "@/shared/lib/util";
import UI from "@/shared/ui/common/UIComponent";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";
import ManagerListError from "@/widgets/manager/shared/ui/ManagerListError";
import ManagerListItemCard from "@/widgets/manager/shared/ui/ManagerListItemCard";
import ManagerListPane from "@/widgets/manager/shared/ui/ManagerListPane";
import ManagerListPaneHeader from "@/widgets/manager/shared/ui/ManagerListPaneHeader";
import ManagerListSkeleton from "@/widgets/manager/shared/ui/ManagerListSkeleton";

const InvitationManagerList = () => {
    const { data, isLoading, isError, error, refetch, selectedItem, setSelectedItem, list, createInvitationModal } = useInvitationManagerProvider();
    return (
        <ManagerListPane>
            <ManagerListPaneHeader
                title="초대코드 관리"
                count={list.length}
                description="회원가입 초대코드를 발급·관리합니다."
                action={
                    <UI.Button
                        className="rounded-[0.8rem] bg-[var(--color-brand-500)] px-[1.2rem] py-[0.8rem] text-[1.2rem] font-semibold text-[var(--color-text-primary)]"
                        onClick={createInvitationModal}
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
                        title="등록된 초대코드가 없습니다"
                    />
                ) : (
                    <section className="flex flex-col gap-[0.8rem]">
                        {list.map((item) => (
                            <ManagerListItemCard
                                key={item.id}
                                isSelected={selectedItem === String(item.id)}
                                onClick={() => setSelectedItem(item.id)}
                            >
                                <div className="flex items-center justify-between gap-[1.2rem]">
                                    <div className="min-w-0">
                                        <p className="truncate font-mono text-[1.2rem] font-semibold">{item.code}</p>
                                        <p className="mt-[0.4rem] text-[1.2rem] text-[var(--color-gray-500)]">{item.expire_at ? `만료 ${util.string.getCurrentDate(item.expire_at)}` : "만료 없음"}</p>
                                    </div>
                                    <span
                                        className={`rounded-full px-[0.8rem] py-[0.4rem] text-[1.2rem] font-semibold ${item.is_active ? "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]" : "bg-[var(--color-gray-200)] text-[var(--color-gray-600)]"}`}
                                    >
                                        {item.is_active ? "활성" : "비활성"}
                                    </span>
                                </div>
                            </ManagerListItemCard>
                        ))}
                    </section>
                )}
            </div>
        </ManagerListPane>
    );
};
export default InvitationManagerList;
