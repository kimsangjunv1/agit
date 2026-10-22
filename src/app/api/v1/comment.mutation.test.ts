import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { findReadablePost } from "@/entities/post/api/postAccess.server";
import { PATCH } from "./set/comment/update/route";
import { DELETE } from "./delete/comment/route";
import { DELETE as deleteManager } from "./delete/comment/manager/route";

vi.mock("server-only", () => ({}));
vi.mock("bcrypt", () => ({ default: { compare: vi.fn(async () => true) } }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/shared/lib/authOptions", () => ({ authOptions: {} }));
vi.mock("@/shared/lib/supabase/supabaseServer", () => ({ supabaseAdmin: vi.fn() }));
vi.mock("@/entities/post/api/postAccess.server", async (original) => ({ ...await original<typeof import("@/entities/post/api/postAccess.server")>(), findReadablePost: vi.fn() }));
let comment: { idx: number; post_id: number; author: string; msg: string; is_admin: boolean; user_id: string | null; password_hash: string | null; deleted_at: string | null };
const query = {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), or: vi.fn().mockReturnThis(), is: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(async () => ({ data: comment, error: null })),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ error: null }).then(resolve),
};
const database = { from: vi.fn(() => query), rpc: vi.fn(async (name: string) => ({ data: name === "reserve_comment_password" ? "2026-10-22T00:00:00Z" : true, error: null })) };
const request = (patch = {}) => new Request("http://localhost/api/v1/set/comment/update", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idx: 1, msg: "수정한 내용", password: "secret123", ...patch }) });
const member = (id = "owner", role = "user") => ({ user: { id, name: "작성자", role, email: "test@example.com" }, expires: "2099-01-01" });
beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXTAUTH_SECRET", "comment-test-secret");
    comment = { idx: 1, post_id: 1, author: "작성자", msg: "원본", is_admin: false, user_id: null, password_hash: "hash", deleted_at: null };
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(findReadablePost).mockResolvedValue({ idx: 1, post_type: "article", visibility: "public", user_id: null });
    vi.mocked(supabaseAdmin).mockReturnValue(database as unknown as ReturnType<typeof supabaseAdmin>);
    vi.mocked(bcrypt.compare).mockImplementation(async () => true);
    database.rpc.mockImplementation(async (name) => ({ data: name === "reserve_comment_password" ? "2026-10-22T00:00:00Z" : true, error: null }));
});
describe("댓글 수정·삭제 본인 확인", () => {
    it("비회원은 비밀번호로 본문만 수정하고 작성 시각은 유지한다", async () => {
        expect((await PATCH(request())).status).toBe(200);
        expect(query.update).toHaveBeenCalledWith({ msg: "수정한 내용", is_modified: true, updated_at: expect.any(String) });
        expect(bcrypt.compare).toHaveBeenCalledWith("secret123", "hash");
    });
    it("비밀번호 오류만 실패 횟수에 기록한다", async () => {
        vi.mocked(bcrypt.compare).mockImplementation(async () => false);
        expect((await PATCH(request())).status).toBe(403);
        expect(database.rpc).toHaveBeenCalledWith("reserve_comment_password", expect.objectContaining({ p_key: expect.stringContaining("comment-password:") }));
        expect(query.update).not.toHaveBeenCalled();
    });
    it("비밀번호 실패 한도를 넘으면 비교도 하지 않는다", async () => {
        database.rpc.mockResolvedValue({ data: false, error: null });
        expect((await DELETE(request())).status).toBe(429);
        expect(bcrypt.compare).not.toHaveBeenCalled();
    });
    it("로그인한 본인은 비밀번호 없이 수정한다", async () => {
        comment.user_id = "owner"; comment.password_hash = null;
        vi.mocked(getServerSession).mockResolvedValue(member());
        expect((await PATCH(request({ password: undefined }))).status).toBe(200);
        expect(bcrypt.compare).not.toHaveBeenCalled();
    });
    it("다른 계정은 비밀번호를 알아도 회원 댓글을 수정하지 못한다", async () => {
        comment.user_id = "owner";
        vi.mocked(getServerSession).mockResolvedValue(member("other"));
        expect((await PATCH(request())).status).toBe(403);
        expect(query.update).not.toHaveBeenCalled();
    });
    it("기존 비밀번호 없는 댓글은 비회원이 처리하지 못한다", async () => {
        comment.password_hash = null;
        expect((await DELETE(request())).status).toBe(403);
    });
    it("관리자는 기존 댓글을 삭제하되 개인정보를 지우고 답글은 보존한다", async () => {
        comment.password_hash = null;
        vi.mocked(getServerSession).mockResolvedValue(member("admin", "admin"));
        expect((await deleteManager(request())).status).toBe(200);
        expect(query.or).not.toHaveBeenCalled();
        expect(query.update).toHaveBeenCalledWith(expect.objectContaining({ deleted_at: expect.any(String), author: "", msg: "", user_id: null, password_hash: null, emoji_id: null }));
    });
    it("관리자 API는 일반 회원이 사용할 수 없다", async () => {
        vi.mocked(getServerSession).mockResolvedValue(member());
        expect((await deleteManager(request())).status).toBe(403);
        expect(database.from).not.toHaveBeenCalled();
    });
    it("같은 내용은 수정됨 처리와 쓰기 한도를 소비하지 않는다", async () => {
        expect((await PATCH(request({ msg: "원본" }))).status).toBe(200);
        expect(query.update).not.toHaveBeenCalled();
        expect(database.rpc).not.toHaveBeenCalledWith("consume_comment_rate", expect.anything());
    });
    it("수정에도 광고 필터를 적용한다", async () => {
        expect((await PATCH(request({ msg: "카지노 가입머니 지급" }))).status).toBe(400);
        expect(query.update).not.toHaveBeenCalled();
    });
    it("수정 한도 초과를 성공으로 처리하지 않는다", async () => {
        comment.user_id = "owner";
        vi.mocked(getServerSession).mockResolvedValue(member());
        database.rpc.mockResolvedValue({ data: false, error: null });
        expect((await PATCH(request())).status).toBe(429);
        expect(query.update).not.toHaveBeenCalled();
    });
    it.each(["til", "diary"])("%s의 댓글 수정도 차단한다", async (post_type) => {
        vi.mocked(findReadablePost).mockResolvedValue({ idx: 1, post_type, visibility: "public", user_id: null });
        expect((await PATCH(request())).status).toBe(403);
    });
    it("비공개 게시물에 접근할 수 없으면 수정하지 않는다", async () => {
        vi.mocked(findReadablePost).mockResolvedValue(null);
        expect((await PATCH(request())).status).toBe(404);
    });
    it("삭제된 댓글은 다시 수정할 수 없다", async () => {
        comment.deleted_at = "2026-10-22";
        expect((await PATCH(request())).status).toBe(404);
    });
    it("깨진 JSON은 400으로 처리한다", async () => {
        expect((await PATCH(new Request("http://localhost", { method: "PATCH", body: "{" }))).status).toBe(400);
    });
});
