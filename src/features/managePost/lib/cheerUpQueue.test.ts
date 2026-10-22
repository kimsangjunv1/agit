import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CheerUpQueue } from "./cheerUpQueue";

class MemoryStorage implements Storage {
    values = new Map<string, string>();
    get length() { return this.values.size; }
    clear() { this.values.clear(); }
    getItem(key: string) { return this.values.get(key) ?? null; }
    key(index: number) { return [...this.values.keys()][index] ?? null; }
    removeItem(key: string) { this.values.delete(key); }
    setItem(key: string, value: string) { this.values.set(key, value); }
}

const success = (result: unknown) => new Response(JSON.stringify({ resultCode: "SUCCESS", result }), { status: 200 });
const queues: CheerUpQueue[] = [];
const posted = (send: { mock: { calls: [RequestInfo | URL, RequestInit?][] } }) => send.mock.calls.filter(([, init]) => init?.method === "POST");
const body = (call: [RequestInfo | URL, RequestInit?]) => JSON.parse(String(call[1]?.body));

const makeQueue = (options: ConstructorParameters<typeof CheerUpQueue>[1] = {}) => {
    const queue = new CheerUpQueue("user-a", { storage: new MemoryStorage(), tabId: "tab-a", ...options });
    queues.push(queue);
    queue.start();
    queue.seed(1, 100);
    return queue;
};

