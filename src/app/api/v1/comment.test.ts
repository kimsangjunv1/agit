import { getServerSession } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { COMMENT_AUTHOR_MAX_CODE_UNITS, COMMENT_AUTHOR_MAX_LENGTH, COMMENT_MESSAGE_MAX_LENGTH } from "@/entities/comment/model/comment.constants";
import { requireAdmin } from "@/shared/lib/auth/requireSession";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { apiError } from "@/shared/lib/apiResponse";
import { POST } from "./set/comment/create/route";
import { GET as getDetail } from "./get/comment/detail/[idx]/route";
import { GET as getLatest } from "./get/comment/latest/route";
import { GET as getManager } from "./get/comment/manager/route";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/shared/lib/authOptions", () => ({ authOptions: {} }));
vi.mock("@/shared/lib/auth/requireSession", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/shared/lib/supabase/supabaseServer", () => ({ supabaseAdmin: vi.fn() }));

let queryResult: {
    data: unknown;
    error: { code?: string; message?: string } | null;
    count: number;
};

const query = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    then: (resolve: (value: typeof queryResult) => unknown) => Promise.resolve(queryResult).then(resolve),
};
const database = { from: vi.fn(() => query) };

const createRequest = (payload: unknown) =>
    new Request("http://localhost/api/v1/set/comment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
const validPayload = { post_id: 1, author: "방문자", msg: "잘 읽었어요." };

beforeEach(() => {
    vi.clearAllMocks();
    queryResult = { data: null, error: null, count: 0 };
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(supabaseAdmin).mockReturnValue(database as unknown as ReturnType<typeof supabaseAdmin>);
});

describe("댓글 등록", () => {
    it("비회원 댓글을 등록하고 요청에 섞인 권한·비밀번호·식별자·비밀글 설정은 저장하지 않는다", async () => {
        const response = await POST(
            createRequest({
                ...validPayload,
                author: " 방문자 ",
                msg: " 잘 읽었어요. ",
                idx: 999,
                id: "forged-id",
                password: "plain-password",
                is_admin: true,
                is_secret: true,
                created_at: "2000-01-01",
            }),
        );

        expect(response.status).toBe(201);
        expect(query.insert).toHaveBeenCalledWith({ ...validPayload, is_admin: false, is_secret: false });
        expect(await response.json()).toMatchObject({ resultCode: "SUCCESS", result: null });
    });

    it("관리자 표시는 서버에서 확인한 세션으로 결정한다", async () => {
        vi.mocked(getServerSession).mockResolvedValue({ user: { id: "admin-1", email: "admin@example.com", name: "관리자", role: "admin" }, expires: "2099-01-01" });

        await POST(createRequest({ ...validPayload, is_admin: false }));

        expect(query.insert).toHaveBeenCalledWith({ ...validPayload, is_admin: true, is_secret: false });
    });

    it("일반 로그인 사용자가 관리자 표시를 위조할 수 없다", async () => {
        vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1", email: "user@example.com", name: "사용자", role: "user" }, expires: "2099-01-01" });

        await POST(createRequest({ ...validPayload, is_admin: true }));

        expect(query.insert).toHaveBeenCalledWith({ ...validPayload, is_admin: false, is_secret: false });
    });

    it.each([
        { ...validPayload, author: "관리자", is_admin: true },
        { ...validPayload, author: "씨발" },
        { ...validPayload, msg: "씨!발" },
        { ...validPayload, msg: "ㅆ ㅣ ㅂ ㅏ ㄹ" },
        { ...validPayload, author: "👨‍👩‍👧‍👦".repeat(COMMENT_AUTHOR_MAX_LENGTH + 1) },
        { ...validPayload, author: "가" + "\u0301".repeat(COMMENT_AUTHOR_MAX_CODE_UNITS) },
    ])("화면 검사를 우회해 직접 요청해도 닉네임·내용 정책을 적용한다: %j", async (payload) => {
        const response = await POST(createRequest(payload));

        expect(response.status).toBe(400);
        expect(supabaseAdmin).not.toHaveBeenCalled();
    });

    it("보이는 10글자를 허용하고 한글은 정규화하되 본문 코드는 보존한다", async () => {
        const msg = "class Example {\n  return '시발점';\n}";
        const author = "가나다라마바사아자차";

        const response = await POST(createRequest({ ...validPayload, author: author.normalize("NFD"), msg }));

        expect(response.status).toBe(201);
        expect(query.insert).toHaveBeenCalledWith({ post_id: validPayload.post_id, author, msg, is_admin: false, is_secret: false });
    });

    it("UTF-16 길이가 길어도 보이는 10글자의 이모지는 등록할 수 있다", async () => {
        const author = "👨‍👩‍👧‍👦".repeat(COMMENT_AUTHOR_MAX_LENGTH);

        const response = await POST(createRequest({ ...validPayload, author }));

        expect(response.status).toBe(201);
        expect(query.insert).toHaveBeenCalledWith({ ...validPayload, author, is_admin: false, is_secret: false });
    });

    it("서버에서 인증된 관리자의 운영진 닉네임은 허용한다", async () => {
        vi.mocked(getServerSession).mockResolvedValue({ user: { id: "admin-1", email: "admin@example.com", name: "관리자", role: "admin" }, expires: "2099-01-01" });

        const response = await POST(createRequest({ ...validPayload, author: "관리자" }));

        expect(response.status).toBe(201);
        expect(query.insert).toHaveBeenCalledWith({ ...validPayload, author: "관리자", is_admin: true, is_secret: false });
    });

    it.each([
        null,
        [],
        [validPayload],
        {},
        { ...validPayload, post_id: "1" },
        { ...validPayload, post_id: 0 },
        { ...validPayload, post_id: -1 },
        { ...validPayload, post_id: 1.5 },
        { ...validPayload, author: "   " },
        { ...validPayload, author: 123 },
        { ...validPayload, author: "가".repeat(COMMENT_AUTHOR_MAX_LENGTH + 1) },
        { ...validPayload, msg: "\n  " },
        { ...validPayload, msg: {} },
        { ...validPayload, msg: "가".repeat(COMMENT_MESSAGE_MAX_LENGTH + 1) },
    ])("잘못된 입력을 DB에 전달하지 않는다: %j", async (payload) => {
        const response = await POST(createRequest(payload));

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ resultCode: "BAD_REQUEST" });
        expect(supabaseAdmin).not.toHaveBeenCalled();
    });

    it("깨진 JSON 요청에도 400 응답을 반환한다", async () => {
        const response = await POST(new Request("http://localhost/api/v1/set/comment/create", { method: "POST", body: "{" }));

        expect(response.status).toBe(400);
        expect(supabaseAdmin).not.toHaveBeenCalled();
    });

    it("삭제되었거나 존재하지 않는 게시물에는 404를 반환한다", async () => {
        queryResult.error = { code: "23503" };

        const response = await POST(createRequest(validPayload));

        expect(response.status).toBe(404);
        expect(await response.json()).toMatchObject({ resultCode: "NOT_FOUND" });
    });

    it("저장 실패를 등록 성공으로 처리하지 않는다", async () => {
        queryResult.error = { code: "XX000" };

        const response = await POST(createRequest(validPayload));

        expect(response.status).toBe(500);
        expect(await response.json()).toMatchObject({ resultCode: "ERROR" });
    });
});

