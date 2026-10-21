"use client";

import { ImgHTMLAttributes, useEffect, useRef, useState } from "react";

import usePageTransitionReady from "@/shared/hooks/usePageTransitionReady";

type TransitionAwareImageProps = ImgHTMLAttributes<HTMLImageElement> & {
    readinessKey: string;
};

const TransitionAwareImage = ({ readinessKey, onLoad, onError, src, alt = "", ...props }: TransitionAwareImageProps) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(false);
    }, [src]);

    useEffect(() => {
        const img = imgRef.current;

        if (img?.complete && img.naturalWidth > 0) {
            setIsLoaded(true);
        }
    }, [src]);

    usePageTransitionReady(readinessKey, isLoaded, "image");

    return (
        <img
            ref={imgRef}
            src={src}
            alt={alt}
            {...props}
            onLoad={(event) => {
                setIsLoaded(true);
                onLoad?.(event);
            }}
            onError={(event) => {
                setIsLoaded(true);
                onError?.(event);
            }}
        />
    );
};

export default TransitionAwareImage;
