"use client";

import { useEffect, type ReactNode } from "react";
import { POST_BODY_CLASS } from "@/shared/lib/richText/styles";
import { usePostReadingSettingsStore } from "@/shared/stores/usePostReadingSettingsStore";

const PostContentBody = ({ children }: { children: ReactNode }) => {
    const { fontScale, lineHeight, hydrate } = usePostReadingSettingsStore();

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    return (
        <article
            className={POST_BODY_CLASS}
            style={{
                ["--post-read-scale" as string]: fontScale,
                ["--post-read-line-height" as string]: lineHeight,
            }}
        >
            {children}
        </article>
    );
};

export default PostContentBody;
