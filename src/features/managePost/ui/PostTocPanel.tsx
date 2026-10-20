"use client";

import { useMemo, type RefObject } from "react";

import type { SectionContent } from "@/entities/post/model/post.type";
import { buildPostToc } from "@/entities/post/lib/postToc";
import { useBlockStore } from "@/features/managePost/model/useEditorBlockStore";
import PostTocNav from "@/features/managePost/ui/PostTocNav";

type PostTocPanelProps = {
    contents?: SectionContent[][];
    scrollViewportRef?: RefObject<HTMLDivElement | null>;
};

const PostTocPanel = ({ contents, scrollViewportRef }: PostTocPanelProps) => {
    const rows = useBlockStore((state) => state.rows);
    const items = useMemo(() => buildPostToc(contents ?? rows), [contents, rows]);

    return (
        <PostTocNav
            items={items}
            scrollViewportRef={scrollViewportRef}
        />
    );
};

export default PostTocPanel;
