"use client";

import { useGetPostLatestListQuery } from "@/entities/post/api/post.query";
import usePageTransitionReady from "@/shared/hooks/usePageTransitionReady";
import { GetPostLatestListResponse } from "@/entities/post/model/post.type";

import { FeedEmpty, FeedError, FeedLoading } from "./FeedStatus";
import ArchiveSliderVerticalContent from "./ArchiveSliderVerticalContent";

type ArchiveSliderVerticalProps = {
    initialData: GetPostLatestListResponse;
};

const ArchiveSliderVertical = ({ initialData }: ArchiveSliderVerticalProps) => {
    const { data, isLoading, isError, error, refetch, ready } = useGetPostLatestListQuery(initialData);
    const posts = data?.result ?? [];
    const isDataReady = ready && (!isLoading || posts.length > 0 || isError || data?.resultCode === "ERROR");

    usePageTransitionReady("archive-slider-vertical-data", isDataReady);

    if (!ready || (isLoading && posts.length === 0)) {
        return <FeedLoading className="h-screen" />;
    }

    if (isError) {
        return (
            <FeedError
                message={error?.message}
                onRetry={() => refetch()}
            />
        );
    }

    if (data?.resultCode === "ERROR") {
        return (
            <FeedError
                message={data.resultMessage}
                onRetry={() => refetch()}
            />
        );
    }

    if (posts.length === 0) {
        return <FeedEmpty />;
    }

    return <ArchiveSliderVerticalContent posts={posts} />;
};

export default ArchiveSliderVertical;
