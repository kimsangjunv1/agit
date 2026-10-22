import type { CheerUpPayload, CheerUpResult, CheerUpState } from "@/entities/post/model/cheerUp.type";
import type { ApiResponse } from "@/shared/model/common.type";

const DEBOUNCE_MS = 2000;
const MAX_WAIT_MS = 10000;
const MAX_ATTEMPTS = 5;
const MAX_BATCH_COUNT = 1_000_000;
const LEASE_MS = 30000;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const PREFIX = "cheer-up:v1:";

type Batch = {
    version: 1;
    key: string;
    userId: string;
    postId: number;
    batchId: string;
    count: number;
    firstClickAt: number;
    lastClickAt: number;
    attempts: number;
    nextAttemptAt: number;
    status: "draft" | "pending" | "failed" | "acknowledged";
    ownerId: string;
    leaseUntil: number;
    notified: boolean;
    awaitingReconcile?: boolean;
    awaitingBase?: boolean;
};

type PostState = { serverCount?: number; confirmedCount?: number; hasCheered: boolean; watchers: number; sentBatchIds: Set<string>; request?: symbol };
type QueueOptions = { storage?: Storage; tabId?: string; send?: typeof fetch; onError?: () => void; onConfirmed?: (postId: number, likes: number) => void };

class RequestError extends Error {
    constructor(readonly status: number, readonly retryAfter = 0) { super(`Cheer Up request failed (${status})`); }
}

const browserStorage = () => {
    try { return typeof window === "undefined" ? undefined : window.localStorage; } catch { return undefined; }
};

/** Shared by all Cheer Up controls for one signed-in user or one browser guest. */
export class CheerUpQueue {
    private readonly storage?: Storage;
    private readonly tabId: string;
    private readonly send: typeof fetch;
    private readonly onError?: () => void;
    private onConfirmed?: (postId: number, likes: number) => void;
    private posts = new Map<number, PostState>();
    private batches = new Map<string, Batch>();
    private listeners = new Set<() => void>();
    private timers = new Map<number, ReturnType<typeof setTimeout>>();
    private controllers = new Set<AbortController>();
    private inFlight = new Set<string>();
    private reads = new Map<number, Promise<void>>();
    private refreshNeeded = new Set<number>();
    private restoring = new Set<number>();
    private recoveryTimer?: ReturnType<typeof setTimeout>;
    private active = false;
    private version = 0;
    private epoch = 0;

    constructor(readonly userId: string, options: QueueOptions = {}) {
        this.storage = options.storage ?? browserStorage();
        // A copied browser tab can inherit sessionStorage, so ownership uses a fresh runtime UUID.
        this.tabId = options.tabId ?? crypto.randomUUID();
        this.send = options.send ?? ((input, init) => fetch(input, init));
        this.onError = options.onError;
        this.onConfirmed = options.onConfirmed;
    }

    subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
    getVersion = () => this.version;
    setOnConfirmed(callback: (postId: number, likes: number) => void) { this.onConfirmed = callback; }
    private emit() { this.version++; this.listeners.forEach((listener) => listener()); }

    private post(postId: number) {
        let post = this.posts.get(postId);
        if (!post) {
            post = { hasCheered: false, watchers: 0, sentBatchIds: new Set() };
            try { post.hasCheered = this.storage?.getItem(`${PREFIX}${encodeURIComponent(this.userId)}:cheered:${postId}`) === "1"; } catch { /* Optional visual state. */ }
            this.posts.set(postId, post);
        }
        return post;
    }

