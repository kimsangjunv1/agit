"use client";
import { useUserManagerProvider } from "../model/UserManagerContext";
import { util } from "@/shared/lib/util";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";
import ManagerListError from "@/widgets/manager/shared/ui/ManagerListError";
import ManagerListItemCard from "@/widgets/manager/shared/ui/ManagerListItemCard";
import ManagerListPane from "@/widgets/manager/shared/ui/ManagerListPane";
import ManagerListPaneHeader from "@/widgets/manager/shared/ui/ManagerListPaneHeader";
import ManagerListSkeleton from "@/widgets/manager/shared/ui/ManagerListSkeleton";

const UserManagerList = () => {
    const { data, isLoading, isError, error, refetch, selectedItem, setSelectedItem, list } = useUserManagerProvider();
    return (
        <ManagerListPane>
            <ManagerListPaneHeader
                title="유저 관리"
                count={list.length}
                description="가입된 회원 목록을 조회합니다."
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
                        title="등록된 회원이 없습니다"
                    />
                ) : (
                    <section className="flex flex-col gap-[0.8rem]">
                        {list.map((item) => (
                            <ManagerListItemCard
                                key={item.id}
                                isSelected={selectedItem === item.id}
                                onClick={() => setSelectedItem(item.id)}
                            >
                                <p className="truncate text-[1.6rem] font-semibold">{item.name}</p>
                                <p className="mt-[0.4rem] truncate text-[1.2rem] text-[var(--color-gray-600)]">{item.email}</p>
                                <p className="mt-[0.4rem] text-[1.2rem] text-[var(--color-gray-500)]">가입 {util.string.getCurrentDate(item.created_at)}</p>
                            </ManagerListItemCard>
                        ))}
                    </section>
                )}
            </div>
        </ManagerListPane>
    );
};
export default UserManagerList;
