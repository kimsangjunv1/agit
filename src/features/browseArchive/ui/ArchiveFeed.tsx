"use client";

import { useEffect, useLayoutEffect } from "react";

import UI from "@/shared/ui/common/UIComponent";
import { GetPostLatestListResponse } from "@/entities/post/model/post.type";
import { usePostTypeFilter } from "@/entities/post/model/usePostTypeFilter";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import { clampPageScroll } from "@/features/browseArchive/lib/clampPageScroll";

import ArchiveList from "./ArchiveList";
import ArchiveSliderHorizontal from "./ArchiveSliderHorizontal";
import ArchiveSliderVertical from "./ArchiveSliderVertical";

type ArchiveFeedProps = {
    initialData: GetPostLatestListResponse;
};

const ArchiveFeed = ({ initialData }: ArchiveFeedProps) => {
    const isMobile = useLayoutStore((state) => state.isMobile);
    const { mainViewMode, categoryFilter } = usePostTypeFilter();

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [mainViewMode]);

    useLayoutEffect(() => {
        clampPageScroll();
        requestAnimationFrame(clampPageScroll);
    }, [mainViewMode, categoryFilter]);

    if (mainViewMode === 1) {
        return (
            <>
                <section className="flex-1 w-full h-full overflow-hidden">
                    <UI.ErrorBoundaryWrapper>{isMobile ? <ArchiveSliderVertical initialData={initialData} /> : <ArchiveSliderHorizontal initialData={initialData} />}</UI.ErrorBoundaryWrapper>
                </section>
            </>
        );
    }

    return (
        <>
            {/* <section className="w-full h-full flex-1 mobile:pt-[calc(var(--header-height))] pc:pt-[calc(var(--header-height))] pb-[calc((1.6rem*4)+env(safe-area-inset-bottom))]"> */}
            <section className="w-[calc(100dvw-12.8rem)] ml-auto h-full flex-1 mobile:pt-[calc(var(--header-height))] pc:pt-[calc(5.2rem+4.0rem+2.4rem)] pb-[calc((1.6rem*4)+env(safe-area-inset-bottom))]">
                <UI.ErrorBoundaryWrapper>
                    <ArchiveList />
                </UI.ErrorBoundaryWrapper>
            </section>
        </>
    );
};

export default ArchiveFeed;