    private records(postId: number) { return [...this.batches.values()].filter((batch) => batch.postId === postId); }
    private save(batch: Batch) {
        try {
            const { awaitingReconcile, awaitingBase, ...record } = batch;
            this.storage?.setItem(batch.key, JSON.stringify(record));
        } catch { /* Storage failures must not block delivery. */ }
    }
    private read(key: string): Batch | undefined {
        try {
            const raw = this.storage?.getItem(key);
            if (!raw) return undefined;
            const value = JSON.parse(raw) as Batch;
            if (value.version !== 1 || value.userId !== this.userId || value.key !== key || !Number.isSafeInteger(value.postId) || value.postId <= 0
                || typeof value.batchId !== "string" || !Number.isInteger(value.count) || value.count <= 0 || value.count > MAX_BATCH_COUNT
                || !Number.isInteger(value.attempts) || value.attempts < 0 || value.attempts > MAX_ATTEMPTS
                || !["draft", "pending", "failed", "acknowledged"].includes(value.status)
                || !Number.isFinite(value.nextAttemptAt) || !Number.isFinite(value.firstClickAt) || !Number.isFinite(value.lastClickAt)
                || !Number.isFinite(value.leaseUntil) || typeof value.ownerId !== "string") return undefined;
            return value;
        } catch { return undefined; }
    }

    start() {
        if (this.active) return;
        this.active = true;
        this.epoch++;
        this.restore(true);
        if (typeof window !== "undefined") {
            window.addEventListener("focus", this.onAttention);
            window.addEventListener("online", this.onAttention);
            window.addEventListener("pagehide", this.onExit);
            window.addEventListener("storage", this.onStorage);
            document.addEventListener("visibilitychange", this.onVisibility);
        }
        this.posts.forEach((_post, postId) => this.schedule(postId));
    }

    stop() {
        if (!this.active) return;
        this.active = false;
        this.epoch++;
        this.timers.forEach(clearTimeout);
        this.timers.clear();
        clearTimeout(this.recoveryTimer);
        this.controllers.forEach((controller) => controller.abort());
        this.controllers.clear();
        const interrupted = new Set(this.inFlight);
        this.inFlight.clear();
        this.reads.clear();
        this.refreshNeeded.clear();
        this.restoring.clear();
        this.posts.forEach((post) => { post.request = undefined; });
        this.batches.forEach((batch) => {
            if (batch.ownerId !== this.tabId || batch.status === "acknowledged") return;
            const saved = this.read(batch.key);
            if (saved && (saved.ownerId !== this.tabId || saved.status === "acknowledged")) return;
            batch.leaseUntil = 0;
            if (interrupted.has(batch.batchId) && batch.attempts > 0 && batch.status === "pending") batch.nextAttemptAt = Math.max(batch.nextAttemptAt, Date.now() + this.backoff(batch.attempts));
            this.save(batch);
        });
        if (typeof window !== "undefined") {
            window.removeEventListener("focus", this.onAttention);
            window.removeEventListener("online", this.onAttention);
            window.removeEventListener("pagehide", this.onExit);
            window.removeEventListener("storage", this.onStorage);
            document.removeEventListener("visibilitychange", this.onVisibility);
        }
    }

    watch(postId: number, serverCount?: number) {
        if (serverCount !== undefined) this.seed(postId, serverCount);
        const post = this.post(postId);
        post.watchers++;
        if (post.watchers === 1) void this.reconcile(postId);
        return () => {
            post.watchers = Math.max(0, post.watchers - 1);
            if (!post.watchers) this.flush(postId);
        };
    }

    seed(postId: number, count: number) {
        if (!Number.isSafeInteger(postId) || postId <= 0 || !Number.isFinite(count) || count < 0) return;
        const post = this.post(postId);
        // Detail responses lack batch acknowledgements and cannot replace a pending overlay.
        if (post.serverCount !== undefined && this.records(postId).some((batch) => batch.status === "draft" || batch.status === "pending" || batch.awaitingBase)) return;
        const next = Math.max(post.serverCount ?? 0, count);
        if (post.serverCount !== next) { post.serverCount = next; this.emit(); }
    }

    getCount(postId: number, fallback = 0) {
        return (this.posts.get(postId)?.serverCount ?? fallback) + this.records(postId)
            .filter((batch) => ((batch.status === "draft" || batch.status === "pending") && !batch.awaitingReconcile) || (batch.status === "acknowledged" && batch.awaitingBase))
            .reduce((sum, batch) => sum + batch.count, 0);
    }
    hasCheered(postId: number) { return this.posts.get(postId)?.hasCheered ?? false; }

