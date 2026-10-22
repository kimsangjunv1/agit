import type { Metadata } from "next";

import Main from "@/widgets/layout/Main";
import FivepixelsView from "@/views/experiment/fivepixels/FivepixelsView";
import { getPostLatestListServerFetch } from "@/entities/post/api/post.server.api";
import { GetPostLatestListResponse } from "@/entities/post/model/post.type";
import { buildPageMetadata, NOINDEX_METADATA } from "@/shared/lib/seo/metadata";
import { buildPagination } from "@/shared/lib/utils/apiResponse";

export const metadata: Metadata = {
    ...buildPageMetadata({
        title: "ARCHIVE",
        path: "/experiment/fivepixels",
    }),
    ...NOINDEX_METADATA,
};

export const dynamic = "force-dynamic";

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
        <Main
            id="home"
            className={{ inner: "min-h-[100svh]", container: "" }}
        >
            <FivepixelsView initialData={initialData} />
        </Main>
    );
};

export default Page;
