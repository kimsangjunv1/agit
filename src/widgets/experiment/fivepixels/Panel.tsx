"use client";
import type { GetPostLatestListResponse } from "@/entities/post/model/post.type";
import * as Layer from "@/widgets/experiment/fivepixels/ui";
export default function Panel({ initialData }: { initialData: GetPostLatestListResponse }) {
    return (
        <>
            <Layer.FivePixelsLayer />
            <Layer.ArchiveFeed initialData={initialData} />
            <Layer.Search />
            <Layer.HomeViewModeFloatingMenu />
        </>
    );
}
