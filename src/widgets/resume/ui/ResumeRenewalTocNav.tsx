"use client";

import { useEffect, useState } from "react";

import { renewalTocItems } from "@/entities/resume/constants/resumeRenewalData";
import { R } from "./renewalStyles";

const ResumeRenewalTocNav = () => {
    const [activeId, setActiveId] = useState(renewalTocItems[0]?.id ?? "");
    useEffect(() => {
        const sections = renewalTocItems.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);

        if (sections.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible[0]?.target.id) {
                    setActiveId(visible[0].target.id);
                }
            },
            { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.25, 0.5] },
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    const handleClick = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <nav
            aria-label="페이지 목차"
            className={`${R.root} hidden pc:block fixed top-[12rem] right-[0] z-40 bg-black p-[2.4rem]`}
        >
            <ul className="flex flex-col gap-[0.4rem]">
                {renewalTocItems.map((item) => {
                    const isActive = activeId === item.id;

                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => handleClick(item.id)}
                                className={`w-full font-bold uppercase text-left text-[2rem] py-[0.4rem] transition-colors ${isActive ? "text-[#ffffff] font-medium" : "text-[#ffffff]/40 hover:text-[#000000]/70"}`}
                            >
                                {item.label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default ResumeRenewalTocNav;
