"use client";

import { ResumeRenewalPageProvider } from "./model/ResumeRenewalContext";
import * as Layer from "./ui";

export default function Panel() {
    return (
        <ResumeRenewalPageProvider>
            <article className="relative w-full overflow-x-hidden grid tablet:grid-cols-1 pc:grid-cols-2 text-[2rem] text-[var(--color-gray-900)]">
                <Layer.DetailColumn />
                <Layer.OverviewColumn />
                <Layer.StickyMascot />
            </article>
        </ResumeRenewalPageProvider>
    );
}
