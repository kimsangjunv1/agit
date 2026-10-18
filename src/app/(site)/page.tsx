import type { Metadata } from "next";

import Main from "@/widgets/layout/Main";
import HomeView from "@/views/home/HomeView";
import { getPostLatestListServerFetch } from "@/entities/post/api/post.server.api";
import { GetPostLatestListResponse } from "@/entities/post/model/post.type";
import { buildPageMetadata, buildWebsiteJsonLd } from "@/shared/lib/seo/metadata";
import JsonLd from "@/shared/ui/seo/JsonLd";
import { buildPagination } from "@/shared/lib/utils/apiResponse";

export const metadata: Metadata = buildPageMetadata({
    title: "ARCHIVE",
    path: "/",
});

export const revalidate = 300;

const createFallbackData = (): GetPostLatestListResponse => ({
    result: [],
    pagination: buildPagination({ page: 1, pageSize: 10, totalCount: 0 }),
    resultCode: "ERROR",
    resultMessage: "조회실패",
});

const Page = async () => {
    let initialData = createFallbackData();

    try {
        initialData = await getPostLatestListServerFetch();
    } catch (err: unknown) {
        console.error("SSR fetch error:", err);
    }

    return (
        <>
            <JsonLd data={buildWebsiteJsonLd()} />
            <Main
                id="home"
                className={{ inner: "min-h-[100svh]", container: "" }}
            >
                <HomeView initialData={initialData} />
            </Main>
        </>
    );
};

export default Page;
