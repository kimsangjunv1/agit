"use client";

import DynamicIsland from "@/shared/ui/common/DynamicIsland";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";

const WIDTH_OPTIONS = [
    {
        value: "mobile",
        label: "모바일",
        path: "M280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h400q33 0 56.5 23.5T760-840v124q18 7 29 22t11 34v80q0 19-11 34t-29 22v404q0 33-23.5 56.5T680-40H280Zm0-80h400v-720H280v720Zm0 0v-720 720Zm228.5-611.5Q520-743 520-760t-11.5-28.5Q497-800 480-800t-28.5 11.5Q440-777 440-760t11.5 28.5Q463-720 480-720t28.5-11.5Z",
    },
    {
        value: "tablet",
        label: "태블릿",
        path: "M200-40q-33 0-56.5-23.5T120-120v-720q0-33 23.5-56.5T200-920h560q33 0 56.5 23.5T840-840v720q0 33-23.5 56.5T760-40H200Zm0-200v120h560v-120H200Zm200 80h160v-40H400v40ZM200-320h560v-400H200v400Zm0-480h560v-40H200v40Zm0 0v-40 40Zm0 560v120-120Z",
    },
    {
        value: "pc",
        label: "PC",
        path: "M320-120v-80h80v-80H160q-33 0-56.5-23.5T80-360v-400q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v400q0 33-23.5 56.5T800-280H560v80h80v80H320ZM160-360h640v-400H160v400Zm0 0v-400 400Z",
    },
] as const;

export type PostContentWidth = (typeof WIDTH_OPTIONS)[number]["value"];

type WidthControlProps = {
    value: PostContentWidth;
    onChange: (value: PostContentWidth) => void;
};

const WidthControl = ({ value, onChange }: WidthControlProps) => {
    const isVisible = useLayoutStore((state) => state.isPageContentVisible && state.transitionPhase === "idle" && !state.isMobileMenuOpen);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-[calc(1.6rem+env(safe-area-inset-bottom))] left-1/2 z-[120] -translate-x-1/2">
            <DynamicIsland ariaLabel="본문 너비 선택">
                <div className="flex items-center gap-[0.4rem]">
                    {WIDTH_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            aria-label={`${option.label} 너비`}
                            aria-pressed={value === option.value}
                            title={option.label}
                            className={`flex h-[3.2rem] w-[4rem] shrink-0 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${value === option.value ? "bg-white/10 text-[var(--color-interaction-hover)]" : ""}`}
                            onClick={() => onChange(option.value)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 -960 960 960"
                                fill="currentColor"
                                aria-hidden="true"
                                focusable="false"
                            >
                                <path d={option.path} />
                            </svg>
                        </button>
                    ))}
                </div>
            </DynamicIsland>
        </div>
    );
};

export default WidthControl;
