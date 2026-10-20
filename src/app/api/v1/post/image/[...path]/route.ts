import { getServerSession } from "next-auth";

import { authOptions } from "@/shared/lib/authOptions";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { POST_IMAGES_BUCKET } from "@/shared/lib/supabase/postImagesBucket";
import { apiError } from "@/shared/lib/apiResponse";
import { isPostImageStoragePath } from "@/entities/post/lib/collectPostImageUrls";
import { postNotFound, privatePostResponse } from "@/entities/post/api/postAccess.server";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
    try {
        const path = (await params).path.join("/");
        if (!isPostImageStoragePath(path)) return postNotFound();

        const userId = (await getServerSession(authOptions))?.user?.id ?? null;
        const supabase = supabaseAdmin();
        const { data: allowed, error: accessError } = await supabase.rpc("can_read_post_image", { p_path: path, p_user_id: userId });
        if (accessError) throw accessError;
        if (!allowed) return postNotFound();

        const { data, error } = await supabase.storage.from(POST_IMAGES_BUCKET).download(path);
        if (error || !data) return postNotFound();

        return privatePostResponse(
            new Response(data, {
                headers: {
                    "Content-Type": data.type || "application/octet-stream",
                    "X-Content-Type-Options": "nosniff",
                },
            }),
        );
    } catch {
        return privatePostResponse(apiError("이미지를 불러오지 못했어요.", { status: 500 }));
    }
}
