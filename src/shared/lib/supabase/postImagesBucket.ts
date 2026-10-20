import type { SupabaseClient } from "@supabase/supabase-js";

export const POST_IMAGES_BUCKET = "post-images";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

export async function ensurePostImagesBucket(supabase: SupabaseClient) {
    const { data: bucket, error: getError } = await supabase.storage.getBucket(POST_IMAGES_BUCKET);

    if (bucket && !getError) {
        if (bucket.public) {
            const { error: updateError } = await supabase.storage.updateBucket(POST_IMAGES_BUCKET, {
                public: false,
            });

            if (updateError) {
                throw updateError;
            }
        }

        return;
    }

    const { error: createError } = await supabase.storage.createBucket(POST_IMAGES_BUCKET, {
        public: false,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
    });

    if (createError && !createError.message.toLowerCase().includes("already exists")) {
        throw createError;
    }
}
