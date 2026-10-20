import { requireSession } from "@/shared/lib/auth/requireSession";
import { optimizePostImage } from "@/shared/lib/image/optimizePostImage";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { ensurePostImagesBucket, POST_IMAGES_BUCKET } from "@/shared/lib/supabase/postImagesBucket";
import { apiError, apiSuccess } from "@/shared/lib/apiResponse";
import { POST_IMAGE_API_PREFIX } from "@/entities/post/lib/collectPostImageUrls";

export async function POST(req: Request) {
    const auth = await requireSession();
    if (!auth.authorized) return auth.response;

    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return apiError("업로드할 파일이 없습니다.", {
                status: 400,
                result: { statusCode: 0 },
            });
        }

        if (!file.type.startsWith("image/")) {
            return apiError("이미지 파일만 업로드할 수 있습니다.", {
                status: 400,
                result: { statusCode: 0 },
            });
        }

        const supabase = supabaseAdmin();
        await ensurePostImagesBucket(supabase);

        const optimized = await optimizePostImage(file);
        const filePath = `posts/${auth.session.user.id}/${Date.now()}-${crypto.randomUUID()}.${optimized.extension}`;

        const { error } = await supabase.storage.from(POST_IMAGES_BUCKET).upload(filePath, optimized.buffer, {
            cacheControl: "0",
            upsert: false,
            contentType: optimized.contentType,
        });

        if (error) {
            throw error;
        }

        return apiSuccess(
            {
                statusCode: 1,
                url: `${POST_IMAGE_API_PREFIX}${filePath}`,
            },
            { resultMessage: "업로드성공", pagination: null },
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "이미지 업로드 중 문제가 발생했습니다.";

        return apiError(message, {
            status: 500,
            result: { statusCode: 0 },
        });
    }
}
