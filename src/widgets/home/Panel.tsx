"use client";

import { GetPostLatestListResponse } from "@/entities/post/model/post.type";

import { HomePageProvider } from "./model/HomeContext";
import * as HomeLayer from "@/widgets/home/ui";

type HomePanelProps = {
    initialData: GetPostLatestListResponse;
};

export default function Panel({ initialData }: HomePanelProps) {
    return (
        <HomePageProvider>
            <HomeLayer.ArchiveFeed initialData={initialData} />
            <HomeLayer.Search />
            <HomeLayer.HomeViewModeFloatingMenu />
            <HomeLayer.Modal />
        </HomePageProvider>
    );
}
