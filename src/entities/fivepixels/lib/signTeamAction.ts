import { createReportAuthMessage } from "@fivepixels-js/react";
import type { ReportAuthProof } from "@fivepixels-js/react";

import { FIVEPIXELS_PERSONAL_KEY_STORAGE_PREFIX, FIVEPIXELS_TEAM_AUTH_ACTION } from "@/entities/fivepixels/constants/fivepixels.constants";
import type { FivepixelsScope } from "@/entities/fivepixels/model/fivepixels.type";

const PRIVATE_KEY_PREFIX = "stpk2";
const ALGORITHM = { name: "ECDSA", namedCurve: "P-256" } as const;

type ReviewerKeyBundle = {
    projectId: string;
    environment?: string;
    authorId: string;
    authorName?: string;
    privateKey: JsonWebKey;
    publicKey: JsonWebKey;
};

/** 라이브러리 storageKeys.getPersonalKeyStorageKey 와 동일 규칙. */
function personalKeyStorageKey(scope: FivepixelsScope): string {
    return [FIVEPIXELS_PERSONAL_KEY_STORAGE_PREFIX, scope.projectId, scope.environment].filter(Boolean).join(":");
}

function decodeBase64Url(value: string): string {
    const padded = value
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);

    return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function encodeBytes(value: ArrayBuffer): string {
    let binary = "";

    for (const byte of new Uint8Array(value)) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function parsePrivateKeyBundle(key: string): ReviewerKeyBundle | null {
    const [prefix, encoded, ...rest] = key.trim().split(".");

    if (prefix !== PRIVATE_KEY_PREFIX || !encoded || rest.length > 0) return null;

    try {
        const bundle = JSON.parse(decodeBase64Url(encoded)) as Partial<ReviewerKeyBundle>;

        return bundle.projectId && bundle.authorId && bundle.privateKey && bundle.publicKey ? (bundle as ReviewerKeyBundle) : null;
    } catch {
        return null;
    }
}

/**
 * localStorage 의 개인키로 팀 관리 payload 에 ECDSA 서명을 만든다.
 * 라이브러리가 signReportPayload 를 export 하지 않으므로 동일 포맷으로 자체 구현한다.
 * payload 는 auth 를 제외한 요청 본문과 동일해야 서버 verifyReportAuthProof 가 통과한다.
 */
export async function signTeamAction(params: { scope: FivepixelsScope; payload: unknown }): Promise<ReportAuthProof | null> {
    if (typeof window === "undefined") return null;

    const stored = window.localStorage.getItem(personalKeyStorageKey(params.scope));

    if (!stored) return null;

    const bundle = parsePrivateKeyBundle(stored);

    if (!bundle) return null;

    const signedAt = new Date().toISOString();
    const message = createReportAuthMessage({
        projectId: params.scope.projectId,
        environment: params.scope.environment,
        action: FIVEPIXELS_TEAM_AUTH_ACTION,
        authorId: bundle.authorId,
        signedAt,
        payload: params.payload,
    });

    const privateKey = await crypto.subtle.importKey("jwk", bundle.privateKey, ALGORITHM, false, ["sign"]);
    const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, new TextEncoder().encode(message));

    return {
        author_id: bundle.authorId,
        algorithm: "ECDSA-P256-SHA256",
        action: FIVEPIXELS_TEAM_AUTH_ACTION,
        signed_at: signedAt,
        signature: encodeBytes(signature),
    };
}
