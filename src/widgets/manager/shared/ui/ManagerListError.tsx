import AsyncErrorState from "@/shared/ui/common/AsyncErrorState";

type ManagerListErrorProps = {
    message?: string;
    onRetry: () => void;
};

const ManagerListError = ({ message, onRetry }: ManagerListErrorProps) => (
    <AsyncErrorState
        title="목록을 불러오지 못했습니다"
        message={message}
        onRetry={onRetry}
        className="min-h-[32rem]"
    />
);

export default ManagerListError;
