"use client";

import { GetPostLatestListResponse } from "@/entities/post/model/post.type";
import HomeViewModeNav from "@/features/browseArchive/ui/HomeViewModeNav";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";

import * as HomeLayer from "@/widgets/home/ui";

type HomePanelProps = {
    initialData: GetPostLatestListResponse;
};

export default function Panel({ initialData }: HomePanelProps) {
    const isMobile = useLayoutStore((state) => state.isMobile);

    return (
        <>
            <HomeLayer.ArchiveFeed initialData={initialData} />
            <HomeLayer.Search />
            <HomeLayer.HomeViewModeFloatingMenu />
            {isMobile ? null : (
                <section className="fixed bottom-[5.2rem] left-[5.2rem] right-[5.2rem] z-20 flex min-w-0 items-start justify-start">
                    <HomeViewModeNav variant="header" />
                </section>
            )}
        </>
    );
}
