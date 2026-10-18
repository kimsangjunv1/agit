import { FIVEPIXELS_LIST_ALL_DEFAULT_LIMIT, FIVEPIXELS_LIST_ALL_MAX_LIMIT } from "@/entities/fivepixels/constants/fivepixels.constants";
import type { FivepixelsScope } from "@/entities/fivepixels/model/fivepixels.type";

/** `project` + `env` 쿼리로 스코프를 만든다. 하나라도 없으면 null (호출부에서 400). */
export function parseFivepixelsScope(searchParams: URLSearchParams): FivepixelsScope | null {
    const projectId = searchParams.get("project")?.trim();
    const environment = searchParams.get("env")?.trim();

    if (!projectId || !environment) return null;

    return { projectId, environment };
}

/** listAll 커서는 offset 문자열(`"0"`, `"100"`, …)로 취급한다. */
export function parseFivepixelsListAllRange(searchParams: URLSearchParams) {
    const rawLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
    const rawOffset = Number.parseInt(searchParams.get("cursor") ?? "", 10);

    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, FIVEPIXELS_LIST_ALL_MAX_LIMIT) : FIVEPIXELS_LIST_ALL_DEFAULT_LIMIT;
    const offset = Number.isFinite(rawOffset) && rawOffset > 0 ? rawOffset : 0;

    return { limit, offset };
}
