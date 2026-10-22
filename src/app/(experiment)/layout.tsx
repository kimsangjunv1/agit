import type { Metadata } from "next";
import { ReactNode } from "react";

import { NOINDEX_METADATA } from "@/shared/lib/seo/metadata";

export const metadata: Metadata = NOINDEX_METADATA;

export default function ExperimentLayout({ children }: { children: ReactNode }) {
    return children;
}
