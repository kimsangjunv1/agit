"use client";
import { PostManagerPageProvider } from "./model/PostManagerContext";
import * as Layer from "@/widgets/manager/post/ui";
export default function Panel() {
    return (
        <PostManagerPageProvider>
            <Layer.PostManagerList />
            <Layer.PostManagerDetail />
        </PostManagerPageProvider>
    );
}
