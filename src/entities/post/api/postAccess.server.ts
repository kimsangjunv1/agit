import "server-only";

import { getServerSession } from "next-auth";

import { authOptions } from "@/shared/lib/authOptions";
import { apiError } from "@/shared/lib/apiResponse";
import { supabaseAdmin, supabaseServer } from "@/shared/lib/supabase/supabaseServer";
import { postVisibilityFilter } from "@/entities/post/model/postSettings";
import { collectPostImageUrls, toPostImageStoragePath } from "@/entities/post/lib/collectPostImageUrls";
import type { SectionContent } from "@/entities/post/model/post.type";

export const privatePostResponse = <T extends Response>(response: T): T => {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Vary", "Cookie");
    return response;
};

export const postNotFound = () => privatePostResponse(apiError("글을 찾을 수 없습니다.", { status: 404, resultCode: "NOT_FOUND" }));

export async function getPostReader(viewerId?: string | null) {
    const userId = viewerId === undefined ? ((await getServerSession(authOptions))?.user?.id ?? null) : viewerId;
    const supabase = userId ? supabaseAdmin() : await supabaseServer();
    return { supabase, userId, visibilityFilter: postVisibilityFilter(userId) };
}

export async function findReadablePost(postIdx: number | string, viewerId?: string | null) {
    const reader = await getPostReader(viewerId);
    const { data, error } = await reader.supabase.from("posts").select("idx, user_id, visibility, post_type").eq("idx", postIdx).or(reader.visibilityFilter).maybeSingle();
    if (error) throw error;
    return data;
}

/** 다른 작성자의 비공개 이미지 주소를 새 공개 글에 붙여 넣어도 공개되지 않게 한다. */
export async function assertPostImagesReadable(post: { thumbnail: string; contents: SectionContent[][] }, userId: string) {
    const supabase = supabaseAdmin();
    const paths = new Set(
        collectPostImageUrls(post.thumbnail, post.contents)
            .map(toPostImageStoragePath)
            .filter((path): path is string => !!path),
    );
    await Promise.all(
        Array.from(paths, async (path) => {
            const { data: allowed, error } = await supabase.rpc("can_read_post_image", { p_path: path, p_user_id: userId });
            if (error) throw error;
            if (!allowed) throw Object.assign(new Error("접근할 수 없는 이미지가 포함되어 있어요."), { status: 403 });
        }),
    );
}
