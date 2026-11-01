"use client";

import { ResumeRenewalPageProvider } from "./model/ResumeRenewalContext";
import * as Layer from "./ui";

export default function Panel() {
    return (
        <ResumeRenewalPageProvider>
            <article className="relative w-full overflow-x-hidden grid grid-cols-2 text-[2rem] text-[var(--color-text-primary)]">
                <Layer.DetailColumn />
                <Layer.OverviewColumn />
                <Layer.StickyMascot />
            </article>
        </ResumeRenewalPageProvider>
    );
}
