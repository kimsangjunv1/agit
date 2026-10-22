import { beforeEach, describe, expect, it, vi } from "vitest";

import { findReadablePost } from "@/entities/post/api/postAccess.server";
import { requireSession } from "@/shared/lib/auth/requireSession";
import { apiError } from "@/shared/lib/apiResponse";
import { supabaseAdmin } from "@/shared/lib/supabase/supabaseServer";
import { POST } from "./set/like/increment/route";
import { GET } from "./get/like/count/route";

vi.mock("server-only", () => ({}));
vi.mock("@/entities/post/api/postAccess.server", async (importOriginal) => ({
    ...await importOriginal<typeof import("@/entities/post/api/postAccess.server")>(),
    findReadablePost: vi.fn(),
}));
vi.mock("@/shared/lib/auth/requireSession", () => ({ requireSession: vi.fn() }));
vi.mock("@/shared/lib/authOptions", () => ({ authOptions: {} }));
vi.mock("@/shared/lib/supabase/supabaseServer", () => ({ supabaseAdmin: vi.fn() }));

const userId = "e79c40ca-791b-4819-a35f-e85275b6a1f3";
const batchId = "d2622026-790f-4a45-ab60-18e5524338e1";
const previousBatchId = "d2622026-790f-4a45-ab60-18e5524338e2";
const validPayload = { postId: 1, userId, batchId, count: 300 };
const snapshot = { batchId, likes: 320, applied: true, acknowledgedBatchIds: [batchId] };
const database = { rpc: vi.fn() };
const request = (payload: unknown = validPayload) => new Request("http://localhost/api/v1/set/like/increment", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1, 127.0.0.2" },
    body: JSON.stringify(payload),
});

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireSession).mockResolvedValue({ authorized: true, session: { user: { id: userId, role: "user", email: "reader@example.com", name: "방문자" }, expires: "2099-01-01" } });
    vi.mocked(findReadablePost).mockResolvedValue({ idx: 1, user_id: null, visibility: "public", post_type: "article" });
    vi.mocked(supabaseAdmin).mockReturnValue(database as unknown as ReturnType<typeof supabaseAdmin>);
    database.rpc.mockResolvedValue({ data: snapshot, error: null });
});

describe("Cheer Up 합계 동기화", () => {
    it("세션 사용자의 확인 ID와 합계를 한 번의 RPC snapshot에서 가져온다", async () => {
        const state = { likes: 320, acknowledgedBatchIds: [batchId] };
        database.rpc.mockResolvedValue({ data: state, error: null });

        const response = await GET(new Request(`http://localhost/api/v1/get/like/count?postId=1&batchIds=${batchId},${previousBatchId}`));

        expect(response.status).toBe(200);
        expect(database.rpc).toHaveBeenCalledExactlyOnceWith("get_cheer_up_state", {
            p_post_id: 1, p_user_id: userId, p_batch_ids: [batchId, previousBatchId],
        });
        expect(await response.json()).toMatchObject({ resultCode: "SUCCESS", result: state });
        expect(response.headers.get("Cache-Control")).toContain("private, no-store");
    });

    it("확인할 묶음이 없는 조회도 허용한다", async () => {
        database.rpc.mockResolvedValue({ data: { likes: 20, acknowledgedBatchIds: [] }, error: null });

        expect((await GET(new Request("http://localhost/api/v1/get/like/count?postId=1"))).status).toBe(200);
        expect(database.rpc.mock.calls[0][1].p_batch_ids).toEqual([]);
    });

    it("조회도 로그인하지 않으면 DB에 접근하지 않는다", async () => {
        vi.mocked(requireSession).mockResolvedValue({ authorized: false, response: apiError("로그인이 필요합니다.", { status: 401 }) });

        const response = await GET(new Request("http://localhost/api/v1/get/like/count?postId=1"));
        expect(response.status).toBe(401);
        expect(response.headers.get("Cache-Control")).toContain("private, no-store");
        expect(findReadablePost).not.toHaveBeenCalled();
        expect(database.rpc).not.toHaveBeenCalled();
    });

    it.each([
        "", "postId=0", "postId=-1", "postId=1.5", "postId=1abc", "postId=2147483648",
        "postId=1&batchIds=invalid", `postId=1&batchIds=${batchId},`,
        `postId=1&batchIds=${Array.from({ length: 257 }, () => batchId).join(",")}`,
    ])("잘못된 조회 파라미터를 DB 전에 거부한다: %s", async (params) => {
        const response = await GET(new Request(`http://localhost/api/v1/get/like/count?${params}`));

        expect(response.status).toBe(400);
        expect(database.rpc).not.toHaveBeenCalled();
    });

    it("접근 불가능한 글은 확인 ID와 합계를 노출하지 않는다", async () => {
        vi.mocked(findReadablePost).mockResolvedValue(null);

        expect((await GET(new Request("http://localhost/api/v1/get/like/count?postId=1"))).status).toBe(404);
        expect(database.rpc).not.toHaveBeenCalled();
    });

    it("권한 확인 뒤 접근이 변경되면 RPC의 빈 상태를 404로 반환한다", async () => {
        database.rpc.mockResolvedValue({ data: null, error: null });

        expect((await GET(new Request("http://localhost/api/v1/get/like/count?postId=1"))).status).toBe(404);
    });

    it("합계 조회 실패는 성공으로 표시하지 않는다", async () => {
        database.rpc.mockResolvedValue({ data: null, error: { code: "XX000" } });

        expect((await GET(new Request("http://localhost/api/v1/get/like/count?postId=1"))).status).toBe(500);
    });
});

