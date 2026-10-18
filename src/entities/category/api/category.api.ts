import { clientApi } from "@/shared/lib/api/client";
import { DeleteCategoryPayload, GetCategoryListOnManagerResponse, GetCategoryListResponse, PatchCategoryPayload, SetCategoryPayload } from "@/entities/category/model/category.type";

/**
 * 카테고리 - 목록 조회
 */
export const getCategoryListFetch = (idx?: number) => {
    const url = idx ? `/api/v1/get/category/${idx}` : `/api/v1/get/category`;
    return clientApi.get<GetCategoryListResponse>(url);
};

/**
 * 카테고리 - 관리자 목록 조회
 */
export const getCategoryListOnManagerFetch = () => {
    const url = `/api/v1/get/category/manager`;
    return clientApi.get<GetCategoryListOnManagerResponse>(url);
};

/**
 * 카테고리 - 생성
 */
export const setCategoryFetch = (data: SetCategoryPayload) => clientApi.post<unknown>("/api/v1/set/category/create", data);

/**
 * 카테고리 - 수정
 */
export const patchCategoryFetch = (data: PatchCategoryPayload) => clientApi.patch<unknown>("/api/v1/patch/category", data);

/**
 * 카테고리 - 삭제
 */
export const deleteCategoryFetch = (data: DeleteCategoryPayload) => clientApi.delete<unknown>("/api/v1/delete/category", { body: data });