    cheer(postId: number) {
        if (!this.active || !Number.isSafeInteger(postId) || postId <= 0) return false;
        const now = Date.now();
        let draft = this.records(postId).find((batch) => batch.status === "draft" && batch.ownerId === this.tabId && batch.count < MAX_BATCH_COUNT);
        if (draft) {
            const saved = this.read(draft.key);
            if (saved && (saved.status !== "draft" || (saved.ownerId !== this.tabId && saved.leaseUntil > now))) {
                this.batches.set(draft.batchId, { ...saved, awaitingReconcile: true });
                draft = undefined;
            }
        }
        if (!draft) {
            const batchId = crypto.randomUUID();
            draft = {
                version: 1, key: `${PREFIX}${encodeURIComponent(this.userId)}:batch:${this.tabId}:${batchId}`, userId: this.userId,
                postId, batchId, count: 0, firstClickAt: now, lastClickAt: now, attempts: 0, nextAttemptAt: now,
                status: "draft", ownerId: this.tabId, leaseUntil: now + LEASE_MS, notified: false,
            };
            this.batches.set(batchId, draft);
        }
        draft.count++;
        draft.lastClickAt = now;
        draft.leaseUntil = now + LEASE_MS;
        this.save(draft);
        const post = this.post(postId);
        if (!post.hasCheered) {
            post.hasCheered = true;
            try { this.storage?.setItem(`${PREFIX}${encodeURIComponent(this.userId)}:cheered:${postId}`, "1"); } catch { /* Optional visual state. */ }
        }
        this.emit();
        this.schedule(postId);
        return true;
    }

    /** Exit flushes never bypass a retry's existing backoff or five-send budget. */
    flush(postId?: number) {
        if (!this.active) return;
        const fresh: Batch[] = [];
        this.batches.forEach((batch) => {
            if ((postId === undefined || batch.postId === postId) && batch.status === "draft" && batch.ownerId === this.tabId) {
                batch.status = "pending";
                batch.nextAttemptAt = Date.now();
                this.save(batch);
                fresh.push(batch);
            }
        });
        if (postId === undefined) this.posts.forEach((_post, id) => { void this.drain(id); });
        else void this.drain(postId);
        // A new batch must be dispatched before page termination even while an older request is pending.
        fresh.forEach((batch) => { if (!this.inFlight.has(batch.batchId)) void this.drain(batch.postId, batch.batchId); });
    }
    private dueAt(batch: Batch) { return batch.status === "draft" ? Math.min(batch.lastClickAt + DEBOUNCE_MS, batch.firstClickAt + MAX_WAIT_MS) : batch.nextAttemptAt; }
    private backoff(attempt: number) { return 1000 * 2 ** Math.max(0, attempt - 1); }

    private schedule(postId: number) {
        clearTimeout(this.timers.get(postId));
        this.timers.delete(postId);
        if (!this.active || this.post(postId).request || this.restoring.has(postId)) return;
        const eligible = this.records(postId).filter((batch) => batch.ownerId === this.tabId && !this.inFlight.has(batch.batchId) && (batch.status === "draft" || batch.status === "pending"));
        if (!eligible.length) return;
        const due = Math.min(...eligible.map((batch) => this.dueAt(batch)));
        this.timers.set(postId, setTimeout(() => { this.timers.delete(postId); void this.drain(postId); }, Math.max(0, due - Date.now())));
    }
    private fail(batch: Batch) {
        batch.status = "failed";
        this.save(batch);
        this.emit();
        const epoch = this.epoch;
        void this.reconcile(batch.postId).finally(() => {
            if (!this.active || this.epoch !== epoch || batch.status === "acknowledged" || batch.notified) return;
            batch.notified = true;
            this.save(batch);
            this.onError?.();
        });
    }
    private async withBatchLock(batch: Batch, work: () => Promise<void>) {
        // Fresh locally-created batches have a unique owner. Starting fetch synchronously matters on pagehide.
        const freshOwned = batch.attempts === 0 && batch.key.includes(`:batch:${this.tabId}:`);
        if (!freshOwned && typeof navigator !== "undefined" && navigator.locks?.request) await navigator.locks.request(`${PREFIX}${this.userId}:${batch.batchId}`, work);
        else await work();
    }