describe("Cheer Up 묶음 저장", () => {
    it("300회 묶음을 세션 사용자로 전달하고 같은 DB snapshot의 합계와 확인 ID를 반환한다", async () => {
        const response = await POST(request({ ...validPayload, knownBatchIds: [previousBatchId] }));

        expect(response.status).toBe(200);
        expect(database.rpc).toHaveBeenCalledExactlyOnceWith("increment_cheer_up_batch", {
            p_post_id: 1,
            p_batch_id: batchId,
            p_count: 300,
            p_user_id: userId,
            p_ip: "127.0.0.1",
            p_known_batch_ids: [previousBatchId],
        });
        expect(await response.json()).toMatchObject({ resultCode: "SUCCESS", result: snapshot });
        expect(response.headers.get("Cache-Control")).toContain("private, no-store");
    });

    it("이미 저장한 묶음의 재전송은 추가 반영 없이 성공으로 반환한다", async () => {
        database.rpc.mockResolvedValue({ data: { ...snapshot, applied: false }, error: null });

        const response = await POST(request());

        expect(response.status).toBe(200);
        expect((await response.json()).result).toEqual({ ...snapshot, applied: false });
    });

    it("서로 다른 클릭 묶음은 같은 IP와 사용자라도 각각 RPC에 전달한다", async () => {
        expect((await POST(request())).status).toBe(200);
        expect((await POST(request({ ...validPayload, batchId: previousBatchId, count: 20 }))).status).toBe(200);

        expect(database.rpc).toHaveBeenCalledTimes(2);
        expect(database.rpc.mock.calls[1][1]).toMatchObject({ p_batch_id: previousBatchId, p_count: 20, p_user_id: userId, p_ip: "127.0.0.1" });
    });

    it("같은 ID의 내용이 달라 DB가 충돌을 반환하면 409로 안내한다", async () => {
        database.rpc.mockResolvedValue({ data: null, error: { code: "PT409", message: "conflicting batch" } });

        const response = await POST(request());

        expect(response.status).toBe(409);
        expect(await response.json()).toMatchObject({ resultCode: "CONFLICT" });
    });

    it("로그인 전에는 저장소와 게시물에 접근하지 않는다", async () => {
        vi.mocked(requireSession).mockResolvedValue({ authorized: false, response: apiError("로그인이 필요합니다.", { status: 401 }) });

        expect((await POST(request())).status).toBe(401);
        expect(findReadablePost).not.toHaveBeenCalled();
        expect(database.rpc).not.toHaveBeenCalled();
    });

    it("요청의 사용자 ID가 현재 세션과 다르면 저장하지 않는다", async () => {
        const response = await POST(request({ ...validPayload, userId: "another-user" }));

        expect(response.status).toBe(403);
        expect(database.rpc).not.toHaveBeenCalled();
    });

    it.each([
        null, [], {},
        { ...validPayload, postId: "1" },
        { ...validPayload, postId: 0 },
        { ...validPayload, postId: 1.5 },
        { ...validPayload, postId: 2147483648 },
        { ...validPayload, batchId: "invalid" },
        { ...validPayload, count: 0 },
        { ...validPayload, count: -1 },
        { ...validPayload, count: 1.5 },
        { ...validPayload, count: "300" },
        { ...validPayload, count: 2147483648 },
        { ...validPayload, userId: undefined },
        { ...validPayload, knownBatchIds: "invalid" },
        { ...validPayload, knownBatchIds: ["invalid"] },
        { ...validPayload, knownBatchIds: Array.from({ length: 257 }, () => batchId) },
    ])("잘못된 값은 DB에 전달하지 않는다: %j", async (payload) => {
        const response = await POST(request(payload));

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ resultCode: "BAD_REQUEST" });
        expect(database.rpc).not.toHaveBeenCalled();
    });

    it("깨진 JSON은 400으로 응답한다", async () => {
        const response = await POST(new Request("http://localhost/api/v1/set/like/increment", { method: "POST", body: "{" }));

        expect(response.status).toBe(400);
        expect(database.rpc).not.toHaveBeenCalled();
    });

    it("다른 사용자의 비공개 글과 삭제된 글에는 저장하지 않는다", async () => {
        vi.mocked(findReadablePost).mockResolvedValue(null);

        expect((await POST(request())).status).toBe(404);
        expect(findReadablePost).toHaveBeenCalledWith(1, userId);
        expect(database.rpc).not.toHaveBeenCalled();
    });

    it("RPC 실행 중 게시물 공개 범위가 바뀌어도 404로 응답한다", async () => {
        database.rpc.mockResolvedValue({ data: null, error: { code: "PT404" } });

        expect((await POST(request())).status).toBe(404);
    });

    it("서버 저장 실패를 성공으로 응답하지 않는다", async () => {
        database.rpc.mockResolvedValue({ data: null, error: { code: "XX000" } });

        expect((await POST(request())).status).toBe(500);
    });

    it("DB 카운트 범위를 넘는 요청은 충돌로 응답한다", async () => {
        database.rpc.mockResolvedValue({ data: null, error: { code: "22003" } });

        expect((await POST(request())).status).toBe(409);
    });
});
