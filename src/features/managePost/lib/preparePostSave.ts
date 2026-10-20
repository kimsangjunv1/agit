import { uploadPostImageFetch } from "@/entities/post/api/post.image.api";
import type { SectionContent } from "@/entities/post/model/post.type";
import { normalizeBlocksForSave } from "@/features/managePost/lib/normalizePostBlocks";
import { collectPostImageUrls } from "@/entities/post/lib/collectPostImageUrls";
import { usePostDraftImageStore } from "@/shared/stores/usePostDraftImageStore";
import type { PostType, PostVisibility } from "@/entities/post/model/postSettings";

type PostContentRow = SectionContent[];

const replaceUrlInHtml = (html: string, replaceMap: Map<string, string>) => {
    let next = html;

    replaceMap.forEach((remoteUrl, localUrl) => {
        next = next.split(localUrl).join(remoteUrl);
    });

    return next;
};

const replaceRowUrls = (rows: PostContentRow[], replaceMap: Map<string, string>): PostContentRow[] =>
    rows.map((row) =>
        row.map((block) => {
            const nextBlock: SectionContent = { ...block };

            if (typeof nextBlock.content === "string") {
                nextBlock.content = replaceUrlInHtml(nextBlock.content, replaceMap);
            }

            if (nextBlock.imageUrl) {
                nextBlock.imageUrl = replaceMap.get(nextBlock.imageUrl) ?? nextBlock.imageUrl;
            }

            return nextBlock;
        }),
    );

export const preparePostPayloadForSave = async ({
    title,
    summary,
    thumbnail,
    category_idx,
    post_type,
    visibility,
    contents,
}: {
    title: string;
    summary: string;
    thumbnail: string;
    category_idx: number;
    post_type: PostType;
    visibility: PostVisibility;
    contents: PostContentRow[];
}) => {
    const { images } = usePostDraftImageStore.getState();
    const replaceMap = new Map<string, string>();

    for (const image of images) {
        if (!image.file) continue;

        const uploadedUrl = await uploadPostImageFetch(image.file);
        replaceMap.set(image.previewUrl, uploadedUrl);
    }

    return {
        title,
        summary,
        thumbnail: replaceMap.get(thumbnail) ?? thumbnail,
        category_idx: post_type === "article" ? category_idx : null,
        post_type,
        visibility,
        contents: normalizeBlocksForSave(replaceRowUrls(contents, replaceMap)),
    };
};

export const collectImagesFromPost = collectPostImageUrls;
