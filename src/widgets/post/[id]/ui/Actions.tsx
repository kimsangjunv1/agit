"use client";
import { usePostDetailProvider } from "../model/PostDetailContext";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useNavigate from "@/shared/hooks/useNavigate";
import { PostNavigationActions, usePostNavigationActions } from "@/features/managePost";
import { useScrollProgressBar } from "@/shared/hooks/useScrollProgress";

const Actions = () => {
    const [headerContainer, setHeaderContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setHeaderContainer(document.getElementById("post-header-actions"));
    }, []);

    return headerContainer ? createPortal(<PostActions />, headerContainer) : null;
};

const PostActions = () => {
    const { postIdx } = usePostDetailProvider();
    const { pushToUrl } = useNavigate();
    const progressBarRef = useRef<HTMLDivElement>(null);
    useScrollProgressBar(progressBarRef);
    const { alreadyLiked, likeCount, navVisibility, hasNavActions, isDeletePending, handleNavAction } = usePostNavigationActions({
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
            className="relative flex w-full justify-center"
        >
            <PostNavigationActions
                {...navVisibility}
                likeCount={likeCount}
                alreadyLiked={alreadyLiked}
                isDeletePending={isDeletePending}
                onAction={handleNavAction}
            />

            <div className="pointer-events-none absolute bottom-[-1.2rem] left-0 w-[12.8rem] bg-[#00000090] h-[0.2rem]">
                <div
                    ref={progressBarRef}
                    className="h-full w-0 will-change-[width]"
                />
            </div>
        </nav>
    );
};
export default Actions;
