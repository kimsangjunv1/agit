import { clientApi } from "@/shared/lib/api/client";
import type { DeleteUnusedPostImagesResponse, GetPostImageInventoryResponse } from "@/entities/post-image/model/postImage.type";

export const getPostImageInventoryOnManagerFetch = () => clientApi.get<GetPostImageInventoryResponse>("/api/v1/get/images/manager");

export const deleteUnusedPostImagesOnManagerFetch = () => clientApi.delete<DeleteUnusedPostImagesResponse>("/api/v1/delete/images/manager/unused");
