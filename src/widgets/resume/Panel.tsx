"use client";

import { renewalExperiences } from "@/entities/resume/constants/resumeRenewalData";

import * as Layer from "./ui";
import { R } from "./ui/renewalStyles";

export default function Panel() {
    return (
        <article className={`relative w-full overflow-x-hidden bg-white ${R.root}`}>
            {/* <Layer.TocNav /> */}
            <Layer.Hero />
            <Layer.Worklog entries={renewalExperiences} />
            {/* <Layer.SkillSection /> */}
            <Layer.ProjectGrid />
            <Layer.SideProject />
            <Layer.Awwwards />
            <Layer.Footer />
            <Layer.EmailBannerSection />
        </article>
    );
}
