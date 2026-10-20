"use client";
import { CommentManagerPageProvider } from "./model/CommentManagerContext";
import * as Layer from "@/widgets/manager/comment/ui";
export default function Panel() {
    return (
        <CommentManagerPageProvider>
            <Layer.CommentManagerList />
            <Layer.CommentManagerDetail />
        </CommentManagerPageProvider>
    );
}
