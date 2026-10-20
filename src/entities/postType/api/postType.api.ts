import { clientApi } from "@/shared/lib/api/client";
import type { GetPostTypesResponse, PostTypePayload } from "../model/postType.type";

const URL = "/api/v1/post-types";

export const getPostTypesFetch = () => clientApi.get<GetPostTypesResponse>(URL);
export const createPostTypeFetch = (payload: PostTypePayload) => clientApi.post(URL, payload);
export const updatePostTypeFetch = (payload: PostTypePayload) => clientApi.patch(URL, payload);
export const deletePostTypeFetch = (code: string) => clientApi.delete(URL, { body: { code } });
