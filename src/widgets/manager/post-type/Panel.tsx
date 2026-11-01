"use client";
import { PostTypeManagerPageProvider } from "./model/PostTypeManagerContext";
import * as Layer from "@/widgets/manager/post-type/ui";
export default function Panel() {
    return (
        <PostTypeManagerPageProvider>
            <Layer.PostTypeManagerList />
            <Layer.PostTypeManagerDetail />
        </PostTypeManagerPageProvider>
    );
}
