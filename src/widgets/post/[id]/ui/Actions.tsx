"use client";
import { usePostDetailProvider } from "../model/PostDetailContext";
import { useRef } from "react";
import useNavigate from "@/shared/hooks/useNavigate";
import { PostNavigationActions, usePostNavigationActions } from "@/features/managePost";
import { useScrollProgressBar } from "@/shared/hooks/useScrollProgress";

const Actions = () => {
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
        // <section className="sticky bottom-0 flex h-[5.2rem] w-full flex-wrap justify-center bg-black">
        <section className="sticky bottom-0 flex mobile:h-[5.2rem] pc:h-[7.2rem] w-full flex-wrap justify-center bg-black">
            <div className="mx-auto flex w-full max-w-[var(--size-tablet)]">
                <PostNavigationActions
                    {...navVisibility}
                    likeCount={likeCount}
                    alreadyLiked={alreadyLiked}
                    isDeletePending={isDeletePending}
                    onAction={handleNavAction}
                />
            </div>

            {/* <div className="absolute top-[calc((0.8rem/2)*-1)] left-0 w-full h-[0.8rem]"> */}
            <div className="absolute top-[calc((0.8rem/1)*-1)] left-0 w-full h-[0.8rem]">
                <div
                    ref={progressBarRef}
                    className="h-full w-0 will-change-[width]"
                />
            </div>
        </section>
    );
};
export default Actions;
