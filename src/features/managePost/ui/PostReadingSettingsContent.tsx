"use client";

import UI from "@/shared/ui/common/UIComponent";
import { usePostReadingSettingsStore } from "@/shared/stores/usePostReadingSettingsStore";

const FONT_SCALE_OPTIONS = [
    { label: "작게", value: 0.9 },
    { label: "보통", value: 1 },
    { label: "크게", value: 1.15 },
    { label: "아주 크게", value: 1.3 },
] as const;

const LINE_HEIGHT_OPTIONS = [
    { label: "좁게", value: 1.4 },
    { label: "보통", value: 1.5 },
    { label: "넓게", value: 1.8 },
    { label: "아주 넓게", value: 2 },
] as const;

const SettingOptionGroup = ({
    title,
    options,
    activeValue,
    onSelect,
}: {
    title: string;
    options: readonly { label: string; value: number }[];
    activeValue: number;
    onSelect: (value: number) => void;
}) => (
    <section className="flex flex-col gap-[1.2rem]">
        <p className="text-[1.4rem] font-semibold text-[var(--color-gray-800)]">{title}</p>
        <div className="flex flex-wrap gap-[0.8rem]">
            {options.map((option) => {
                const isActive = activeValue === option.value;

                return (
                    <UI.Button
                        key={option.label}
                        type="button"
                        className={`rounded-[0.8rem] border px-[1.2rem] py-[0.8rem] text-[1.4rem] transition-colors ${
                            isActive
                                ? "border-[var(--color-blue-500)] bg-[var(--color-blue-500)] text-white"
                                : "border-[var(--color-gray-300)] bg-white text-[var(--color-gray-700)] hover:border-[var(--color-gray-500)]"
                        }`}
                        onClick={() => onSelect(option.value)}
                    >
                        {option.label}
                    </UI.Button>
                );
            })}
        </div>
    </section>
);

const PostReadingSettingsContent = () => {
    const { fontScale, lineHeight, setFontScale, setLineHeight, reset } = usePostReadingSettingsStore();

    return (
        <article className="flex flex-col gap-[2.4rem]">
            <SettingOptionGroup
                title="글자 크기"
                options={FONT_SCALE_OPTIONS}
                activeValue={fontScale}
                onSelect={setFontScale}
            />

            <SettingOptionGroup
                title="줄 간격"
                options={LINE_HEIGHT_OPTIONS}
                activeValue={lineHeight}
                onSelect={setLineHeight}
            />

            <UI.Button
                type="button"
                className="self-start rounded-[0.8rem] border border-[var(--color-gray-300)] px-[1.2rem] py-[0.8rem] text-[1.4rem] text-[var(--color-gray-600)] hover:border-[var(--color-gray-500)]"
                onClick={reset}
            >
                기본값으로 초기화
            </UI.Button>
        </article>
    );
};

export default PostReadingSettingsContent;
