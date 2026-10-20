import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/** 공개 read 전용 — RLS 정책(SELECT) 적용. write·민감 테이블 접근 금지 */
export async function supabaseServer() {
    return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

/**
 * 서버 API 전용 — RLS 우회 service role (클라이언트 노출 금지).
 * write, 권한을 확인한 비공개 조회, users/invite_codes 접근, storage 처리에 사용한다.
 */
export function supabaseAdmin() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다.");
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}
