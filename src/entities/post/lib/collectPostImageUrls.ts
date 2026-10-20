import type { SectionContent } from "@/entities/post/model/post.type";

export const POST_IMAGES_BUCKET_SEGMENT = "/post-images/";
export const POST_IMAGE_API_PREFIX = "/api/v1/post/image/";

export const isPostImageStoragePath = (path: string) => /^posts\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(path);

export const toPostImageStoragePath = (url: string): string | null => {
    if (!url || url.startsWith("blob:")) return null;

    const normalized = url.trim();
    const segment = normalized.includes(POST_IMAGE_API_PREFIX) ? POST_IMAGE_API_PREFIX : POST_IMAGES_BUCKET_SEGMENT;
    const bucketIndex = normalized.indexOf(segment);
    if (bucketIndex === -1) return null;

    const path = normalized.slice(bucketIndex + segment.length).split("?")[0];
    if (!isPostImageStoragePath(path)) return null;

    return path;
};

export const toPostImageUrl = (url: string) => {
    const path = toPostImageStoragePath(url);
    return path ? `${POST_IMAGE_API_PREFIX}${path}` : url;
};

/** 저장된 기존 Storage URL도 현재 글 권한을 확인하는 주소로 변환한다. */
export const resolvePostImages = <T>(value: T): T => {
    if (Array.isArray(value)) return value.map(resolvePostImages) as T;
    if (!value || typeof value !== "object") return value;

    return Object.fromEntries(
        Object.entries(value).map(([key, item]) => {
            if ((key === "thumbnail" || key === "imageUrl") && typeof item === "string") return [key, toPostImageUrl(item)];
            if (key === "content" && typeof item === "string") {
                return [key, item.replace(/(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi, (_match, before, url, after) => `${before}${toPostImageUrl(url)}${after}`)];
            }
            return [key, resolvePostImages(item)];
        }),
    ) as T;
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
