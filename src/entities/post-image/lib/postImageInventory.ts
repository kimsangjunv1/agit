import type { SupabaseClient } from "@supabase/supabase-js";

import type { SectionContent } from "@/entities/post/model/post.type";
import { collectPostImageUrls, toPostImageStoragePath } from "@/entities/post/lib/collectPostImageUrls";
import { POST_IMAGES_BUCKET } from "@/shared/lib/supabase/postImagesBucket";

const STORAGE_LIST_LIMIT = 1000;
const DELETE_BATCH_SIZE = 100;

export type PostImageInventoryItem = {
    path: string;
    url: string;
    sizeBytes: number;
    isUsed: boolean;
    referencedBy: number[];
};

export type PostImageInventorySummary = {
    totalCount: number;
    usedCount: number;
    unusedCount: number;
    totalSizeBytes: number;
    usedSizeBytes: number;
    unusedSizeBytes: number;
};

export type PostImageInventory = {
    summary: PostImageInventorySummary;
    items: PostImageInventoryItem[];
};

export type DeleteUnusedPostImagesResult = {
    deletedCount: number;
    freedBytes: number;
    failedCount: number;
};

type StorageFile = {
    path: string;
    sizeBytes: number;
};

type PostImageReference = {
    idx: number;
    thumbnail: string | null;
    contents: SectionContent[][] | null;
};

const sumBytes = (items: Pick<PostImageInventoryItem, "sizeBytes">[]) => items.reduce((total, item) => total + item.sizeBytes, 0);

export const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const listPostImageStorageFiles = async (supabase: SupabaseClient): Promise<StorageFile[]> => {
    const files: StorageFile[] = [];
    let offset = 0;

    while (true) {
        const { data, error } = await supabase.storage.from(POST_IMAGES_BUCKET).list("posts", {
            limit: STORAGE_LIST_LIMIT,
            offset,
            sortBy: { column: "created_at", order: "desc" },
        });

        if (error) throw error;
        if (!data?.length) break;

        for (const file of data) {
            if (!file.id) continue;

            files.push({
                path: `posts/${file.name}`,
                sizeBytes: typeof file.metadata?.size === "number" ? file.metadata.size : 0,
            });
        }

        if (data.length < STORAGE_LIST_LIMIT) break;
        offset += STORAGE_LIST_LIMIT;
    }

    return files;
};

const collectReferencedImagePaths = (posts: PostImageReference[]) => {
    const pathToPostIds = new Map<string, number[]>();

    for (const post of posts) {
        const urls = collectPostImageUrls(post.thumbnail ?? "", post.contents ?? []);

        for (const url of urls) {
            const path = toPostImageStoragePath(url);
            if (!path) continue;

            const referencedBy = pathToPostIds.get(path) ?? [];
            if (!referencedBy.includes(post.idx)) {
                referencedBy.push(post.idx);
            }
            pathToPostIds.set(path, referencedBy);
        }
    }

    return pathToPostIds;
};

export const buildPostImageInventory = async (supabase: SupabaseClient): Promise<PostImageInventory> => {
    const [{ data: posts, error: postsError }, storageFiles] = await Promise.all([supabase.from("posts").select("idx, thumbnail, contents"), listPostImageStorageFiles(supabase)]);

    if (postsError) throw postsError;

    const pathToPostIds = collectReferencedImagePaths((posts ?? []) as PostImageReference[]);

    const items: PostImageInventoryItem[] = storageFiles.map((file) => {
        const referencedBy = pathToPostIds.get(file.path) ?? [];

        return {
            path: file.path,
            url: supabase.storage.from(POST_IMAGES_BUCKET).getPublicUrl(file.path).data.publicUrl,
            sizeBytes: file.sizeBytes,
            isUsed: referencedBy.length > 0,
            referencedBy,
        };
    });

    const usedItems = items.filter((item) => item.isUsed);
    const unusedItems = items.filter((item) => !item.isUsed);

    return {
        summary: {
            totalCount: items.length,
            usedCount: usedItems.length,
            unusedCount: unusedItems.length,
            totalSizeBytes: sumBytes(items),
            usedSizeBytes: sumBytes(usedItems),
            unusedSizeBytes: sumBytes(unusedItems),
        },
        items,
    };
};

export const deleteUnusedPostImages = async (supabase: SupabaseClient): Promise<DeleteUnusedPostImagesResult> => {
    const inventory = await buildPostImageInventory(supabase);
    const unusedPaths = inventory.items.filter((item) => !item.isUsed).map((item) => item.path);

    if (unusedPaths.length === 0) {
        return { deletedCount: 0, freedBytes: 0, failedCount: 0 };
    }

    const freedBytes = inventory.summary.unusedSizeBytes;
    let deletedCount = 0;
    let failedCount = 0;

    for (let index = 0; index < unusedPaths.length; index += DELETE_BATCH_SIZE) {
        const batch = unusedPaths.slice(index, index + DELETE_BATCH_SIZE);
        const { data, error } = await supabase.storage.from(POST_IMAGES_BUCKET).remove(batch);

        if (error) throw error;

        deletedCount += data?.length ?? 0;
        failedCount += batch.length - (data?.length ?? 0);
    }

    return { deletedCount, freedBytes, failedCount };
};
