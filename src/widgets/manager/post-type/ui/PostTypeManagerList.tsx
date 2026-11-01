"use client";
import { usePostTypeManagerProvider } from "../model/PostTypeManagerContext";
import UI from "@/shared/ui/common/UIComponent";
import ManagerListError from "@/widgets/manager/shared/ui/ManagerListError";
import ManagerListItemCard from "@/widgets/manager/shared/ui/ManagerListItemCard";
import ManagerListPane from "@/widgets/manager/shared/ui/ManagerListPane";
import ManagerListPaneHeader from "@/widgets/manager/shared/ui/ManagerListPaneHeader";
import ManagerListSkeleton from "@/widgets/manager/shared/ui/ManagerListSkeleton";

const PostTypeManagerList = () => {
    const { isLoading, isError, error, refetch, list, selectedItem, setSelectedItem, startCreate } = usePostTypeManagerProvider();
    return (
        <ManagerListPane>
            <ManagerListPaneHeader
                title="글 종류 관리"
                count={list.length}
                description="메인 메뉴와 작성 화면에 표시되는 글 종류를 관리합니다."
                action={
                    <UI.Button
                        onClick={startCreate}
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
                                <p className="mt-[0.4rem] text-[1.2rem] text-[var(--color-gray-600)]">
                                    {item.code} · 순서 {item.sort_no}
                                </p>
                            </ManagerListItemCard>
                        ))}
                    </section>
                )}
            </div>
        </ManagerListPane>
    );
};

export default PostTypeManagerList;
