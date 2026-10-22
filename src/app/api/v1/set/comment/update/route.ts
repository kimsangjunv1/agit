import { mutateComment } from "@/entities/comment/lib/commentMutation.server";

export const PATCH = (req: Request) => mutateComment(req, "update");
