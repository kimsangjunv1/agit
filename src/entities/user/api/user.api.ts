import { clientApi } from "@/shared/lib/api/client";
import { GetUserManagerListResponse, SetUserPayload } from "@/entities/user/model/user.type";

/**
 * 유저 - 회원가입
 */
export const setUserFetch = (data: SetUserPayload) => clientApi.post<unknown>("/api/v1/set/user", data);

export const getUserManagerListFetch = () => clientApi.get<GetUserManagerListResponse>("/api/v1/get/users/manager");
