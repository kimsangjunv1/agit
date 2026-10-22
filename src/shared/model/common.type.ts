export interface ApiPaginationResponse {
    page: number;
    pageSize: number;
    totalCount: number;
    commentTotalCount?: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface ApiResponse<T = unknown> {
    pagination: ApiPaginationResponse | null;
    result: T;
    resultCode: string;
    resultMessage: string;
}

/** @deprecated ApiResponse.resultCode / resultMessage 사용 */
export interface ApiHeaderResponse {
    resultMsg: string;
    resultCode: number;
    isSuccessful: boolean;
    timestamp: string;
}
