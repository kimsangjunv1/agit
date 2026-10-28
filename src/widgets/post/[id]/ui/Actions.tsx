"use client";
import { usePostDetailProvider } from "../model/PostDetailContext";
import useNavigate from "@/shared/hooks/useNavigate";
import { PostNavigationActions, usePostNavigationActions } from "@/features/managePost";

const Actions = () => {
    const { postIdx } = usePostDetailProvider();
    const { pushToUrl } = useNavigate();

    const { navVisibility, hasNavActions, isDeletePending, handleNavAction } = usePostNavigationActions({
        postIdx,
        isView: true,
        isCreate: false,
        isEdit: false,
        pushToUrl,
    });

    if (!hasNavActions) {
        return null;
    }

    return (
        <nav
            aria-label="포스트 메뉴"
            className="fixed bottom-[calc(8rem+env(safe-area-inset-bottom))] left-[5.2rem] z-20 opacity-[0.5] tablet:bottom-[5.2rem]"
        >
            <PostNavigationActions
                {...navVisibility}
                isDeletePending={isDeletePending}
                onAction={handleNavAction}
            />
        </nav>
    );
};
export default Actions;
