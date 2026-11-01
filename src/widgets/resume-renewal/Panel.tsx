"use client";

import { renewalExperiences } from "@/entities/resume/constants/resumeRenewalData";

import { ResumeRenewalPageProvider } from "./model/ResumeRenewalContext";
import * as Layer from "./ui";
import { R } from "./ui/renewalStyles";

export default function Panel() {
    return (
        <ResumeRenewalPageProvider>
            <article className={`relative w-full overflow-x-hidden grid grid-cols-2 ${R.root}`}>
                <Layer.DetailColumn />
                <Layer.OverviewColumn />
                <Layer.StickyMascot />
                {/* <Layer.Hero />
                <Layer.Worklog entries={renewalExperiences} />
                <Layer.ProjectGrid />
                <Layer.SideProject />
                <Layer.Awwwards />
                <Layer.Footer />
                <Layer.EmailBannerSection /> */}
            </article>
        </ResumeRenewalPageProvider>
    );
}
