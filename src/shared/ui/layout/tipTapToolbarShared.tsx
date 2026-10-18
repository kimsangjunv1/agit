"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";

export const DEFAULT_FONT_SIZE = "2rem";
export const DEFAULT_LINE_HEIGHT = "1.5";
export const FONT_SIZES = ["1.2rem", "1.6rem", "2rem", "2.4rem", "2.8rem"] as const;
export const LINE_HEIGHTS = ["1", "1.2", "1.5", "1.8", "2"] as const;
export type TextAlignValue = "left" | "center" | "right";

export type HeadingValue = "paragraph" | "h1" | "h2" | "h3";
export type ToolbarVariant = "default" | "glass";

export const useTipTapToolbarState = (editor: Editor) =>
    useEditorState({
        editor,
        selector: (ctx) => {
            if (!ctx.editor || ctx.editor.isDestroyed) {
                return {
                    isBold: false,
                    canBold: false,
                    isItalic: false,
                    canItalic: false,
                    isStrike: false,
                    canStrike: false,
                    isUnderline: false,
                    canUnderline: false,
                    isCode: false,
                    canCode: false,
                    isHeading1: false,
                    isHeading2: false,
                    isHeading3: false,
                    isBulletList: false,
                    isOrderedList: false,
                    isCodeBlock: false,
                    isSnippetCodeBlock: false,
                    isBlockquote: false,
                    isHighlight: false,
                    isAlignLeft: false,
                    isAlignCenter: false,
                    isAlignRight: false,
                    activeFontSize: DEFAULT_FONT_SIZE,
                    activeLineHeight: DEFAULT_LINE_HEIGHT,
                    canUndo: false,
                    canRedo: false,
                };
            }

            return {
                isBold: ctx.editor.isActive("bold"),
                canBold: ctx.editor.can().chain().toggleBold().run(),
                isItalic: ctx.editor.isActive("italic"),
                canItalic: ctx.editor.can().chain().toggleItalic().run(),
                isStrike: ctx.editor.isActive("strike"),
                canStrike: ctx.editor.can().chain().toggleStrike().run(),
                isUnderline: ctx.editor.isActive("underline"),
                canUnderline: ctx.editor.can().chain().toggleUnderline().run(),
                isCode: ctx.editor.isActive("code"),
                canCode: ctx.editor.can().chain().toggleCode().run(),
                isHeading1: ctx.editor.isActive("heading", { level: 1 }),
                isHeading2: ctx.editor.isActive("heading", { level: 2 }),
                isHeading3: ctx.editor.isActive("heading", { level: 3 }),
                isBulletList: ctx.editor.isActive("bulletList"),
                isOrderedList: ctx.editor.isActive("orderedList"),
                isCodeBlock: ctx.editor.isActive("codeBlock"),
                isSnippetCodeBlock: ctx.editor.isActive("snippetCodeBlock"),
                isBlockquote: ctx.editor.isActive("blockquote"),
                isHighlight: ctx.editor.isActive("highlight"),
                isAlignLeft: ctx.editor.isActive({ textAlign: "left" }),
                isAlignCenter: ctx.editor.isActive({ textAlign: "center" }),
                isAlignRight: ctx.editor.isActive({ textAlign: "right" }),
                activeFontSize: ctx.editor.getAttributes("textStyle").fontSize ?? DEFAULT_FONT_SIZE,
                activeLineHeight: ctx.editor.getAttributes("textStyle").lineHeight ?? DEFAULT_LINE_HEIGHT,
                canUndo: ctx.editor.can().chain().undo().run(),
                canRedo: ctx.editor.can().chain().redo().run(),
            };
        },
    });

export const getActiveHeading = (state: ReturnType<typeof useTipTapToolbarState>): HeadingValue => {
    if (state.isHeading1) return "h1";
    if (state.isHeading2) return "h2";
    if (state.isHeading3) return "h3";
    return "paragraph";
};

