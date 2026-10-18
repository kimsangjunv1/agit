"use client";

import { ImgHTMLAttributes, useEffect, useState } from "react";

import TransitionAwareImage from "@/shared/ui/common/TransitionAwareImage";
import PostThumbnailPlaceholder from "@/shared/ui/common/PostThumbnailPlaceholder";
import { hasPostThumbnail } from "@/shared/lib/thumbnail/generateMeshGradientStyle";

type PostThumbnailProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
    src?: string | null;
    seed: string | number;
    readinessKey: string;
    fill?: boolean;
};

const PostThumbnail = ({ src, seed, readinessKey, fill = false, className = "", alt = "", ...props }: PostThumbnailProps) => {
    const [hasImageError, setHasImageError] = useState(false);
    const shouldShowPlaceholder = !hasPostThumbnail(src) || hasImageError;

    useEffect(() => {
        setHasImageError(false);
    }, [src]);

    if (shouldShowPlaceholder) {
        return (
            <PostThumbnailPlaceholder
                seed={seed}
                className={className}
                fill={fill}
                readinessKey={readinessKey}
            />
        );
    }

    return (
        <TransitionAwareImage
            readinessKey={readinessKey}
            src={src}
            alt={alt}
            className={`${fill ? "absolute inset-0 h-full w-full" : ""} ${className}`}
            {...props}
            onError={(event) => {
                setHasImageError(true);
                props.onError?.(event);
            }}
        />
    );
};

export default PostThumbnail;
