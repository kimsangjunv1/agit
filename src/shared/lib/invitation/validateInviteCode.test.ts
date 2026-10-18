import { describe, expect, it } from "vitest";

import { INVITE_CODE_STATUS, getInviteCodeStatus, type InviteCodeRecord } from "@/shared/lib/invitation/validateInviteCode";

const baseRecord: InviteCodeRecord = {
    id: 1,
    is_active: true,
    is_used: false,
    expire_at: null,
};

describe("getInviteCodeStatus", () => {
    it("유효한 코드는 VALID를 반환한다", () => {
        const result = getInviteCodeStatus(baseRecord);

        expect(result.isValid).toBe(true);
        expect(result.statusCode).toBe(INVITE_CODE_STATUS.VALID);
    });

    it("존재하지 않는 코드는 NOT_FOUND를 반환한다", () => {
        const result = getInviteCodeStatus(null);

        expect(result.isValid).toBe(false);
        expect(result.statusCode).toBe(INVITE_CODE_STATUS.NOT_FOUND);
    });

    it("만료된 코드는 EXPIRED를 반환한다", () => {
        const result = getInviteCodeStatus({
            ...baseRecord,
            expire_at: "2000-01-01T00:00:00.000Z",
        });

        expect(result.isValid).toBe(false);
        expect(result.statusCode).toBe(INVITE_CODE_STATUS.EXPIRED);
    });

    it("비활성 코드는 INACTIVE를 반환한다", () => {
        const result = getInviteCodeStatus({
            ...baseRecord,
            is_active: false,
        });

        expect(result.isValid).toBe(false);
        expect(result.statusCode).toBe(INVITE_CODE_STATUS.INACTIVE);
    });

    it("사용된 코드는 USED를 반환한다", () => {
        const result = getInviteCodeStatus({
            ...baseRecord,
            is_used: true,
        });

        expect(result.isValid).toBe(false);
        expect(result.statusCode).toBe(INVITE_CODE_STATUS.USED);
    });
});