    private async drain(postId: number, exitBatchId?: string) {
        const post = this.post(postId);
        if (!this.active || (post.request && !exitBatchId) || (this.restoring.has(postId) && !exitBatchId)) return;
        const batch = this.records(postId).find((item) => item.ownerId === this.tabId && !this.inFlight.has(item.batchId)
            && (item.status === "draft" || item.status === "pending") && this.dueAt(item) <= Date.now()
            && (!exitBatchId || (item.batchId === exitBatchId && item.attempts === 0)));
        if (!batch) { this.schedule(postId); return; }
        const token = Symbol();
        const epoch = this.epoch;
        if (!post.request) post.request = token;
        this.inFlight.add(batch.batchId);
        clearTimeout(this.timers.get(postId));
        try {
            await this.withBatchLock(batch, async () => {
                if (!this.active || epoch !== this.epoch) return;
                const saved = this.read(batch.key);
                if (saved?.status === "acknowledged") {
                    batch.awaitingBase = true;
                    batch.status = "acknowledged";
                    this.emit();
                    void this.reconcile(postId);
                    return;
                }
                if (saved && saved.ownerId !== this.tabId && saved.leaseUntil > Date.now()) {
                    this.batches.delete(batch.batchId);
                    this.restore();
                    return;
                }
                if (saved) {
                    batch.attempts = Math.max(batch.attempts, saved.attempts);
                    batch.nextAttemptAt = Math.max(batch.nextAttemptAt, saved.nextAttemptAt);
                    if (saved.status === "failed") { batch.status = "failed"; batch.notified = saved.notified; return; }
                    if (saved.status === "pending") { batch.count = saved.count; batch.status = "pending"; }
                }
                if (batch.attempts >= MAX_ATTEMPTS) { this.fail(batch); return; }
                if (batch.attempts > 0 && batch.nextAttemptAt > Date.now()) return;
                batch.status = "pending";
                batch.attempts++;
                batch.ownerId = this.tabId;
                batch.leaseUntil = Date.now() + LEASE_MS;
                this.save(batch);
                const payload: CheerUpPayload = { postId, userId: this.userId, batchId: batch.batchId, count: batch.count, knownBatchIds: this.knownIds(postId).slice(0, 256) };
                post.sentBatchIds.add(batch.batchId);
                try {
                    const state = await this.request<CheerUpResult>("/api/v1/set/like/increment", { method: "POST", body: JSON.stringify(payload), keepalive: true, headers: { "Content-Type": "application/json" } });
                    if (!this.active || epoch !== this.epoch) return;
                    this.apply(postId, state, [...(payload.knownBatchIds ?? []), batch.batchId]);
                    if (batch.status === "pending") throw new RequestError(502);
                } catch (error) {
                    if (!this.active || epoch !== this.epoch) return;
                    if (this.batches.get(batch.batchId)?.status === "acknowledged") return;
                    const permanent = error instanceof RequestError && error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429;
                    if (permanent || batch.attempts >= MAX_ATTEMPTS) this.fail(batch);
                    else {
                        batch.nextAttemptAt = Date.now() + Math.max(this.backoff(batch.attempts), error instanceof RequestError ? error.retryAfter : 0);
                        batch.leaseUntil = Math.max(Date.now() + LEASE_MS, batch.nextAttemptAt + LEASE_MS);
                        this.save(batch);
                    }
                }
            });
        } finally {
            if (epoch === this.epoch) {
                this.inFlight.delete(batch.batchId);
                if (post.request === token) post.request = undefined;
                this.schedule(postId);
            }
        }
    }

