"use client";

import dynamic from "next/dynamic";

// `ssr: false` 옵션을 추가하여 서버에서 실행되지 않도록 설정
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import { Fragment, type CSSProperties } from "react";

import Image from "next/image";

interface IconComponentProps {
    type: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    isLottie?: boolean;
    isLottieLoop?: boolean;
}

const IconComponent = ({ isLottie = false, type, alt, className, width = 24, height = 24, isLottieLoop = true }: IconComponentProps) => {
    const isMonochrome = type.startsWith("outlined-") || ["graphic-logo-horizontal", "graphic-logo-vertical", "graphic-logo-github", "graphic-arrow-up"].includes(type);
    const setTypeOfIcon = () => {
        const PATH_DEFAULT = "/images/icon";
        const PATH_GRAPHIC = "/graphic/ico-graphic-";
        const PATH_COLORED = "/colored/ico-colored-";
        const PATH_OUTLINED = "/outlined/ico-outlined-";

        const EXTENSION = ".svg";

        switch (type) {
            case "graphic-logo-horizontal":
                return PATH_DEFAULT + PATH_GRAPHIC + "logo-horizontal" + EXTENSION;

            case "graphic-logo-vertical":
                return PATH_DEFAULT + PATH_GRAPHIC + "logo-vertical" + EXTENSION;

            case "graphic-logo-github":
                return PATH_DEFAULT + PATH_GRAPHIC + "logo-github" + EXTENSION;

            case "graphic-arrow-up":
                return PATH_DEFAULT + PATH_GRAPHIC + "arrow-up" + EXTENSION;

            case "graphic-case-empty":
                return PATH_DEFAULT + PATH_GRAPHIC + "case-empty" + EXTENSION;

            case "colored-information":
                return PATH_DEFAULT + PATH_COLORED + "information" + EXTENSION;

            case "colored-arrow-below":
                return PATH_DEFAULT + PATH_COLORED + "arrow-below" + EXTENSION;

            case "outlined-arrow-add-right":
                return PATH_DEFAULT + PATH_OUTLINED + "arrow-add-right" + EXTENSION;

            case "outlined-arrow-swap":
                return PATH_DEFAULT + PATH_OUTLINED + "arrow-swap" + EXTENSION;

            case "outlined-arrow-below":
                return PATH_DEFAULT + PATH_OUTLINED + "arrow-below" + EXTENSION;

            case "outlined-cross":
                return PATH_DEFAULT + PATH_OUTLINED + "cross" + EXTENSION;

            case "outlined-chart":
                return PATH_DEFAULT + PATH_OUTLINED + "chart" + EXTENSION;

            case "outlined-calendar":
                return PATH_DEFAULT + PATH_OUTLINED + "calendar" + EXTENSION;

            case "outlined-edit":
                return PATH_DEFAULT + PATH_OUTLINED + "edit" + EXTENSION;

            case "outlined-share":
                return PATH_DEFAULT + PATH_OUTLINED + "share" + EXTENSION;

            case "outlined-like":
                return PATH_DEFAULT + PATH_OUTLINED + "like" + EXTENSION;

            case "outlined-copy":
                return PATH_DEFAULT + PATH_OUTLINED + "copy" + EXTENSION;

            default:
                return PATH_DEFAULT + PATH_OUTLINED + "normal" + EXTENSION;
        }
    };

    const setTypeOfLottie = () => {
        switch (type) {
            case "qr-check":
            // return lottieCheckQr;

            case "qr-check-error":
            // return lottieCheckQrError;

            case "result":
            // return lottieResult;

            case "timer":
            // return lottieTimer;
        }
    };

    return (
        <Fragment>
            {isLottie ? (
                <Lottie
                    animationData={setTypeOfLottie()}
                    className={className}
                    width={width}
                    height={height}
                    loop={isLottieLoop}
                />
            ) : isMonochrome ? (
                <span
                    role={alt ? "img" : undefined}
                    aria-label={alt || undefined}
                    aria-hidden={alt ? undefined : true}
                    className={`inline-block w-[var(--icon-width)] max-w-full shrink-0 bg-current ${className ?? ""}`}
                    style={
                        {
                            "--icon-width": `${width}px`,
                            aspectRatio: type === "graphic-logo-vertical" ? "102 / 107" : type === "outlined-chart" ? "25 / 24" : "1",
                            maskImage: `url("${setTypeOfIcon()}")`,
                            maskSize: "contain",
                            maskPosition: "center",
                            maskRepeat: "no-repeat",
                            filter: "none",
                        } as CSSProperties
                    }
                />
            ) : (
                // <img src={ setTypeOfIcon() } alt={ alt } className={ className } />
                <Image
                    src={setTypeOfIcon()}
                    className={className}
                    width={width}
                    height={height}
                    alt={alt}
                />
            )}
        </Fragment>
    );
};

export default IconComponent;
