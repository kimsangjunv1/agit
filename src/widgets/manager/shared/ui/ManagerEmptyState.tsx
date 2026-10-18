import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";

type ManagerEmptyStateVariant = "no-menu" | "no-item" | "no-list";

type ManagerEmptyStateProps = {
    variant: ManagerEmptyStateVariant;
    title?: string;
    description?: string;
};

const EMPTY_STATE_CONTENT: Record<ManagerEmptyStateVariant, { title: string; description: string; icon: string }> = {
    "no-menu": {
        title: "관리 메뉴를 선택해주세요",
        description: "왼쪽에서 운영할 메뉴를 고르면 항목 목록이 이곳에 표시됩니다.",
        icon: "view_sidebar",
    },
    "no-item": {
        title: "항목을 선택해주세요",
        description: "목록에서 항목을 클릭하면 상세정보를 확인할 수 있습니다.",
        icon: "touch_app",
    },
    "no-list": {
        title: "등록된 항목이 없습니다",
        description: "새 항목을 생성하면 이곳에 표시됩니다.",
        icon: "inbox",
    },
};

const ManagerEmptyState = ({ variant, title, description }: ManagerEmptyStateProps) => {
    const content = EMPTY_STATE_CONTENT[variant];

    return (
        <div className="flex h-full min-h-[32rem] flex-col items-center justify-center px-[3.2rem] text-center">
            <span className="mb-[1.6rem] flex size-[4.8rem] items-center justify-center rounded-full border border-[var(--color-gray-300)] bg-white text-[var(--color-gray-500)]">
                <MaterialIcon
                    name={content.icon}
                    size={24}
                />
            </span>
            <p className="text-[1.2rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Empty State</p>
            <h2 className="mt-[0.8rem] text-[2rem] font-bold text-[var(--color-gray-900)]">{title ?? content.title}</h2>
            <p className="mt-[0.8rem] max-w-[32rem] text-[1.2rem] leading-[1.7] text-[var(--color-gray-500)]">{description ?? content.description}</p>
        </div>
    );
};

export default ManagerEmptyState;
