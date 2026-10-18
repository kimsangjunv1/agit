"use client";

import { useEffect, useState } from "react";

import { useGetPostLatestListQuery } from "@/entities/post/api/post.query";
import usePageTransitionReady from "@/shared/hooks/usePageTransitionReady";
import { GetPostLatestListResponse } from "@/entities/post/model/post.type";

import { FeedEmpty, FeedError, FeedLoading } from "./FeedStatus";
import ArchiveSliderVerticalContent from "./ArchiveSliderVerticalContent";

type ArchiveSliderVerticalProps = {
    initialData: GetPostLatestListResponse;
};

const ArchiveSliderVerticalStatic = ({ initialData }: ArchiveSliderVerticalProps) => {
    const posts = initialData.result ?? [];

    if (initialData.resultCode === "ERROR" && posts.length === 0) {
        return (
            <FeedError
                message={initialData.resultMessage}
                onRetry={() => undefined}
            />
        );
    }

    if (posts.length === 0) {
        return <FeedEmpty />;
    }

    return <ArchiveSliderVerticalContent posts={posts} />;
};

const ArchiveSliderVerticalWithQuery = ({ initialData }: ArchiveSliderVerticalProps) => {
    const { data, isLoading, isError, error, refetch } = useGetPostLatestListQuery(initialData);
    const posts = data?.result ?? [];
    const isDataReady = !isLoading || posts.length > 0 || isError || data?.resultCode === "ERROR";

    usePageTransitionReady("archive-slider-vertical-data", isDataReady);

    if (isLoading && posts.length === 0) {
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

const ArchiveSliderVertical = ({ initialData }: ArchiveSliderVerticalProps) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <ArchiveSliderVerticalStatic initialData={initialData} />;
    }

    return <ArchiveSliderVerticalWithQuery initialData={initialData} />;
};

export default ArchiveSliderVertical;
