import { beforeEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { supabaseAdmin, supabaseServer } from "@/shared/lib/supabase/supabaseServer";
import { DELETE, GET, PATCH, POST } from "./route";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/shared/lib/authOptions", () => ({ authOptions: {} }));
vi.mock("@/shared/lib/supabase/supabaseServer", () => ({ supabaseAdmin: vi.fn(), supabaseServer: vi.fn() }));

const payload = { code: "reading", title: "독서", sort_no: 3 };
const query = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [payload], error: null }).then(resolve),
};
const database = { from: vi.fn(() => query) };
const request = (method: string, body: unknown = payload) => new Request("http://localhost/api/v1/post-types", { method, body: JSON.stringify(body) });
const login = (role = "admin") => vi.mocked(getServerSession).mockResolvedValue({ user: { id: "owner", role }, expires: "2099-01-01" } as any);

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(supabaseAdmin).mockReturnValue(database as unknown as ReturnType<typeof supabaseAdmin>);
    vi.mocked(supabaseServer).mockResolvedValue(database as unknown as Awaited<ReturnType<typeof supabaseServer>>);
    query.maybeSingle.mockResolvedValue({ data: payload, error: null });
});

describe("글 종류 관리", () => {
    it("비회원도 정렬된 목록을 읽을 수 있다", async () => {
        const response = await GET();
        expect(response.status).toBe(200);
        expect((await response.json()).result).toEqual([payload]);
        expect(query.order.mock.calls.map(([column]) => column)).toEqual(["sort_no", "created_at", "code"]);
        expect(response.headers.get("Cache-Control")).toBe("no-store");
    });

    it.each([
        ["POST", POST],
        ["PATCH", PATCH],
        ["DELETE", DELETE],
    ] as const)("비회원과 일반 회원은 %s 요청을 보낼 수 없다", async (method, handler) => {
        expect((await handler(request(method))).status).toBe(401);
        login("user");
        expect((await handler(request(method))).status).toBe(403);
        expect(database.from).not.toHaveBeenCalled();
    });

    it("관리자만 종류를 추가하며 전달받은 필드를 제한한다", async () => {
        login();
        expect((await POST(request("POST", { ...payload, title: " 독서 ", user_id: "forged", created_at: "forged" }))).status).toBe(200);
        expect(query.insert).toHaveBeenCalledWith(payload);
    });

    it("수정은 주소 이름을 유지하고 표시명과 순서만 바꾼다", async () => {
        login();
        expect((await PATCH(request("PATCH", { ...payload, created_at: "forged" }))).status).toBe(200);
        expect(query.update).toHaveBeenCalledWith({ title: "독서", sort_no: 3 });
        expect(query.eq).toHaveBeenCalledWith("code", "reading");
    });

    it.each([
        { ...payload, code: "all" },
        { ...payload, code: "invalid.type" },
        { ...payload, title: "  " },
        { ...payload, sort_no: -1 },
        { ...payload, sort_no: 1.5 },
    ])("잘못된 종류 정보는 저장하지 않는다", async (body) => {
        login();
        expect((await POST(request("POST", body))).status).toBe(400);
        expect(database.from).not.toHaveBeenCalled();
    });

    it("기본 일반 글 종류는 삭제할 수 없다", async () => {
        login();
        expect((await DELETE(request("DELETE", { code: "article" }))).status).toBe(409);
        expect(database.from).not.toHaveBeenCalled();
    });

    it.each(["23503", "23001"])("사용 중인 종류의 삭제(%s)와 중복된 주소 이름은 충돌로 안내한다", async (code) => {
        login();
        query.maybeSingle.mockResolvedValue({ data: null, error: { code } });
        const response = await DELETE(request("DELETE"));
        expect(response.status).toBe(409);
        expect((await response.json()).resultMessage).toContain("임시저장");
        query.maybeSingle.mockResolvedValue({ data: null, error: { code: "23505" } });
        expect((await POST(request("POST"))).status).toBe(409);
    });

    it("사용하지 않는 종류는 삭제하고 없는 종류는 404를 반환한다", async () => {
        login();
        expect((await DELETE(request("DELETE"))).status).toBe(200);
        expect(query.eq).toHaveBeenCalledWith("code", "reading");
        query.maybeSingle.mockResolvedValue({ data: null, error: null });
        expect((await PATCH(request("PATCH"))).status).toBe(404);
        expect((await DELETE(request("DELETE"))).status).toBe(404);
    });
});