describe("CheerUpQueue", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        queues.splice(0).forEach((queue) => queue.stop());
        vi.useRealTimers();
    });

    it("shows 300 clicks immediately and sends their total once after two quiet seconds", async () => {
        const send = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
            const payload = JSON.parse(String(init?.body));
            return success({ batchId: payload.batchId, likes: 400, applied: true, acknowledgedBatchIds: [payload.batchId] });
        });
        const queue = makeQueue({ send });

        for (let index = 0; index < 300; index++) queue.cheer(1);

        expect(queue.getCount(1)).toBe(400);
        await vi.advanceTimersByTimeAsync(1999);
        expect(send).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);

        expect(send).toHaveBeenCalledTimes(1);
        expect(JSON.parse(String(send.mock.calls[0][1]?.body))).toMatchObject({ postId: 1, userId: "user-a", count: 300 });
        expect(queue.getCount(1)).toBe(400);
    });

    it("sends after ten seconds even while clicks continue", async () => {
        const send = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
            const payload = JSON.parse(String(init?.body));
            return success({ batchId: payload.batchId, likes: 100 + payload.count, acknowledgedBatchIds: [payload.batchId] });
        });
        const queue = makeQueue({ send });
        queue.cheer(1);
        for (let index = 0; index < 9; index++) {
            await vi.advanceTimersByTimeAsync(1000);
            queue.cheer(1);
        }
        expect(send).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1000);
        expect(posted(send)).toHaveLength(1);
        expect(body(posted(send)[0]).count).toBe(10);
    });

    it("keeps clicks made during an in-flight batch in a separate immutable batch", async () => {
        let finish!: (response: Response) => void;
        const send = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => {
            if (posted(send).length === 1) return new Promise<Response>((resolve) => { finish = resolve; });
            const payload = JSON.parse(String(init?.body));
            return Promise.resolve(success({ batchId: payload.batchId, likes: 420, acknowledgedBatchIds: [payload.batchId] }));
        });
        const queue = makeQueue({ send });
        for (let index = 0; index < 300; index++) queue.cheer(1);
        await vi.advanceTimersByTimeAsync(2000);
        for (let index = 0; index < 20; index++) queue.cheer(1);

        expect(queue.getCount(1)).toBe(420);
        const first = body(posted(send)[0]);
        finish(success({ batchId: first.batchId, likes: 400, acknowledgedBatchIds: [first.batchId] }));
        await vi.advanceTimersByTimeAsync(0);
        expect(queue.getCount(1)).toBe(420);
        await vi.advanceTimersByTimeAsync(2000);

        expect(posted(send)).toHaveLength(2);
        expect(body(posted(send)[1])).toMatchObject({ count: 20 });
        expect(body(posted(send)[1]).batchId).not.toBe(first.batchId);
        expect(queue.getCount(1)).toBe(420);
    });

    it("keeps one batch ID and a total five-send budget across exits and restoration", async () => {
        const storage = new MemoryStorage();
        const onError = vi.fn();
        const send = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method !== "POST") return success({ likes: 100, acknowledgedBatchIds: [] });
            throw new TypeError("offline");
        });
        const first = makeQueue({ send, storage, onError });
        first.cheer(1);
        await vi.advanceTimersByTimeAsync(3000);
        expect(posted(send)).toHaveLength(2);
        first.stop();

        const restored = makeQueue({ send, storage, onError });
        await vi.advanceTimersByTimeAsync(0);
        restored.flush(1);
        restored.flush(1);
        await vi.advanceTimersByTimeAsync(1999);
        expect(posted(send)).toHaveLength(2);
        await vi.advanceTimersByTimeAsync(1);
        await vi.advanceTimersByTimeAsync(4000);
        await vi.advanceTimersByTimeAsync(8000);
        expect(posted(send)).toHaveLength(5);
        expect(new Set(posted(send).map((call) => body(call).batchId)).size).toBe(1);
        expect(queueCount(restored)).toBe(100);
        expect(onError).toHaveBeenCalledTimes(1);

        restored.stop();
        const exhausted = makeQueue({ send, storage, onError });
        exhausted.flush(1);
        await vi.advanceTimersByTimeAsync(60000);
        expect(posted(send)).toHaveLength(5);
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it("reconciles acknowledged restored batches before adding optimistic increments", async () => {
        const storage = new MemoryStorage();
        let appliedId = "";
        const send = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method === "POST") {
                appliedId = JSON.parse(String(init.body)).batchId;
                throw new TypeError("response lost after commit");
            }
            return success({ likes: 120, acknowledgedBatchIds: [appliedId] });
        });
        const first = makeQueue({ send, storage });
        for (let index = 0; index < 20; index++) first.cheer(1);
        await vi.advanceTimersByTimeAsync(2000);
        first.stop();

        const restored = makeQueue({ send, storage });
        await vi.advanceTimersByTimeAsync(0);
        expect(restored.getCount(1)).toBe(120);
        await vi.advanceTimersByTimeAsync(60000);
        expect(posted(send)).toHaveLength(1);
    });

    it("flushes with keepalive without resending a batch that is already in flight", async () => {
        const send = vi.fn((_url: RequestInfo | URL, _init?: RequestInit) => new Promise<Response>(() => undefined));
        const queue = makeQueue({ send });
        queue.cheer(1);
        queue.flush(1);
        await vi.advanceTimersByTimeAsync(0);
        queue.flush(1);
        queue.flush(1);
        await vi.advanceTimersByTimeAsync(0);
        expect(posted(send)).toHaveLength(1);
        expect(posted(send)[0][1]?.keepalive).toBe(true);
    });

    it("does not retry permanent client errors", async () => {
        const onError = vi.fn();
        const send = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => new Response("forbidden", { status: 403 }));
        const queue = makeQueue({ send, onError });
        queue.cheer(1);
        await vi.advanceTimersByTimeAsync(60000);
        expect(posted(send)).toHaveLength(1);
        expect(queue.getCount(1)).toBe(100);
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it("honors Retry-After on rate limits", async () => {
        const send = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => new Response("slow down", { status: 429, headers: { "Retry-After": "20" } }));
        const queue = makeQueue({ send });
        queue.cheer(1);
        await vi.advanceTimersByTimeAsync(21999);
        expect(posted(send)).toHaveLength(1);
        await vi.advanceTimersByTimeAsync(1);
        expect(posted(send)).toHaveLength(2);
    });

    it("keeps per-tab storage independent while both tabs are active", async () => {
        const storage = new MemoryStorage();
        let total = 100;
        const send = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
            const payload = JSON.parse(String(init?.body));
            total += payload.count;
            return success({ batchId: payload.batchId, likes: total, acknowledgedBatchIds: [payload.batchId] });
        });
        const first = makeQueue({ send, storage, tabId: "tab-a" });
        first.cheer(1);
        const second = makeQueue({ send, storage, tabId: "tab-b" });
        second.cheer(1);
        second.cheer(1);

        expect(first.getCount(1)).toBe(101);
        expect(second.getCount(1)).toBe(102);
        expect([...storage.values.keys()].filter((key) => key.includes(":batch:"))).toHaveLength(2);
        await vi.advanceTimersByTimeAsync(2000);
        expect(posted(send).map((call) => body(call).count).sort()).toEqual([1, 2]);
    });

    it("continues batching when browser storage is unavailable", async () => {
        const storage = new MemoryStorage();
        storage.setItem = () => { throw new DOMException("Quota exceeded"); };
        const send = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
            const payload = JSON.parse(String(init?.body));
            return success({ batchId: payload.batchId, likes: 101, acknowledgedBatchIds: [payload.batchId] });
        });
        const queue = makeQueue({ send, storage });
        expect(() => queue.cheer(1)).not.toThrow();
        await vi.advanceTimersByTimeAsync(2000);
        expect(posted(send)).toHaveLength(1);
        expect(queue.getCount(1)).toBe(101);
    });

    it("ignores an older count response that arrives after a newer batch acknowledgement", async () => {
        let finishRead!: (response: Response) => void;
        const send = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method !== "POST") return new Promise<Response>((resolve) => { finishRead = resolve; });
            const payload = JSON.parse(String(init.body));
            return Promise.resolve(success({ batchId: payload.batchId, likes: 101, acknowledgedBatchIds: [payload.batchId] }));
        });
        const queue = makeQueue({ send });
        queue.cheer(1);
        void queue.reconcile(1);
        await vi.advanceTimersByTimeAsync(2000);
        finishRead(success({ likes: 100, acknowledgedBatchIds: [] }));
        await vi.advanceTimersByTimeAsync(0);
        expect(queue.getCount(1)).toBe(101);
    });

    it("shares mount reads and flushes only when the last control leaves the post", async () => {
        const send = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method !== "POST") return success({ likes: 100, acknowledgedBatchIds: [] });
            const payload = JSON.parse(String(init.body));
            return success({ batchId: payload.batchId, likes: 101, acknowledgedBatchIds: [payload.batchId] });
        });
        const queue = makeQueue({ send });
        const first = queue.watch(1, 100);
        const second = queue.watch(1, 100);
        await vi.advanceTimersByTimeAsync(0);
        expect(send).toHaveBeenCalledTimes(1);
        queue.cheer(1);
        first();
        await vi.advanceTimersByTimeAsync(0);
        expect(posted(send)).toHaveLength(0);
        second();
        await vi.advanceTimersByTimeAsync(0);
        expect(posted(send)).toHaveLength(1);
        expect(queue.getCount(1)).toBe(101);
    });

    it("reconciles an existing queue on account reactivation before replaying uncertain batches", async () => {
        let appliedId = "";
        const send = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method === "POST") {
                appliedId = JSON.parse(String(init.body)).batchId;
                throw new TypeError("response lost");
            }
            return success({ likes: 101, acknowledgedBatchIds: [appliedId] });
        });
        const queue = makeQueue({ send });
        queue.cheer(1);
        await vi.advanceTimersByTimeAsync(2000);
        queue.stop();
        queue.start();
        await vi.advanceTimersByTimeAsync(60000);
        expect(posted(send)).toHaveLength(1);
        expect(queue.getCount(1)).toBe(101);
    });

    it("starts an exiting tab's fresh keepalive send before an asynchronous Web Lock callback", async () => {
        const requestLock = vi.fn(() => new Promise<never>(() => undefined));
        vi.stubGlobal("navigator", { locks: { request: requestLock } });
        try {
            const send = vi.fn((_url: RequestInfo | URL, _init?: RequestInit) => new Promise<Response>(() => undefined));
            const queue = makeQueue({ send });
            queue.cheer(1);
            queue.flush(1);
            expect(posted(send)).toHaveLength(1);
            expect(posted(send)[0][1]?.keepalive).toBe(true);
        } finally { vi.unstubAllGlobals(); }
    });

    it("times out hung requests and still stops at five actual sends", async () => {
        const onError = vi.fn();
        const send = vi.fn((_url: RequestInfo | URL, _init?: RequestInit) => new Promise<Response>(() => undefined));
        const queue = makeQueue({ send, onError });
        queue.cheer(1);
        await vi.advanceTimersByTimeAsync(100000);
        expect(posted(send)).toHaveLength(5);
        expect(queue.getCount(1)).toBe(100);
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it("keepalive-flushes new clicks on exit while an older batch is still in flight", async () => {
        const send = vi.fn((_url: RequestInfo | URL, _init?: RequestInit) => new Promise<Response>(() => undefined));
        const queue = makeQueue({ send });
        for (let index = 0; index < 300; index++) queue.cheer(1);
        await vi.advanceTimersByTimeAsync(2000);
        for (let index = 0; index < 20; index++) queue.cheer(1);
        queue.flush(1);
        expect(posted(send)).toHaveLength(2);
        expect(posted(send).map((call) => body(call).count)).toEqual([300, 20]);
        expect(posted(send).every(([, init]) => init?.keepalive)).toBe(true);
        queue.flush(1);
        expect(posted(send)).toHaveLength(2);
    });

    it("does one final read to recover a committed batch after five lost responses", async () => {
        let appliedId = "";
        const onError = vi.fn();
        const send = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method === "POST") {
                appliedId = JSON.parse(String(init.body)).batchId;
                throw new TypeError("all responses lost");
            }
            return success({ likes: 101, acknowledgedBatchIds: [appliedId] });
        });
        const queue = makeQueue({ send, onError });
        queue.cheer(1);
        await vi.advanceTimersByTimeAsync(60000);
        expect(posted(send)).toHaveLength(5);
        expect(send.mock.calls.filter(([, init]) => init?.method === "GET")).toHaveLength(1);
        expect(queue.getCount(1)).toBe(101);
        expect(onError).not.toHaveBeenCalled();
    });

    it("preserves the remaining retry delay instead of restarting it when leaving", async () => {
        const storage = new MemoryStorage();
        const send = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method !== "POST") return success({ likes: 100, acknowledgedBatchIds: [] });
            throw new TypeError("offline");
        });
        const first = makeQueue({ send, storage });
        first.cheer(1);
        await vi.advanceTimersByTimeAsync(2500);
        first.stop();
        makeQueue({ send, storage });
        await vi.advanceTimersByTimeAsync(499);
        expect(posted(send)).toHaveLength(1);
        await vi.advanceTimersByTimeAsync(1);
        expect(posted(send)).toHaveLength(2);
    });

    it("keeps an aborted old read from changing a reactivated account's count", async () => {
        let finishOld!: (response: Response) => void;
        let reads = 0;
        const send = vi.fn((_url: RequestInfo | URL, _init?: RequestInit) => {
            reads++;
            if (reads === 1) return new Promise<Response>((resolve) => { finishOld = resolve; });
            return Promise.resolve(success({ likes: 200, acknowledgedBatchIds: [] }));
        });
        const queue = makeQueue({ send });
        const leave = queue.watch(1);
        leave();
        queue.stop();
        queue.start();
        queue.watch(1);
        await vi.advanceTimersByTimeAsync(0);
        expect(queue.getCount(1)).toBe(200);
        finishOld(success({ likes: 999, acknowledgedBatchIds: [] }));
        await vi.advanceTimersByTimeAsync(0);
        expect(queue.getCount(1)).toBe(200);
        expect(reads).toBe(2);
    });

    it("reports confirmed server totals without leaking optimistic counts to cache subscribers", async () => {
        const onConfirmed = vi.fn();
        const send = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method !== "POST") return success({ likes: 100, acknowledgedBatchIds: [] });
            const payload = JSON.parse(String(init.body));
            return success({ batchId: payload.batchId, likes: 101, acknowledgedBatchIds: [payload.batchId] });
        });
        const queue = makeQueue({ send, onConfirmed });
        queue.cheer(1);
        expect(onConfirmed).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(2000);
        expect(onConfirmed).toHaveBeenCalledExactlyOnceWith(1, 101);
        await queue.reconcile(1);
        expect(onConfirmed).toHaveBeenCalledTimes(1);
    });

    it("defers a read's counter if a newly sent batch was absent from its acknowledgement query", async () => {
        const reads: ((response: Response) => void)[] = [];
        let finishPost!: (response: Response) => void;
        const send = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method === "POST") return new Promise<Response>((resolve) => { finishPost = resolve; });
            return new Promise<Response>((resolve) => { reads.push(resolve); });
        });
        const queue = makeQueue({ send });
        const firstRead = queue.reconcile(1);
        queue.cheer(1);
        queue.flush(1);
        const payload = body(posted(send)[0]);
        reads[0](success({ likes: 101, acknowledgedBatchIds: [] }));
        await firstRead;
        expect(queue.getCount(1)).toBe(101);
        await vi.advanceTimersByTimeAsync(0);
        expect(reads).toHaveLength(2);
        reads[1](success({ likes: 101, acknowledgedBatchIds: [payload.batchId] }));
        await vi.advanceTimersByTimeAsync(0);
        expect(queue.getCount(1)).toBe(101);
        finishPost(success({ batchId: payload.batchId, likes: 101, acknowledgedBatchIds: [payload.batchId] }));
        await vi.advanceTimersByTimeAsync(20000);
        expect(queue.getCount(1)).toBe(101);
        expect(posted(send)).toHaveLength(1);
    });

    it("defers an older POST snapshot when a later exit batch committed outside its acknowledgement query", async () => {
        const posts: ((response: Response) => void)[] = [];
        let finishRead!: (response: Response) => void;
        const send = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method !== "POST") return new Promise<Response>((resolve) => { finishRead = resolve; });
            return new Promise<Response>((resolve) => { posts.push(resolve); });
        });
        const queue = makeQueue({ send });
        queue.cheer(1);
        queue.flush(1);
        queue.cheer(1);
        queue.flush(1);
        const first = body(posted(send)[0]);
        const second = body(posted(send)[1]);
        posts[0](success({ batchId: first.batchId, likes: 102, acknowledgedBatchIds: [first.batchId] }));
        await vi.advanceTimersByTimeAsync(0);
        expect(queue.getCount(1)).toBe(102);
        expect(finishRead).toBeTypeOf("function");
        finishRead(success({ likes: 102, acknowledgedBatchIds: [first.batchId, second.batchId] }));
        await vi.advanceTimersByTimeAsync(0);
        posts[1](success({ batchId: second.batchId, likes: 101, acknowledgedBatchIds: [second.batchId] }));
        await vi.advanceTimersByTimeAsync(20000);
        expect(queue.getCount(1)).toBe(102);
        expect(posted(send)).toHaveLength(2);
    });

    it("accepts a read snapshot when the only new clicks remain unsent drafts", async () => {
        let finishRead!: (response: Response) => void;
        const send = vi.fn((_url: RequestInfo | URL, _init?: RequestInit) => new Promise<Response>((resolve) => { finishRead = resolve; }));
        const queue = makeQueue({ send });
        const read = queue.reconcile(1);
        queue.cheer(1);
        finishRead(success({ likes: 110, acknowledgedBatchIds: [] }));
        await read;
        expect(queue.getCount(1)).toBe(111);
        expect(send).toHaveBeenCalledTimes(1);
    });

    it("does not apply a detail count while an acknowledged batch still needs a covered base", async () => {
        const posts: ((response: Response) => void)[] = [];
        let finishRead!: (response: Response) => void;
        const send = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method !== "POST") return new Promise<Response>((resolve) => { finishRead = resolve; });
            return new Promise<Response>((resolve) => { posts.push(resolve); });
        });
        const queue = makeQueue({ send });
        queue.cheer(1);
        queue.flush(1);
        queue.cheer(1);
        queue.flush(1);
        const first = body(posted(send)[0]);
        const second = body(posted(send)[1]);
        posts[0](success({ batchId: first.batchId, likes: 102, acknowledgedBatchIds: [first.batchId] }));
        await vi.advanceTimersByTimeAsync(0);
        posts[1](success({ batchId: second.batchId, likes: 101, acknowledgedBatchIds: [second.batchId] }));
        await vi.advanceTimersByTimeAsync(0);
        expect(queue.getCount(1)).toBe(102);
        queue.seed(1, 102);
        expect(queue.getCount(1)).toBe(102);
        finishRead(success({ likes: 102, acknowledgedBatchIds: [first.batchId, second.batchId] }));
        await vi.advanceTimersByTimeAsync(0);
        expect(queue.getCount(1)).toBe(102);
    });

    it("flushes fresh exit clicks while an older restored batch is awaiting reconciliation", () => {
        const storage = new MemoryStorage();
        const first = makeQueue({ storage });
        first.cheer(1);
        first.stop();
        const send = vi.fn((_url: RequestInfo | URL, _init?: RequestInit) => new Promise<Response>(() => undefined));
        const restored = makeQueue({ send, storage, tabId: "tab-b" });
        restored.cheer(1);
        restored.flush(1);
        expect(posted(send)).toHaveLength(1);
        expect(body(posted(send)[0]).count).toBe(1);
    });

    it("queries an externally acknowledged tombstone before dropping its local overlay", async () => {
        const storage = new MemoryStorage();
        let finishRead!: (response: Response) => void;
        const send = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method === "POST") return new Promise<Response>(() => undefined);
            return new Promise<Response>((resolve) => { finishRead = resolve; });
        });
        const queue = makeQueue({ send, storage });
        queue.cheer(1);
        queue.flush(1);
        const payload = body(posted(send)[0]);
        const [key, raw] = [...storage.values].find(([name]) => name.includes(":batch:"))!;
        storage.setItem(key, JSON.stringify({ ...JSON.parse(raw), status: "acknowledged" }));
        queue.stop();
        queue.start();
        const read = send.mock.calls.find(([, init]) => init?.method === "GET")!;
        expect(new URL(String(read[0]), "https://example.test").searchParams.get("batchIds")).toBe(payload.batchId);
        finishRead(success({ likes: 101, acknowledgedBatchIds: [payload.batchId] }));
        await vi.advanceTimersByTimeAsync(0);
        expect(queue.getCount(1)).toBe(101);
        expect(send.mock.calls.filter(([, init]) => init?.method === "GET")).toHaveLength(1);
    });
});

const queueCount = (queue: CheerUpQueue) => queue.getCount(1);
