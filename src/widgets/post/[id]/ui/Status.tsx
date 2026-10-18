"use client";
import UI from "@/shared/ui/common/UIComponent";
import AsyncErrorState from "@/shared/ui/common/AsyncErrorState";
import { usePostDetailProvider } from "../model/PostDetailContext";
export default function Status() {
    const { isLoading, isError, error, data, refetch } = usePostDetailProvider();
    return isLoading ? (
        <section className="flex items-center justify-center w-full h-[100svh]">
            <UI.Loading />
        </section>
    ) : (
        <AsyncErrorState
            title="게시물을 불러오지 못했습니다"
            message={isError ? error?.message : data?.resultMessage}
            onRetry={() => refetch()}
            className="h-[100svh]"
        />
    );
}
