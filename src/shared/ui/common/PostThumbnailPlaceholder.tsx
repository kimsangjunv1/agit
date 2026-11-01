"use client";

import { useMemo } from "react";

import usePageTransitionReady from "@/shared/hooks/usePageTransitionReady";
import { generateMeshGradientStyle } from "@/shared/lib/thumbnail/generateMeshGradientStyle";

type PostThumbnailPlaceholderProps = {
    seed: string | number;
    className?: string;
    fill?: boolean;
    readinessKey?: string;
};

const PostThumbnailPlaceholder = ({ seed, className = "", fill = false, readinessKey }: PostThumbnailPlaceholderProps) => {
    const meshStyle = useMemo(() => generateMeshGradientStyle(seed), [seed]);

    usePageTransitionReady(readinessKey ?? `post-thumbnail-placeholder-${seed}`, true, "image");

    return (
        <div
            aria-hidden
            className={`overflow-hidden ${fill ? "absolute inset-0 h-full w-full" : ""} ${className}`}
            style={meshStyle}
        >
            <div className="pointer-events-none absolute inset-0 bg-[url(/images/picture/img-thumbnail-noise.svg)] bg-size-[128px_128px] opacity-[0.07] mix-blend-overlay" />
        </div>
    );
};

export default PostThumbnailPlaceholder;
