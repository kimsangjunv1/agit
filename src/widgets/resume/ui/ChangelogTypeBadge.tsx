import { changelogTypeLabels } from "@/shared/lib/content";
import type { ChangelogType } from "@/shared/lib/content";

const typeStyles: Record<ChangelogType, string> = {
    "new-feature": "border-[var(--adaptive-green500)] bg-[var(--adaptive-greenOpacity50)] text-[var(--adaptive-green700)]",
    improvement: "border-[var(--adaptive-border)] bg-[var(--adaptive-greyOpacity100)] text-[var(--adaptive-text-secondary)]",
    "bug-fix": "border-[var(--adaptive-red500)] bg-[var(--adaptive-redOpacity50)] text-[var(--adaptive-red700)]",
    documentation: "border-[var(--adaptive-blue500)] bg-[var(--adaptive-blueOpacity50)] text-[var(--adaptive-blue700)]",
};

export function ChangelogTypeBadge({ type }: { type: ChangelogType }) {
    return <span className={`inline-flex rounded-full border px-[0.8rem] py-[0.4rem] text-[0.8rem] font-semibold uppercase tracking-[0.08em] ${typeStyles[type]}`}>{changelogTypeLabels[type]}</span>;
}
