import bcrypt from "bcrypt";
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
import { findReadablePost } from "@/entities/post/api/postAccess.server";

vi.mock("@/entities/post/api/postAccess.server", async (importOriginal) => ({
    ...await importOriginal<typeof import("@/entities/post/api/postAccess.server")>(),
    findReadablePost: vi.fn(),
}));

vi.mock("bcrypt", () => ({ default: { hash: vi.fn(async () => "stored-hash"), compare: vi.fn(async () => true) } }));
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
    is: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    then: (resolve: (value: typeof queryResult) => unknown) => {
        const range = query.range.mock.lastCall;
        const data = range && Array.isArray(queryResult.data) ? queryResult.data.slice(range[0], range[1] + 1) : queryResult.data;
        return Promise.resolve({ ...queryResult, data }).then(resolve);
    },
};
const database = { from: vi.fn(() => query), rpc: vi.fn(async (name: string, _params?: Record<string, unknown>) => ({ data: name === "create_comment" ? { idx: 1, duplicate: false } : true, error: name === "create_comment" ? queryResult.error : null })) };

const createRequest = (payload: unknown) =>
    new Request("http://localhost/api/v1/set/comment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
const validPayload = { post_id: 1, author: "방문자", msg: "잘 읽었어요.", password: "secret123", profile: 1, emoji_id: "heart", request_id: "550e8400-e29b-41d4-a716-446655440000" };

beforeEach(() => {
    vi.clearAllMocks();
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
    vi.stubEnv("NEXTAUTH_SECRET", "comment-test-secret");
    queryResult = { data: null, error: null, count: 0 };
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(findReadablePost).mockResolvedValue({ idx: 1, user_id: null, visibility: "public", post_type: "article" });
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
        expect(database.rpc).toHaveBeenCalledWith("create_comment", expect.objectContaining({ p_post_id: 1, p_author: "방문자", p_msg: "잘 읽었어요.", p_is_admin: false, p_password_hash: "stored-hash" }));
        expect(await response.json()).toMatchObject({ resultCode: "SUCCESS", result: null });
    });

    it("관리자 표시는 서버에서 확인한 세션으로 결정한다", async () => {
        vi.mocked(getServerSession).mockResolvedValue({ user: { id: "admin-1", email: "admin@example.com", name: "관리자", role: "admin" }, expires: "2099-01-01" });

        await POST(createRequest({ ...validPayload, is_admin: false }));

        expect(database.rpc).toHaveBeenCalledWith("create_comment", expect.objectContaining({ p_author: "관리자", p_user_id: "admin-1", p_is_admin: true, p_password_hash: null, p_emoji_id: null }));
    });

    it("일반 로그인 사용자가 관리자 표시를 위조할 수 없다", async () => {
        vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1", email: "user@example.com", name: "사용자", role: "user" }, expires: "2099-01-01" });

        await POST(createRequest({ ...validPayload, is_admin: true }));

        expect(database.rpc).toHaveBeenCalledWith("create_comment", expect.objectContaining({ p_author: "사용자", p_user_id: "user-1", p_is_admin: false }));
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
        expect(database.rpc).toHaveBeenCalledWith("create_comment", expect.objectContaining({ p_post_id: 1, p_author: author, p_msg: msg }));
    });

    it("UTF-16 길이가 길어도 보이는 10글자의 이모지는 등록할 수 있다", async () => {
        const author = "👨‍👩‍👧‍👦".repeat(COMMENT_AUTHOR_MAX_LENGTH);

        const response = await POST(createRequest({ ...validPayload, author }));

        expect(response.status).toBe(201);
        expect(database.rpc).toHaveBeenCalledWith("create_comment", expect.objectContaining({ p_author: author, p_is_admin: false }));
    });

    it("서버에서 인증된 관리자의 운영진 닉네임은 허용한다", async () => {
        vi.mocked(getServerSession).mockResolvedValue({ user: { id: "admin-1", email: "admin@example.com", name: "관리자", role: "admin" }, expires: "2099-01-01" });

        const response = await POST(createRequest({ ...validPayload, author: "관리자" }));

        expect(response.status).toBe(201);
        expect(database.rpc).toHaveBeenCalledWith("create_comment", expect.objectContaining({ p_author: "관리자", p_is_admin: true }));
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
    it("접근할 수 없는 비공개 글의 댓글은 조회하지 않는다", async () => {
        vi.mocked(findReadablePost).mockResolvedValue(null);
        const response = await getDetail(new Request("http://localhost/api/v1/get/comment/detail/1"));
        expect(response.status).toBe(404);
        expect(supabaseAdmin).not.toHaveBeenCalled();
    });

    it("비공개 글에 직접 댓글을 등록하는 요청도 차단한다", async () => {
        vi.mocked(findReadablePost).mockResolvedValue(null);
        const response = await POST(createRequest(validPayload));
        expect(response.status).toBe(404);
        expect(query.insert).not.toHaveBeenCalled();
    });
    it.each(["0", "-1", "1abc", "1.5"])("잘못된 게시물 번호 %s를 거부한다", async (idx) => {
        const response = await getDetail(new Request(`http://localhost/api/v1/get/comment/detail/${idx}`));

        expect(response.status).toBe(400);
        expect(supabaseAdmin).not.toHaveBeenCalled();
    });

    it("해당 게시물의 공개 댓글만 조회하고 비밀번호 컬럼은 요청하지 않는다", async () => {
        queryResult.data = [{ idx: 2, ...validPayload }];
        queryResult.count = 1;

        const response = await getDetail(new Request("http://localhost/api/v1/get/comment/detail/1"));
        const columns = (query.select.mock.calls[0][0] as string).split(",").map((column) => column.trim());

        expect(database.from).toHaveBeenCalledWith("comment_threads");
        expect(columns).toContain("msg");
        expect(columns).not.toContain("*");
        expect(columns).not.toContain("password");
        expect(query.eq).toHaveBeenCalledWith("post_id", 1);
        expect(query.or).toHaveBeenCalledWith("is_secret.is.null,is_secret.eq.false");
        expect(query.range).toHaveBeenCalledWith(0, 9);
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ result: [{ idx: 2, author: "방문자", msg: "잘 읽었어요.", can_manage: false }], pagination: { totalCount: 1, commentTotalCount: 1 } });
    });

    it.each([
        { page: 1, start: 1, length: 10, hasNext: true },
        { page: 2, start: 11, length: 10, hasNext: true },
        { page: 3, start: 21, length: 3, hasNext: false },
        { page: 4, start: 24, length: 0, hasNext: false },
    ])("댓글 $page 페이지는 10개 이하로 반환하고 전체 개수를 유지한다", async ({ page, start, length, hasNext }) => {
        queryResult.data = Array.from({ length: 23 }, (_, index) => ({ idx: index + 1, ...validPayload }));
        queryResult.count = 23;

        const response = await getDetail(new Request(`http://localhost/api/v1/get/comment/detail/1?page=${page}&pageSize=100`));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.result.map((comment: { idx: number }) => comment.idx)).toEqual(Array.from({ length }, (_, index) => start + index));
        expect(body.pagination).toMatchObject({ page, pageSize: 10, totalCount: 23, totalPages: 3, hasNext });
        expect(query.or).toHaveBeenCalledWith("is_secret.is.null,is_secret.eq.false");
        expect(response.headers.get("Cache-Control")).toContain("private, no-store");
    });

    it.each(["0", "-1", "1.5", "1abc", "NaN", "9007199254740991"])("잘못된 댓글 페이지 %s는 조회 전에 거부한다", async (page) => {
        const response = await getDetail(new Request(`http://localhost/api/v1/get/comment/detail/1?page=${page}`));

        expect(response.status).toBe(400);
        expect(supabaseAdmin).not.toHaveBeenCalled();
    });

    it("댓글이 없으면 다음 페이지를 요청하지 않게 한다", async () => {
        queryResult.data = [];

        const response = await getDetail(new Request("http://localhost/api/v1/get/comment/detail/1"));

        expect(await response.json()).toMatchObject({ result: [], pagination: { page: 1, pageSize: 10, totalCount: 0, hasNext: false } });
    });

    it("최신 댓글에서도 비밀댓글을 제외한다", async () => {
        queryResult.data = [];

        const response = await getLatest();

        expect(query.select).toHaveBeenCalledWith("msg, author, created_at, idx, posts!inner(idx)");
        expect(query.eq).toHaveBeenCalledWith("posts.visibility", "public");
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
        expect(query.or).toHaveBeenCalledWith("visibility.eq.public,and(visibility.eq.private,user_id.eq.admin-1)", { referencedTable: "posts" });
        expect(query.range).toHaveBeenCalledWith(0, 19);
        expect(response.status).toBe(200);
    });
});

 describe("댓글 보완 등록 정책", () => {
    it.each([{ password: undefined }, { password: "123" }, { password: "가".repeat(25) }, { profile: 99 }, { emoji_id: "unknown" }, { request_id: undefined }])("필수 비회원 정보를 확인한다 %j", async (patch) => {
        expect((await POST(createRequest({ ...validPayload, ...patch }))).status).toBe(400);
    });
    it.each(["til", "diary"])("%s에는 직접 등록하지 못한다", async (post_type) => {
        vi.mocked(findReadablePost).mockResolvedValue({ idx: 1, user_id: null, visibility: "public", post_type });
        expect((await POST(createRequest(validPayload))).status).toBe(403);
    });
    it("광고 문구는 서버에서도 차단한다", async () => {
        expect((await POST(createRequest({ ...validPayload, msg: "카지노 가입머니 지급" }))).status).toBe(400);
    });
});

