import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPostDetailServerFetch } from "@/entities/post/api/post.server.api";
import { GetPostDetailResponse } from "@/entities/post/model/post.type";
import { buildBlogPostingJsonLd, buildPostMetadata } from "@/shared/lib/seo/metadata";
import { singleItemPagination } from "@/shared/lib/utils/apiResponse";
import JsonLd from "@/shared/ui/seo/JsonLd";
import Main from "@/widgets/layout/Main";
import PostDetailView from "@/views/post/[id]/PostDetailView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const postIdx = Number(id);

    if (!Number.isFinite(postIdx) || postIdx <= 0) {
        return {};
    }

    const data = await getPostDetailServerFetch(postIdx);

    if (data.resultCode === "NOT_FOUND" || !data.result?.title) {
        return { title: "게시물을 찾을 수 없음", robots: { index: false, follow: false } };
    }

    if (data.result.visibility !== "public") return { title: "비공개 글", robots: { index: false, follow: false } };

    return buildPostMetadata(data.result);
}

const createFallbackData = (): GetPostDetailResponse => ({
    result: {
        id: "",
        idx: 0,
        user_id: null,
        title: "",
        thumbnail: "",
        contents: [],
        category_idx: 0,
        post_type: "article",
        visibility: "public",
        created_at: "",
        summary: "",
        views: 0,
        likes: 0,
    },
    pagination: singleItemPagination(),
    resultCode: "ERROR",
    resultMessage: "조회실패",
});

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const postIdx = Number(id);

    if (!Number.isFinite(postIdx) || postIdx <= 0) {
        notFound();
    }

    let initialData = createFallbackData();

    try {
        initialData = await getPostDetailServerFetch(postIdx);

    } catch (err: unknown) {
        console.error("SSR fetch error:", err);
    }

    if (initialData.resultCode === "NOT_FOUND") notFound();

    const post = initialData.result;

    return (
        <>
            {post?.title && post.visibility === "public" ? <JsonLd data={buildBlogPostingJsonLd(post)} /> : null}
            <Main
                id="post-detail"
                className={{ inner: "flex flex-col gap-[2.4rem]", container: "" }}
            >
                <PostDetailView
                    id={id}
                    initialData={initialData}
                />
            </Main>
        </>
    );
};

export default Page;
