"use client";

import { useState } from "react";

type RenewalCarouselItemProps = {
    title: string;
    text?: string;
};

const RenewalCarouselItem = ({ title, text }: RenewalCarouselItemProps) => {
    const [open, setOpen] = useState(false);
    return (
        <button
            className={`flex flex-col items-start gap-[0.4rem] ${open ? "mb-[1.2rem]" : ""}`}
            onClick={() => setOpen(!open)}
        >
            <section className="flex gap-[0.8rem]">
                <h2 className={`${open ? "text-[var(--color-brand-500)]" : ""}`}>{title}</h2>
                <p
                    className={`text-[1.2rem] skew-x-[-8deg] rounded-[0.2rem] bg-[var(--color-brand-500)] h-[1.5rem] px-[0.2rem] pt-[0.1rem] font-extrabold text-black ${open ? "text-[var(--color-brand-500)]" : ""}`}
                >
                    {open ? "Hide" : "View"}
                </p>
            </section>

            {open ? <p className="text-[var(--color-brand-300)]">{text}</p> : null}
        </button>
    );
};

export default RenewalCarouselItem;
