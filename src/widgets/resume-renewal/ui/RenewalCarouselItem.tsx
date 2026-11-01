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
            <section className="flex items-center gap-[0.8rem]">
                <Plus />
                <h2 className={`${open ? "text-[var(--color-brand-500)]" : ""}`}>{title}</h2>
                <p
                    className={`text-[1.2rem] skew-x-[-8deg] rounded-[0.2rem] bg-[var(--color-gray-200)] h-[1.4rem] px-[0.2rem] pt-[0.1rem] font-extrabold text-[var(--color-gray-500)] ${open ? "text-[var(--color-brand-500)]" : ""}`}
                    // className={`text-[1.2rem] skew-x-[-8deg] rounded-[0.2rem] bg-[var(--color-brand-500)] h-[1.4rem] px-[0.2rem] pt-[0.1rem] font-extrabold text-black ${open ? "text-[var(--color-brand-500)]" : ""}`}
                >
                    {open ? "Hide" : "View"}
                </p>
            </section>

            {open ? <p className="text-[var(--color-brand-300)]">{text}</p> : null}
        </button>
    );
};

const Plus = () => {
    return (
        <div className="h-[0.8rem] w-[0.8rem]">
            <div className="relative w-full h-full rotate-0">
                <div className="absolute top-[0] left-[50%] transform translate-x-[-50%] w-[0.14rem] h-full bg-[var(--color-brand-500)]" />
                <div className="absolute top-[50%] left-0 transform translate-y-[-50%] w-[0.8rem] h-[0.14rem] bg-[var(--color-brand-500)]" />
                <div className="absolute top-[50%] right-0 transform translate-y-[-50%] w-[0.8rem] h-[0.14rem] bg-[var(--color-brand-500)]" />
            </div>
        </div>
    );
};

export default RenewalCarouselItem;
