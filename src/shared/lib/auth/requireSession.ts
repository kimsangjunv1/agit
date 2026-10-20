import { getServerSession, type Session } from "next-auth";

import { authOptions } from "@/shared/lib/authOptions";
import { apiError } from "@/shared/lib/apiResponse";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";

export type AuthGuardResult = { authorized: true; session: Session } | { authorized: false; response: Response };

export async function requireSession(): Promise<AuthGuardResult> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return {
            authorized: false,
            response: apiError("로그인이 필요합니다.", {
                status: 401,
                resultCode: "UNAUTHORIZED",
            }),
        };
    }

    return { authorized: true, session };
}

export async function requireAdmin(): Promise<AuthGuardResult> {
    const auth = await requireSession();

    if (!auth.authorized) {
        return auth;
    }

    if (auth.session.user.role !== "admin") {
        return {
            authorized: false,
            response: apiError("권한이 없습니다.", {
                status: 403,
                resultCode: "FORBIDDEN",
            }),
        };
    }

    return auth;
}

type PostAccessResult =
    | {
          authorized: true;
          session: Session;
          post: { idx: number; user_id: string | null; visibility: string; post_type: string };
      }
    | Extract<AuthGuardResult, { authorized: false }>;

export async function requirePostOwnerOrAdmin(postIdx: number | string): Promise<PostAccessResult> {
    const auth = await requireSession();

    if (!auth.authorized) {
        return auth;
    }

    const supabase = supabaseAdmin();
    const { data: post, error } = await supabase.from("posts").select("idx, user_id, visibility, post_type").eq("idx", postIdx).single();

    if (error || !post) {
        return {
            authorized: false,
            response: apiError("글을 찾을 수 없습니다.", {
                status: 404,
                resultCode: "NOT_FOUND",
            }),
        };
    }

    const isAdmin = auth.session.user.role === "admin";
    const isOwner = !!post.user_id && post.user_id === auth.session.user.id;

    if ((!isAdmin && !isOwner) || (post.visibility !== "public" && !isOwner)) {
        return {
            authorized: false,
            response: apiError("권한이 없습니다.", {
                status: 403,
                resultCode: "FORBIDDEN",
            }),
        };
    }

    return { authorized: true, session: auth.session, post };
}