    private knownIds(postId: number) {
        return this.records(postId).filter((batch) => batch.status !== "acknowledged" || batch.awaitingBase)
            .sort((a, b) => Number(a.status === "failed") - Number(b.status === "failed")).map((batch) => batch.batchId);
    }
    private apply(postId: number, state: CheerUpState, queriedIds: string[]) {
        const post = this.post(postId);
        const covered = new Set([...queriedIds, ...state.acknowledgedBatchIds]);
        // A response may include a later commit whose ID was absent from its acknowledgement query.
        // Confirm delivery immediately, but keep its overlay until a complete snapshot supplies the base.
        const incomplete = [...post.sentBatchIds].some((id) => !covered.has(id));
        const previousConfirmed = post.confirmedCount;
        if (!incomplete) {
            post.serverCount = Math.max(post.serverCount ?? 0, state.likes);
            post.confirmedCount = Math.max(previousConfirmed ?? 0, state.likes);
        }
        const acknowledged = new Set(state.acknowledgedBatchIds);
        this.records(postId).forEach((batch) => {
            if (!acknowledged.has(batch.batchId)) return;
            batch.awaitingBase = incomplete && (batch.status !== "acknowledged" || Boolean(batch.awaitingBase));
            batch.status = "acknowledged";
            batch.awaitingReconcile = false;
            if (!batch.awaitingBase) post.sentBatchIds.delete(batch.batchId);
            this.save(batch);
        });
        this.emit();
        if (!incomplete && previousConfirmed !== post.confirmedCount) this.onConfirmed?.(postId, post.confirmedCount!);
        if (incomplete) this.requestRefresh(postId);
    }

    private requestRefresh(postId: number) {
        this.refreshNeeded.add(postId);
        if (this.reads.has(postId)) return;
        queueMicrotask(() => {
            if (this.active && this.refreshNeeded.has(postId) && !this.reads.has(postId)) void this.reconcile(postId);
        });
    }

    reconcile(postId: number): Promise<void> {
        if (!this.active) return Promise.resolve();
        const current = this.reads.get(postId);
        if (current) return current;
        this.refreshNeeded.delete(postId);
        const known = this.knownIds(postId);
        const epoch = this.epoch;
        const run = (async () => {
            const acknowledged = new Set<string>();
            let likes = 0;
            for (let offset = 0; offset < Math.max(1, known.length); offset += 100) {
                const params = new URLSearchParams({ postId: String(postId) });
                const ids = known.slice(offset, offset + 100);
                if (ids.length) params.set("batchIds", ids.join(","));
                const state = await this.request<CheerUpState>(`/api/v1/get/like/count?${params}`, { method: "GET" });
                likes = Math.max(likes, state.likes);
                state.acknowledgedBatchIds.forEach((id) => acknowledged.add(id));
            }
            if (!this.active || epoch !== this.epoch) return;
            const queried = new Set(known);
            this.records(postId).forEach((batch) => { if (queried.has(batch.batchId)) batch.awaitingReconcile = false; });
            this.apply(postId, { likes, acknowledgedBatchIds: [...acknowledged] }, known);
        })().catch(() => { /* Preserve unconfirmed records and their existing retry policy. */ }).finally(() => {
            if (this.reads.get(postId) !== run) return;
            this.reads.delete(postId);
            if (this.refreshNeeded.has(postId)) this.requestRefresh(postId);
        });
        this.reads.set(postId, run);
        return run;
    }

