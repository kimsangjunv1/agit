import { ApiResponse } from "@/shared/model/common.type";
import type { DeleteUnusedPostImagesResult, PostImageInventory } from "@/entities/post-image/lib/postImageInventory";

export type GetPostImageInventoryResponse = ApiResponse<PostImageInventory>;
export type DeleteUnusedPostImagesResponse = ApiResponse<DeleteUnusedPostImagesResult>;
