import UI from "@/shared/ui/common/UIComponent";

type AsyncErrorStateProps = {
    title?: string;
    message?: string;
    onRetry: () => void;
    className?: string;
};

const AsyncErrorState = ({ title = "데이터를 불러오지 못했습니다", message, onRetry, className }: AsyncErrorStateProps) => (
    <article className={`flex flex-col items-center justify-center gap-[1.6rem] w-full min-h-[50svh] ${className ?? ""}`}>
        <div className="flex flex-col gap-[0.8rem] text-center px-[1.6rem]">
            <p className="text-[2rem] font-bold">{title}</p>
            {message ? <p className="text-[1.6rem] text-[var(--color-text-muted)]">{message}</p> : null}
        </div>
        <UI.Button
            onClick={onRetry}
            className="p-[1.2rem_2.4rem] shadow-[var(--shadow-normal)] bg-[var(--color-orange-500)] text-[var(--color-text-primary)] rounded-[1.2rem] font-bold"
        >
            다시 시도
        </UI.Button>
    </article>
);

export default AsyncErrorState;
