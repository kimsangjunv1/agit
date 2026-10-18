import { AUTH_EXPIRED_STATUSES, ApiFetchError, parseApiErrorMessage, trackApiError } from "@/shared/lib/api/errors";
import { finishApiPending, startApiPending } from "@/shared/stores/useApiPendingStore";

type ClientFetchOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
    /** 401/419 시 로그인 리다이렉트를 건너뜀 */
    skipAuthRedirect?: boolean;
};

export type ApiResponse<T> = {
    result: T;
};

const LOGIN_PATH = "/login";

async function handleAuthExpired(status: number): Promise<never> {
    if (typeof window === "undefined") {
        throw new ApiFetchError("로그인이 필요합니다.", status);
    }

    if (window.location.pathname.startsWith(LOGIN_PATH)) {
        throw new ApiFetchError("로그인이 필요합니다.", status);
    }

    const callbackUrl = encodeURIComponent(`${window.location.pathname}${window.location.search}`);

    try {
        const { signOut } = await import("next-auth/react");
        await signOut({ redirect: false });
    } catch {
        // 세션 정리 실패 시에도 로그인 페이지로 이동
    }

    window.location.assign(`${LOGIN_PATH}?callbackUrl=${callbackUrl}`);

    throw new ApiFetchError("로그인이 필요합니다.", status);
}

export async function clientFetch<T>(url: string, options: ClientFetchOptions = {}): Promise<T> {
    const isFormData = options.body instanceof FormData;
    const method = (options.method ?? "GET").toUpperCase();
    const shouldTrackPending = typeof window !== "undefined" && method !== "GET" && method !== "HEAD";
    const headers: HeadersInit = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers ?? {}),
    };

    if (shouldTrackPending) {
        startApiPending();
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            body: options.body === undefined ? undefined : isFormData ? (options.body as FormData) : JSON.stringify(options.body),
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            if (!options.skipAuthRedirect && AUTH_EXPIRED_STATUSES.has(response.status)) {
                await handleAuthExpired(response.status);
            }

            trackApiError("client", url, response.status, data);

            throw new ApiFetchError(parseApiErrorMessage(data), response.status, data);
        }

        return data as T;
    } finally {
        if (shouldTrackPending) {
            finishApiPending();
        }
    }
}

export const clientApi = {
    get: <T>(url: string, options?: ClientFetchOptions) => clientFetch<T>(url, options),
    post: <T>(url: string, body?: unknown, options?: ClientFetchOptions) => clientFetch<T>(url, { ...options, method: "POST", body }),
    patch: <T>(url: string, body?: unknown, options?: ClientFetchOptions) => clientFetch<T>(url, { ...options, method: "PATCH", body }),
    delete: <T>(url: string, options?: ClientFetchOptions) => clientFetch<T>(url, { ...options, method: "DELETE" }),
};
