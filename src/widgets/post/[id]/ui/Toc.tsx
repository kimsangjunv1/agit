"use client";
import PostTocPanel from "@/features/managePost/ui/PostTocPanel";
import { usePostDetailProvider } from "../model/PostDetailContext";
export default function Toc() {
    const { contents } = usePostDetailProvider();
    return <PostTocPanel contents={contents} />;
}
