"use client";

import { Check, ChevronDown, Copy, GitCommitHorizontal, ListFilter, Rss } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { changelogTypeLabels, formatContentDate } from "@/shared/lib/content";
import { ContentSections } from "@/widgets/resume/ui/ContentSections";
import { ChangelogTypeBadge } from "@/widgets/resume/ui/ChangelogTypeBadge";
import type { ChangelogEntry, ChangelogType } from "@/shared/lib/content";

function toMarkdown(entries: ChangelogEntry[]) {
    return entries
        .map((entry) => {
            const sections = entry.sections
                .map((section) => [section.heading ? `## ${section.heading}` : "", ...(section.paragraphs ?? []), ...(section.items ?? []).map((item) => `- ${item}`)].filter(Boolean).join("\n\n"))
                .join("\n\n");

            return `# ${entry.title}\n\n${entry.date} · ${changelogTypeLabels[entry.changeType]}\n\n${entry.summary}\n\n${sections}`;
        })
        .join("\n\n---\n\n");
}

export function ChangelogFeed({ entries }: { entries: ChangelogEntry[] }) {
    const [activeType, setActiveType] = useState<ChangelogType | "all">("all");
    const [copied, setCopied] = useState(false);
    const types = useMemo(() => Array.from(new Set(entries.map((entry) => entry.changeType))), [entries]);
    const visibleEntries = activeType === "all" ? entries : entries.filter((entry) => entry.changeType === activeType);

    const copyMarkdown = async () => {
        try {
            await navigator.clipboard.writeText(toMarkdown(visibleEntries));
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            setCopied(false);
        }
    };

    return (
        <>
            <div className="mb-[7.2rem] flex flex-wrap items-center gap-[0.8rem] border-t border-[var(--adaptive-border)] pt-[1.6rem]">
                <details className="group relative">
                    <summary className="flex h-[3.2rem] cursor-pointer list-none items-center gap-[0.8rem] rounded-[0.8rem] border border-[var(--adaptive-border)] bg-[var(--adaptive-surface)] px-[1.2rem] text-[1.2rem] text-[var(--adaptive-text-secondary)] transition-colors hover:bg-[var(--adaptive-greyOpacity100)] [&::-webkit-details-marker]:hidden">
                        <ListFilter size={16} />
                        {activeType === "all" ? "Filter" : changelogTypeLabels[activeType]}
                        <ChevronDown
                            className="transition-transform group-open:rotate-180"
                            size={12}
                        />
                    </summary>
                    <div className="absolute left-0 top-[calc(100%+0.8rem)] z-20 min-w-[18rem] rounded-[0.8rem] border border-[var(--adaptive-border)] bg-[var(--adaptive-surface)] p-[0.8rem] shadow-[var(--shadow-popup)]">
                        {["all", ...types].map((type) => (
                            <button
                                key={type}
                                type="button"
                                className="flex w-full items-center justify-between rounded-[0.4rem] px-[0.8rem] py-[0.8rem] text-left text-[1.2rem] text-[var(--adaptive-text-secondary)] hover:bg-[var(--adaptive-greyOpacity100)]"
                                onClick={() => setActiveType(type as ChangelogType | "all")}
                            >
                                {type === "all" ? "All changes" : changelogTypeLabels[type as ChangelogType]}
                                {activeType === type ? <Check size={16} /> : null}
                            </button>
                        ))}
                    </div>
                </details>

                <Link
                    className="inline-flex h-[3.2rem] items-center gap-[0.8rem] rounded-[0.8rem] border border-[var(--adaptive-border)] bg-[var(--adaptive-surface)] px-[1.2rem] text-[1.2rem] text-[var(--adaptive-text-secondary)] transition-colors hover:bg-[var(--adaptive-greyOpacity100)]"
                    href="/changelog/feed.xml"
                >
                    <Rss size={16} />
                    RSS
                </Link>

                <button
                    type="button"
                    className="inline-flex h-[3.2rem] items-center gap-[0.8rem] rounded-[0.8rem] border border-[var(--adaptive-border)] bg-[var(--adaptive-surface)] px-[1.2rem] text-[1.2rem] text-[var(--adaptive-text-secondary)] transition-colors hover:bg-[var(--adaptive-greyOpacity100)]"
                    onClick={copyMarkdown}
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied" : "Copy as Markdown"}
                </button>
            </div>

            <div className="relative border-l border-[var(--adaptive-border)] pc:ml-[1.2rem]">
                <div className="mb-[5.6rem] ml-[-1.2rem] inline-flex items-center gap-[1.2rem] bg-[var(--adaptive-background)] pr-[1.6rem] text-[1.2rem] font-semibold text-[var(--adaptive-text-muted)]">
                    <span className="h-[2rem] w-[2rem] rounded-[0.4rem] border border-[var(--adaptive-border)] bg-[var(--adaptive-surface)]" />
                    {new Date(`${visibleEntries[0]?.date ?? "2026-01-01"}T00:00:00Z`).getUTCFullYear()}
                </div>

                {visibleEntries.map((entry) => (
                    <article
                        className="grid scroll-mt-[12rem] pb-[8rem] pl-[2.4rem] pc:grid-cols-12 pc:gap-[3.2rem] pc:pb-[13.6rem]"
                        id={entry.slug}
                        key={entry.slug}
                    >
                        <div className="relative col-span-12 mb-[2.8rem] self-start pc:sticky pc:top-[12rem] pc:col-span-4 pc:mb-0">
                            <span className="absolute left-[-3.6rem] top-[0.4rem] hidden h-[2rem] w-[2rem] items-center justify-center rounded-[0.4rem] border border-[var(--adaptive-border)] bg-[var(--adaptive-surface)] text-[var(--adaptive-text-muted)] shadow-[var(--shadow-popup)] pc:flex">
                                <GitCommitHorizontal size={12} />
                            </span>
                            <Link
                                className="text-[2rem] font-medium leading-[1.35] tracking-[-0.025em] text-[var(--adaptive-text-primary)] hover:underline"
                                href={`/changelog/${entry.slug}`}
                            >
                                {entry.title}
                            </Link>
                            <div className="mt-[1.2rem] flex flex-wrap items-center gap-[0.8rem]">
                                <time
                                    className="text-[1.2rem] text-[var(--adaptive-text-muted)]"
                                    dateTime={entry.date}
                                >
                                    {formatContentDate(entry.date, false)}
                                </time>
                                <ChangelogTypeBadge type={entry.changeType} />
                            </div>
                        </div>

                        <div className="col-span-12 pc:col-span-8">
                            <p className="mb-[2.4rem] text-[1.6rem] leading-[1.75] text-[var(--adaptive-text-primary)]">{entry.summary}</p>
                            <ContentSections
                                compact
                                sections={entry.sections}
                            />
                            <div className="mt-[2.4rem] flex flex-wrap gap-[0.8rem]">
                                {entry.products.map((product) => (
                                    <span
                                        className="rounded-full border border-[var(--adaptive-border)] bg-[var(--adaptive-greyOpacity50)] px-[0.8rem] py-[0.4rem] text-[1.2rem] lowercase text-[var(--adaptive-text-muted)]"
                                        key={product}
                                    >
                                        {product}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </>
    );
}
