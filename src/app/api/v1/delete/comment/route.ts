import { mutateComment } from "@/entities/comment/lib/commentMutation.server";

export const DELETE = (req: Request) => mutateComment(req, "delete");
