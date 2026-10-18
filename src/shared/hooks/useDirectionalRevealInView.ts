import { RefObject, useEffect, useRef, useState } from "react";

type DirectionalRevealViewport = {
    margin?: string;
    amount?: number;
};

/**
 * clip reveal용 — 아래로 스크롤해 진입하면 reveal, 위쪽 이탈 시 유지,
 * 위로 스크롤해 아래쪽 이탈 시에만 hidden으로 복구.
 */
export const useDirectionalRevealInView = (ref: RefObject<Element | null>, { margin = "0px", amount = 0 }: DirectionalRevealViewport = {}) => {
    const [revealed, setRevealed] = useState(false);
    const scrollDirection = useRef<"up" | "down">("down");

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const onScroll = () => {
            const y = window.scrollY;
            if (y > lastScrollY) scrollDirection.current = "down";
            else if (y < lastScrollY) scrollDirection.current = "up";
            lastScrollY = y;
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry) return;

                if (entry.isIntersecting) {
                    setRevealed(true);
                    return;
                }

                const { top, bottom } = entry.boundingClientRect;
                const viewportHeight = window.innerHeight;

                if (top >= viewportHeight) {
                    setRevealed(false);
                    return;
                }

                if (bottom <= 0) return;

                if (scrollDirection.current === "up") {
                    setRevealed(false);
                }
            },
            { rootMargin: margin, threshold: amount },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [ref, margin, amount]);

    return revealed;
};
