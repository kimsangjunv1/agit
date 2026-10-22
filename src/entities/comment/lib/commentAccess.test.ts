import { beforeEach, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { authorizeComment, type ManagedComment } from "./commentAccess.server";
vi.mock("server-only", () => ({}));
vi.mock("bcrypt", () => ({ default: { compare: vi.fn() } }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/shared/lib/authOptions", () => ({ authOptions: {} }));
vi.mock("@/shared/lib/supabase/supabaseServer", () => ({ supabaseAdmin: vi.fn() }));
const comment: ManagedComment = { idx: 1, post_id: 1, author: "독자", msg: "내용", is_admin: false, user_id: null, password_hash: "hash", deleted_at: null };
let hits = 0;
const rpc = vi.fn(async (name: string) => {
    if (name === "reserve_comment_password") return { data: hits < 5 ? (++hits, "2026-10-22T00:00:00Z") : null, error: null };
    if (name === "release_comment_password") { hits--; return { data: null, error: null }; }
    if (name === "check_comment_rate") return { data: hits < 5, error: null };
    hits++; return { data: true, error: null };
});
beforeEach(() => { hits = 0; vi.clearAllMocks(); vi.stubEnv("NEXTAUTH_SECRET", "test-secret"); vi.mocked(supabaseAdmin).mockReturnValue({ rpc } as unknown as ReturnType<typeof supabaseAdmin>); });
it("동시 비밀번호 대입도 최대 다섯 번만 비교한다", async () => {
    vi.mocked(bcrypt.compare).mockImplementation(async () => { await new Promise(resolve => setTimeout(resolve, 5)); return false; });
    const results = await Promise.all(Array.from({ length: 20 }, () => authorizeComment(new Request("http://localhost"), comment, "wrong123", null)));
    expect(bcrypt.compare).toHaveBeenCalledTimes(5);
    expect(results.filter(result => result?.status === 429)).toHaveLength(15);
});
it("올바른 비밀번호 확인은 실패 횟수에 남기지 않는다", async () => {
    vi.mocked(bcrypt.compare).mockImplementation(async () => true);
    expect(await authorizeComment(new Request("http://localhost"), comment, "secret123", null)).toBeNull();
    expect(hits).toBe(0);
    expect(rpc).toHaveBeenCalledWith("release_comment_password", expect.objectContaining({ p_window_started_at: "2026-10-22T00:00:00Z" }));
});
