"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";

import { extractCodeFromContent, resolveCodeBlockFileName, sanitizeCodeFileBaseName } from "@/shared/lib/codeHighlight";
import { util } from "@/shared/lib/util";
import IconComponent from "@/shared/ui/common/IconComponent";
import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";
import { useToastStore } from "@/shared/stores/useToastStore";

type CodeBlockPanelProps = {
    content: string;
    fileName?: string;
    variant?: "default" | "compact";
    editableFileName?: boolean;
    onFileNameChange?: (fileName: string) => void;
    showCopy?: boolean;
    showFormat?: boolean;
    onFormat?: () => void | Promise<void>;
    className?: string;
    bodyClassName?: string;
    children: ReactNode;
};

const CodeBlockPanel = ({
    content,
    fileName = "",
    variant = "default",
    editableFileName = false,
    onFileNameChange,
    showCopy = true,
    showFormat = false,
    onFormat,
    className = "",
    bodyClassName = "",
    children,
}: CodeBlockPanelProps) => {
    const { setToast } = useToastStore();
    const [copied, setCopied] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);

    const { baseName, extension, label } = useMemo(() => resolveCodeBlockFileName(content, fileName), [content, fileName]);

    const handleCopy = useCallback(async () => {
        const { code } = extractCodeFromContent(content);

        try {
            await util.dom.setCopyOnClipboard(code);
            setCopied(true);
            setToast({ msg: "코드를 복사했어요", time: 2 });
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setToast({ msg: "복사에 실패했어요", time: 2 });
        }
    }, [content, setToast]);

    const handleFileNameChange = (value: string) => {
        onFileNameChange?.(sanitizeCodeFileBaseName(value));
    };

    const handleFormat = useCallback(async () => {
        if (!onFormat || isFormatting) {
            return;
        }

        setIsFormatting(true);
        try {
            await onFormat();
        } catch {
            setToast({ msg: "코드 정렬에 실패했어요", time: 2 });
        } finally {
            setIsFormatting(false);
        }
    }, [isFormatting, onFormat, setToast]);

    const isCompact = variant === "compact";

    const copyButton = showCopy ? (
        <button
            type="button"
            onClick={handleCopy}
            className="flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-[0.8rem] text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
            aria-label="코드 복사"
        >
            {copied ? (
                <MaterialIcon
                    name="check"
                    size={20}
                />
            ) : (
                <IconComponent
                    type="outlined-copy"
                    alt="코드 복사"
                    className="brightness-0 invert opacity-70"
                />
            )}
        </button>
    ) : null;

    const actionButtons =
        showCopy || showFormat ? (
            <section className="flex shrink-0 items-center gap-[0.4rem]">
                {showFormat ? (
                    <button
                        type="button"
                        onClick={handleFormat}
                        disabled={isFormatting}
                        className="flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-[0.8rem] text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="코드 정렬"
                    >
                        <MaterialIcon
                            name="code"
                            size={20}
                        />
                    </button>
                ) : null}
                {copyButton}
            </section>
        ) : null;

    if (isCompact) {
        return (
            <section className={`code-block-panel overflow-hidden rounded-[1.2rem] border border-slate-700/60 bg-[#13171F] my-[1.2rem] ${className}`}>
                <div
                    className={`code-block-panel__body flex items-center gap-[0.8rem] bg-[#1F232A] border border-[#2B2E36] overflow-x-auto font-mono text-[1.6rem] leading-1 text-slate-50 px-[1.2rem] ${bodyClassName}`}
                >
                    <div className="min-w-0 flex-1">{children}</div>
                    {showCopy ? <div className="flex h-[calc(1.2rem*1.7)] shrink-0 items-center">{copyButton}</div> : null}
                </div>
            </section>
        );
    }

    return (
        <section className={`code-block-panel overflow-hidden rounded-[2.4rem] border border-slate-700/60 bg-[#13171F] p-[0.4rem] ${className}`}>
            <header className="flex items-center justify-between gap-[1.2rem] px-[1.6rem]">
                {editableFileName ? (
                    <label className="flex min-w-0 items-center gap-0 font-mono text-[1.2rem] tracking-[0.02em]">
                        <span className="sr-only">코드 파일 이름</span>
                        <input
                            type="text"
                            value={baseName}
                            onChange={(event) => handleFileNameChange(event.target.value)}
                            onClick={(event) => event.stopPropagation()}
                            placeholder={baseName}
                            className="min-w-0 border border-[#2B2E36] text-slate-200 outline-none placeholder:text-slate-500 h-[2.4rem] bg-[#1F232A] rounded-[0.8rem] px-[0.8rem]"
                        />
                        {extension ? <span className="shrink-0 text-slate-400">{extension}</span> : null}
                    </label>
                ) : (
                    <p className="font-mono text-[1.2rem] font-medium tracking-[0.02em] text-slate-400">{label}</p>
                )}

                {actionButtons}
            </header>

            <div
                className={`code-block-panel__body bg-[#1F232A] rounded-[2.4rem] border border-[#2B2E36] overflow-x-auto px-[1.6rem] py-[1.6rem] font-mono text-[1.2rem] leading-[1.7] text-slate-50 ${bodyClassName}`}
            >
                {children}
            </div>
        </section>
    );
};

export default CodeBlockPanel;
