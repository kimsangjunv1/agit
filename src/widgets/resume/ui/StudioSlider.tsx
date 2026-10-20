"use client";

import { FormEvent, Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, PanInfo, useAnimationFrame, useMotionValue } from "motion/react";
import Image from "next/image";

import { R } from "./renewalStyles";

type StudioSliderProps = {
    items: {
        title: string;
        image: string;
    }[];
    touch?: boolean;
    embedded?: boolean;
    fullWidth?: boolean;
    variant?: "project" | "marquee";
    duration?: number;
};
export function StudioSlider({ items, touch = false, embedded = false, fullWidth = false, variant = "project", duration = 52 }: StudioSliderProps) {
    const isMarquee = variant === "marquee";
    const trackRef = useRef<HTMLDivElement | null>(null);
    const sliderItems = [...items, ...items];
    const x = useMotionValue(0);
    const isDraggingRef = useRef(false);
    const loopWidthRef = useRef(0);
    const velocityRef = useRef(0);

    const normalizeX = (value: number, loopWidth: number) => {
        if (!loopWidth) return value;

        const normalized = value % loopWidth;
        return normalized > 0 ? normalized - loopWidth : normalized;
    };

    useEffect(() => {
        if (!touch) return;

        const updateLoopWidth = () => {
            const trackWidth = trackRef.current?.scrollWidth ?? 0;
            const nextLoopWidth = trackWidth / 2;
            loopWidthRef.current = nextLoopWidth;
            x.set(normalizeX(x.get(), nextLoopWidth));
        };

        updateLoopWidth();
        window.addEventListener("resize", updateLoopWidth);

        return () => window.removeEventListener("resize", updateLoopWidth);
    }, [items, touch, x]);

    useAnimationFrame((_, delta) => {
        if (!touch || isDraggingRef.current) return;

        const loopWidth = loopWidthRef.current;

        if (!loopWidth) return;

        const nextX = x.get() + ((-40 + velocityRef.current) * delta) / 1000;
        x.set(normalizeX(nextX, loopWidth));

        const dampedVelocity = velocityRef.current * Math.pow(0.92, delta / 16.67);
        velocityRef.current = Math.abs(dampedVelocity) < 1 ? 0 : dampedVelocity;
    });

    const isStatic = embedded || fullWidth || isMarquee;

    const track = (
        <motion.div
            ref={trackRef}
            className={`flex w-max ${isMarquee ? "items-center gap-0" : "items-start gap-[0.4rem]"} ${touch ? "cursor-grab active:cursor-grabbing" : ""}`}
            animate={touch ? undefined : { x: ["0%", "-50%"] }}
            drag={touch ? "x" : false}
            dragElastic={touch ? 0.02 : undefined}
            dragMomentum={false}
            onDragStart={() => {
                isDraggingRef.current = true;
                velocityRef.current = 0;
            }}
            onDrag={() => {
                const loopWidth = loopWidthRef.current;

                if (!loopWidth) return;

                x.set(normalizeX(x.get(), loopWidth));
            }}
            onDragEnd={(_, info: PanInfo) => {
                isDraggingRef.current = false;
                velocityRef.current = info.velocity.x;
                x.set(normalizeX(x.get(), loopWidthRef.current));
            }}
            transition={touch ? undefined : { duration, ease: "linear", repeat: Infinity }}
            style={touch ? { x, touchAction: "pan-y" } : undefined}
        >
            {sliderItems.map((item, index) =>
                isMarquee ? (
                    <div
                        className="w-[100dvw] shrink-0"
                        key={`${item.title}-${index}`}
                    >
                        <img
                            alt=""
                            aria-hidden
                            className="block h-auto w-full select-none pointer-events-none"
                            src={item.image}
                            draggable={false}
                        />
                    </div>
                ) : (
                    <article
                        className={`${R.root} relative shrink-0 overflow-hidden bg-[var(--color-surface)]`}
                        key={`${item.title}-${index}`}
                    >
                        <img
                            alt={item.title}
                            className="block max-h-[50svh] w-auto h-auto object-contain object-top opacity-85 select-none pointer-events-none"
                            src={item.image}
                        />

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-surface-floating)]/95 to-transparent mobile:p-[2rem] pc:p-[3.2rem] h-[50%] flex items-end">
                            <h6 className="text-[var(--color-text-primary)] font-[700] mobile:text-[2.4rem] pc:text-[3.2rem]">{item.title}</h6>
                        </div>
                    </article>
                ),
            )}
        </motion.div>
    );

    if (isMarquee) {
        return <div className="w-full overflow-hidden">{track}</div>;
    }

    return (
        <motion.section
            className={`${R.root} overflow-hidden ${fullWidth ? "w-full" : embedded ? "h-full w-full min-h-[calc(100svh-6.4rem)]" : "pb-16"}`}
            initial={isStatic ? false : { opacity: 0, transform: "translateY(100px)" }}
            animate={isStatic ? undefined : { opacity: 1, transform: "translateY(0px)" }}
            exit={isStatic ? undefined : { opacity: 0, transform: "translateY(100px)" }}
            transition={
                isStatic
                    ? undefined
                    : {
                          delay: 0.4,
                          type: "spring",
                          mass: 0.1,
                          stiffness: 100,
                          damping: 10,
                      }
            }
        >
            {track}
        </motion.section>
    );
}