describe("공개 댓글 조회", () => {
    it.each(["0", "-1", "1abc", "1.5"])("잘못된 게시물 번호 %s를 거부한다", async (idx) => {
        const response = await getDetail(new Request(`http://localhost/api/v1/get/comment/detail/${idx}`));

        expect(response.status).toBe(400);
        expect(supabaseAdmin).not.toHaveBeenCalled();
    });

    it("해당 게시물의 공개 댓글만 조회하고 비밀번호 컬럼은 요청하지 않는다", async () => {
        queryResult.data = [{ idx: 2, ...validPayload }];

        const response = await getDetail(new Request("http://localhost/api/v1/get/comment/detail/1"));
        const columns = (query.select.mock.calls[0][0] as string).split(",").map((column) => column.trim());

        expect(database.from).toHaveBeenCalledWith("comments");
        expect(columns).toContain("msg");
        expect(columns).not.toContain("*");
        expect(columns).not.toContain("password");
        expect(query.eq).toHaveBeenCalledWith("post_id", 1);
        expect(query.or).toHaveBeenCalledWith("is_secret.is.null,is_secret.eq.false");
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ result: queryResult.data, pagination: { totalCount: 1 } });
    });

    it("최신 댓글에서도 비밀댓글을 제외한다", async () => {
        queryResult.data = [];

        const response = await getLatest();

        expect(query.select).toHaveBeenCalledWith("msg, author, created_at, idx");
        expect(query.or).toHaveBeenCalledWith("is_secret.is.null,is_secret.eq.false");
        expect(query.limit).toHaveBeenCalledWith(10);
        expect(response.status).toBe(200);
    });
});

describe("관리자 댓글 조회", () => {
    it("권한이 없으면 service role로 조회하지 않는다", async () => {
        vi.mocked(requireAdmin).mockResolvedValue({ authorized: false, response: apiError("권한이 없습니다.", { status: 403 }) });

        const response = await getManager(new Request("http://localhost/api/v1/get/comment/manager"));

        expect(response.status).toBe(403);
        expect(supabaseAdmin).not.toHaveBeenCalled();
    });

    it("관리자는 권한 검사 후 전체 댓글을 조회할 수 있다", async () => {
        vi.mocked(requireAdmin).mockResolvedValue({ authorized: true, session: { user: { id: "admin-1", email: "admin@example.com", name: "관리자", role: "admin" }, expires: "2099-01-01" } });
        queryResult.data = [];

        const response = await getManager(new Request("http://localhost/api/v1/get/comment/manager"));

        expect(supabaseAdmin).toHaveBeenCalledOnce();
        expect(query.or).not.toHaveBeenCalled();
        expect(query.range).toHaveBeenCalledWith(0, 19);
        expect(response.status).toBe(200);
    });
});
