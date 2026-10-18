import UI from "@/shared/ui/common/UIComponent";
import AsyncErrorState from "@/shared/ui/common/AsyncErrorState";

export const FeedLoading = ({ className }: { className?: string }) => (
    <section className={`flex items-center justify-center w-full min-h-[50svh] ${className ?? ""}`}>
        <UI.Loading />
    </section>
);

export const FeedError = ({ message, onRetry }: { message?: string; onRetry: () => void }) => (
    <AsyncErrorState
        title="게시물을 불러오지 못했습니다"
        message={message}
        onRetry={onRetry}
    />
);

export const FeedEmpty = ({ title = "등록된 게시물이 없습니다" }: { title?: string }) => (
    <UI.Empty
        title={title}
        className="min-h-[50svh]"
    />
);
