import "server-only";

import { cookies } from "next/headers";
import { getServerSession } from "next-auth";

import { authOptions } from "@/shared/lib/authOptions";
import { ApiFetchError, parseApiErrorMessage, trackApiError } from "@/shared/lib/api/errors";
import { getSiteUrl } from "@/shared/lib/siteUrl";

type ServerFetchOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
    throwOnError?: boolean;
    /** 쿠키 전달·401 재시도를 건너뜀 (공개 API self-fetch) */
    skipAuth?: boolean;
};

async function buildRequestCookieHeader(): Promise<string | undefined> {
    const cookieStore = await cookies();
    const all = cookieStore.getAll();

    if (all.length === 0) {
        return undefined;
    }

    return all.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

async function buildServerHeaders(options: ServerFetchOptions): Promise<HeadersInit> {
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (!options.skipAuth) {
        const cookieHeader = await buildRequestCookieHeader();

        if (cookieHeader) {
            headers.set("Cookie", cookieHeader);
        }
    }

    return headers;
}

export async function serverFetch<T>(url: string, options: ServerFetchOptions = {}): Promise<T> {
    const target = url.startsWith("http") ? url : `${getSiteUrl()}${url}`;

    const executeFetch = async () => {
        const headers = await buildServerHeaders(options);

        const response = await fetch(target, {
            ...options,
            headers,
            body: options.body === undefined ? undefined : JSON.stringify(options.body),
        });

        const data = await response.json().catch(() => null);

        return { response, data };
    };

    let { response, data } = await executeFetch();

    if (!options.skipAuth && response.status === 401) {
        await getServerSession(authOptions);
        ({ response, data } = await executeFetch());
    }

    if (!response.ok) {
        trackApiError("server", target, response.status, data);

        if (options.throwOnError === false) {
            return data as T;
        }

        throw new ApiFetchError(parseApiErrorMessage(data, "서버 API 요청에 실패했습니다."), response.status, data);
    }

    return data as T;
}

export const serverApi = {
    get: <T>(url: string, options?: ServerFetchOptions) => serverFetch<T>(url, options),
    post: <T>(url: string, body?: unknown, options?: ServerFetchOptions) => serverFetch<T>(url, { ...options, method: "POST", body }),
    patch: <T>(url: string, body?: unknown, options?: ServerFetchOptions) => serverFetch<T>(url, { ...options, method: "PATCH", body }),
    delete: <T>(url: string, options?: ServerFetchOptions) => serverFetch<T>(url, { ...options, method: "DELETE" }),
};
