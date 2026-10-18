import type { SectionContent } from "@/entities/post/model/post.type";

export const POST_IMAGES_BUCKET_SEGMENT = "/post-images/";

export const toPostImageStoragePath = (url: string): string | null => {
    if (!url || url.startsWith("blob:")) return null;

    const normalized = url.trim();
    const bucketIndex = normalized.indexOf(POST_IMAGES_BUCKET_SEGMENT);
    if (bucketIndex === -1) return null;

    const path = normalized.slice(bucketIndex + POST_IMAGES_BUCKET_SEGMENT.length).split("?")[0];
    if (!path.startsWith("posts/")) return null;

    return path;
};

export const collectPostImageUrls = (thumbnail: string, contents: SectionContent[][]) => {
    const urls = new Set<string>();

    if (thumbnail) urls.add(thumbnail);

    contents.forEach((row) => {
        row.forEach((block) => {
            if (block.imageUrl) urls.add(block.imageUrl);

            if (typeof block.content === "string") {
                const matches = block.content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
                for (const match of matches) {
                    if (match[1]) urls.add(match[1]);
                }
            }
        });
    });

    return Array.from(urls).filter((url) => url && url !== "/");
};