export const iconButtonClass = (active: boolean, disabled = false, compact = false, variant: ToolbarVariant = "default") => {
    const size = compact ? "w-[3.2rem] h-[3.2rem] text-[1.2rem]" : "w-[3.6rem] h-[2.4rem] text-[1.6rem]";
    // const size = compact ? "w-[3.2rem] h-[3.2rem] text-[1.3rem]" : "w-[3.6rem] h-[2.4rem] text-[1.4rem]";

    if (variant === "glass") {
        return `shrink-0 flex items-center justify-center rounded-[1.2rem] transition-colors ${size} ${
            disabled ? "cursor-not-allowed text-white/40" : active ? "bg-white/25 text-white" : "text-white hover:bg-white/15"
        }`;
    }

    return `shrink-0 flex items-center justify-center rounded-[1.2rem] font-semibold transition-colors ${size} ${
        disabled ? "opacity-40 cursor-not-allowed text-[var(--color-gray-500)]" : active ? "bg-[var(--color-blue-500)] text-white" : "text-[var(--color-gray-1000)] hover:bg-[var(--color-gray-200)]"
    }`;
};

export const preventEditorBlur = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.tagName === "SELECT" || target.tagName === "OPTION" || target.closest("select")) {
        return;
    }

    e.preventDefault();
};

export const ToolbarDivider = ({ variant = "default" }: { variant?: ToolbarVariant }) => (
    <span
        className={`shrink-0 w-[0.4rem] h-[2.4rem] mx-[0.4rem] ${variant === "glass" ? "bg-white/20" : "bg-[var(--color-gray-200)]"}`}
        aria-hidden
    />
);

export const ToolbarIconButton = ({
    label,
    title,
    active,
    disabled,
    compact,
    variant = "default",
    className,
    onClick,
    children,
}: {
    label: string;
    title: string;
    active?: boolean;
    disabled?: boolean;
    compact?: boolean;
    variant?: ToolbarVariant;
    className?: string;
    onClick: () => void;
    children?: React.ReactNode;
}) => (
    <button
        type="button"
        title={title}
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        className={`${iconButtonClass(!!active, disabled, compact, variant)} ${className ?? ""}`}
        onMouseDown={preventEditorBlur}
        onClick={onClick}
    >
        {children ?? label}
    </button>
);

export const ToolbarSelect = ({
    label,
    value,
    onChange,
    options,
    variant = "default",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    variant?: ToolbarVariant;
}) => (
    <label className="shrink-0 relative flex items-center">
        <span className="sr-only">{label}</span>
        <select
            aria-label={label}
            value={value}
            onMouseDown={preventEditorBlur}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onChange(e.target.value)}
            className={`relative z-20 h-[2.4rem] pl-[1.2rem] pr-[2.4rem] rounded-[1.2rem] text-[1.2rem] font-semibold outline-none cursor-pointer appearance-none ${
                variant === "glass"
                    ? "text-white bg-white/10 hover:bg-white/15 border border-white/20"
                    : "text-[var(--color-gray-1000)] bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-200)] border border-[var(--color-gray-200)]"
            }`}
        >
            {options.map((option) => (
                <option
                    key={option.value}
                    value={option.value}
                >
                    {option.label}
                </option>
            ))}
        </select>
        <span className={`pointer-events-none absolute right-[0.8rem] text-[1.2rem] ${variant === "glass" ? "text-white/70" : "text-[var(--color-gray-500)]"}`}>▾</span>
    </label>
);

export const applyHeading = (editor: Editor, value: HeadingValue) => {
    if (value === "paragraph") {
        editor.chain().focus().setParagraph().run();
        return;
    }

    const level = Number(value.replace("h", "")) as 1 | 2 | 3;
    editor.chain().focus().setHeading({ level }).run();
};

export const applyFontSize = (editor: Editor, value: string) => {
    const { lineHeight } = editor.getAttributes("textStyle");

    editor
        .chain()
        .focus()
        .setMark("textStyle", {
            fontSize: value,
            lineHeight: lineHeight ?? DEFAULT_LINE_HEIGHT,
        })
        .run();
};

export const applyLineHeight = (editor: Editor, value: string) => {
    const { fontSize } = editor.getAttributes("textStyle");

    editor
        .chain()
        .focus()
        .setMark("textStyle", {
            fontSize: fontSize ?? DEFAULT_FONT_SIZE,
            lineHeight: value,
        })
        .run();
};
