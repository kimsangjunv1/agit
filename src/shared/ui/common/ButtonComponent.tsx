"use client";

import { AnimatePresence, motion } from "motion/react";
import { Fragment, ReactNode, useEffect, useState } from "react";
import IconComponent from "./IconComponent";

interface ButtonComponentProps {
    id?: string;
    className?: string;
    type?: "button" | "submit" | "reset";
    loading?: boolean;
    prevent?: boolean;
    iconType?: string;
    disabled?: boolean;
    iconClassName?: string;
    size?: "sm" | "md" | "lg" | "auto";
    textSize?: string;
    value?: number | string;
    colorBackground?: string;
    colorText?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    content: string | ReactNode;
    test?: string;
}

const ButtonComponent = ({
    id,
    className = "",
    content,
    prevent,
    textSize = "",
    iconType,
    iconClassName,
    loading = true,
    type = "button",
    colorBackground = "bg-[var(--color-gray-100)]",
    colorText = "text-[var(--color-gray-700)]",
    size = "md",
    value = 0,
    disabled = false,
    test,
    onClick,
}: ButtonComponentProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isTimeOutStart, setIsTimeOutStart] = useState(false);

    const setButtonSize = () => {
        switch (size) {
            case "sm":
                return "h-[var(--button-sm-height)]";

            case "md":
                return "h-[var(--button-md-height)]";

            case "lg":
                return "h-[var(--button-lg-height)]";

            case "auto":
                return "h-auto";

            default:
                return "";
        }
    };

    const checkLoading = () => {
        if (!loading) {
            setIsLoading(true);
            setIsTimeOutStart(true);
        } else {
            // target이 있을 때 로딩 상태를 2초 후에 false로 변경 (exit 애니메이션 딜레이 주기)
            if (isTimeOutStart && loading) {
                const timer = setTimeout(() => {
                    setIsLoading(false);
                }, 1000); // 여기서 딜레이 주기

                return () => clearTimeout(timer);
            }
        }
    };

    useEffect(() => {
        checkLoading();
    }, [loading]);

    return (
        <AnimatePresence>
            <motion.button
                type={type}
                id={id}
                className={`${colorBackground} ${colorText} ${setButtonSize()} ${className} whitespace-nowrap`}
                onClick={onClick}
                style={{
                    opacity: prevent ? "0.5" : "1",
                    pointerEvents: prevent ? "none" : "auto",
                }}
                value={value ?? 0}
                whileHover={{ filter: "brightness(0.95)" }}
                whileTap={{ scale: 0.95, filter: "brightness(0.8)" }}
                transition={{ duration: 0.1, ease: [0.42, 0, 0.58, 1] }}
                disabled={prevent}
                data-testid={`${test ? test : ""}`}
            >
                {!isLoading && loading ? (
                    <Fragment>
                        {iconType ? (
                            <IconComponent
                                type={iconType}
                                alt={iconType}
                                className={iconClassName}
                            />
                        ) : (
                            ""
                        )}

                        <motion.div
                            key="children"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                ease: [0, 0.25, 0.95, 1],
                            }}
                            className={`pointer-events-none ${textSize ? textSize : ""}`}
                        >
                            {content}
                        </motion.div>
                    </Fragment>
                ) : (
                    <AnimationDotted className="bg-[var(--color-surface)]" />
                )}
            </motion.button>
        </AnimatePresence>
    );
};

export const AnimationDotted = ({ className }: { className?: string }) => {
    return (
        <motion.div
            key="loading"
            className="flex justify-center items-center h-[1.6rem]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{
                duration: 0.5,
                ease: [0, 0.9, 0.95, 1],
                delay: 0.5,
            }}
        >
            {Array(3)
                .fill(0)
                .map((e, i) => (
                    <div
                        className={`mx-[0.4rem] size-[0.8rem] rounded-full animate-blinking shadow-[0_0_3.2rem_1.2rem_#ffffff90] ${className}`}
                        key={i}
                    />
                ))}
        </motion.div>
    );
};

export default ButtonComponent;
