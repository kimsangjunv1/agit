"use client";

import ReactLenis from "lenis/react";
import { usePathname } from "next/navigation";

const LENIS_ROUTES = new Set(["/resume", "/resume-renewal"]);

export default function LenisProvider() {
    const pathname = usePathname();

    if (!LENIS_ROUTES.has(pathname)) {
        return null;
    }

    return (
        <ReactLenis
            root
            options={{
                lerp: 0.2,
                // lerp: 0.26,
                // smoothWheel: true,
                // wheelMultiplier: 1,
                // syncTouch: true,
                // syncTouchLerp: 1,
                // touchInertiaExponent: 1,
                // touchMultiplier: 1,
                // duration: 0.1,
                // easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            }}
            // easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        />
    );
}
