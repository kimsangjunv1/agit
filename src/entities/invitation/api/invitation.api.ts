import { clientApi } from "@/shared/lib/api/client";
import {
    DeleteInvitationCodePayload,
    GetInvitationCodeCheckResponse,
    GetInvitationCodeListOnManagerResponse,
    PatchInvitationCodePayload,
    SetInvitationCodePayload,
} from "@/entities/invitation/model/invitation.type";

/**
 * 초대코드 - 유효성 확인
 */
export const getInvitationCodeCheckFetch = (code: string) => {
    const url = `/api/v1/get/invite_codes?code=${code}`;
    return clientApi.get<GetInvitationCodeCheckResponse>(url);
};

/**
 * 초대코드 - 관리자 목록 조회
 */
export const getInvitationCodeListOnManagerFetch = () => {
    const url = `/api/v1/get/invite_codes/manager`;
    return clientApi.get<GetInvitationCodeListOnManagerResponse>(url);
};

/**
 * 초대코드 - 생성
 */
export const setInvitationCodeFetch = (data: SetInvitationCodePayload) => clientApi.post<unknown>("/api/v1/set/invite_codes/manager", data);

/**
 * 초대코드 - 수정
 */
export const patchInvitationFetch = (data: PatchInvitationCodePayload) => clientApi.patch<unknown>("/api/v1/patch/invite_codes/manager", data);

/**
 * 초대코드 - 삭제
 */
export const deleteInvitationFetch = (data: DeleteInvitationCodePayload) =>
    clientApi.delete<unknown>("/api/v1/delete/invite_codes/manager", {
        body: data,
    });
