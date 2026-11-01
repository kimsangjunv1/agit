"use client";

import { useEffect, useRef, useState } from "react";

const useResumeRenewalScroll = () => {
    const easyContainerRef = useRef<HTMLDivElement | null>(null);
    const detailContainerRef = useRef<HTMLDivElement | null>(null);
    const firstSectionRef = useRef<HTMLElement | null>(null);
    const [isFirstSectionVisible, setIsFirstSectionVisible] = useState(true);

    useEffect(() => {
        const viewport = detailContainerRef.current;
        const section = firstSectionRef.current;
        if (!viewport || !section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsFirstSectionVisible(Boolean(entry?.isIntersecting));
            },
            {
                root: viewport,
                threshold: 0,
            },
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    return {
        easyContainerRef,
        detailContainerRef,
        firstSectionRef,
        isFirstSectionVisible,
    };
};

export default useResumeRenewalScroll;