describe("댓글 등록 멱등성과 요청 제한", () => {
    it("요청 한도에 걸리면 비밀번호 해시 연산을 시작하지 않는다", async () => {
        database.rpc.mockResolvedValueOnce({ data: false as never, error: null });
        expect((await POST(createRequest(validPayload))).status).toBe(429);
        expect(bcrypt.hash).not.toHaveBeenCalled();
    });
    it("같은 요청을 재전송하면 해시·쓰기 한도를 다시 소비하지 않는다", async () => {
        await POST(createRequest(validPayload));
        const args = database.rpc.mock.calls.find(([name]) => name === "create_comment");
        const fingerprint = (args as unknown as [string, { p_request_fingerprint: string }])[1].p_request_fingerprint;
        query.maybeSingle.mockResolvedValueOnce({ data: { request_fingerprint: fingerprint } as never, error: null });
        vi.mocked(bcrypt.hash).mockClear();
        database.rpc.mockClear();
        expect((await POST(createRequest(validPayload))).status).toBe(201);
        expect(bcrypt.hash).not.toHaveBeenCalled();
        expect(database.rpc).not.toHaveBeenCalled();
    });
    it("동일 ID의 다른 내용은 충돌로 처리한다", async () => {
        query.maybeSingle.mockResolvedValueOnce({ data: { request_fingerprint: "different" } as never, error: null });
        expect((await POST(createRequest(validPayload))).status).toBe(409);
        expect(database.rpc).not.toHaveBeenCalled();
    });
    it("DB 원자적 요청 제한도 429로 전달한다", async () => {
        queryResult.error = { code: "PT429" };
        expect((await POST(createRequest(validPayload))).status).toBe(429);
    });
    it("다른 게시물 답글이나 삭제 대상은 DB 검증 실패로 반환한다", async () => {
        queryResult.error = { code: "22023" };
        expect((await POST(createRequest({ ...validPayload, parent_id: 2 }))).status).toBe(400);
    });
});