    private async request<T extends CheerUpState>(url: string, init: RequestInit): Promise<T> {
        const controller = new AbortController();
        this.controllers.add(controller);
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
            const aborted = new Promise<never>((_resolve, reject) => { controller.signal.addEventListener("abort", () => reject(new Error("Request aborted")), { once: true }); });
            return await Promise.race([aborted, (async () => {
                const response = await this.send(url, { ...init, credentials: "same-origin", cache: "no-store", signal: controller.signal });
                if (!response.ok) {
                    const value = response.headers.get("Retry-After");
                    const seconds = value ? Number(value) : NaN;
                    const delay = value ? (Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now()) : 0;
                    throw new RequestError(response.status, Number.isFinite(delay) ? Math.max(0, Math.min(delay, 300000)) : 0);
                }
                const data = await response.json() as ApiResponse<T>;
                if (data.resultCode !== "SUCCESS" || !Number.isSafeInteger(data.result?.likes) || data.result.likes < 0 || !Array.isArray(data.result.acknowledgedBatchIds)) throw new RequestError(502);
                return data.result;
            })()]);
        } finally { clearTimeout(timeout); this.controllers.delete(controller); }
    }

    private restore(reactivating = false) {
        const posts = new Set<number>();
        const epoch = this.epoch;
        if (reactivating) this.batches.forEach((batch) => {
            if (batch.status !== "acknowledged") { batch.awaitingReconcile = true; posts.add(batch.postId); }
        });
        let recoverAt = Infinity;
        try {
            const keys = Array.from({ length: this.storage?.length ?? 0 }, (_item, index) => this.storage?.key(index)).filter((key): key is string => Boolean(key?.startsWith(`${PREFIX}${encodeURIComponent(this.userId)}:batch:`)));
            keys.forEach((key) => {
                const saved = this.read(key);
                if (!saved) return;
                if ((saved.status === "acknowledged" || saved.status === "failed") && Date.now() - saved.lastClickAt > RETENTION_MS) { this.storage?.removeItem(key); return; }
                this.post(saved.postId).hasCheered = true;
                const existing = this.batches.get(saved.batchId);
                if (saved.status === "acknowledged") {
                    if (existing && existing.status !== "acknowledged") { existing.awaitingBase = true; existing.status = "acknowledged"; posts.add(saved.postId); }
                    return;
                }
                if (existing && saved.ownerId === this.tabId && existing.ownerId === this.tabId && !reactivating) return;
                if (saved.ownerId !== this.tabId && saved.leaseUntil > Date.now()) { recoverAt = Math.min(recoverAt, saved.leaseUntil); return; }
                saved.ownerId = this.tabId;
                saved.leaseUntil = Date.now() + LEASE_MS;
                saved.awaitingReconcile = true;
                if (saved.status === "draft") { saved.status = "pending"; saved.nextAttemptAt = Date.now(); }
                this.batches.set(saved.batchId, saved);
                this.save(saved);
                posts.add(saved.postId);
            });
        } catch { /* Storage access itself may be disabled. */ }
        posts.forEach((postId) => {
            this.restoring.add(postId);
            void this.reconcile(postId).finally(() => { if (epoch === this.epoch) { this.restoring.delete(postId); this.schedule(postId); } });
        });
        clearTimeout(this.recoveryTimer);
        if (Number.isFinite(recoverAt)) this.recoveryTimer = setTimeout(() => this.restore(), Math.max(1, recoverAt - Date.now()));
        if (posts.size) this.emit();
    }

    private onAttention = () => {
        if (!this.active) return;
        this.restore();
        this.posts.forEach((post, postId) => { if (post.watchers || this.knownIds(postId).length) void this.reconcile(postId); });
    };
    private onVisibility = () => { if (document.visibilityState === "hidden") this.flush(); else this.onAttention(); };
    private onExit = () => {
        this.flush();
        // The next document can immediately recover a lost keepalive response after a normal exit.
        this.batches.forEach((batch) => {
            if (batch.ownerId !== this.tabId || batch.status === "acknowledged") return;
            const saved = this.read(batch.key);
            if (saved && (saved.ownerId !== this.tabId || saved.status === "acknowledged")) return;
            batch.leaseUntil = 0;
            this.save(batch);
        });
    };
    private onStorage = (event: StorageEvent) => {
        if (event.key?.startsWith(`${PREFIX}${encodeURIComponent(this.userId)}:batch:`)) this.restore();
    };
}
