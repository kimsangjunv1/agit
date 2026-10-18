"use client";
import SortableBlock from "@/features/managePost/ui/SortableBlock";
import { usePostModifyProvider } from "../model/PostModifyContext";
export default function EditorBlocks() {
    const { contents } = usePostModifyProvider();
    return <SortableBlock contents={contents} />;
}
