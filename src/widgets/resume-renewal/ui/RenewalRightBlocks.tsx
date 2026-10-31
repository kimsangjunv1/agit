"use client";

import { ReactNode, useRef } from "react";

import { RENEWAL_VIEWPORT } from "@/entities/resume/constants/resumeRenewalData";
import { useDirectionalRevealInView } from "@/shared/hooks/useDirectionalRevealInView";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { ClippedRevealBlock } from "./ClippedRevealText";

/** 블록 간 순차 delay — 각 블록이 구분되도록 */
const BLOCK_STAGGER = 0.14;

type RenewalRightBlocksProps = {
    label?: ReactNode;
    headline?: ReactNode;
    description?: ReactNode;
    details?: ReactNode;
    /** details 대신 항목별 ClippedReveal + stagger 적용 */
    detailItems?: ReactNode[];
    detailItemsClassName?: string;
    className?: string;
};

const RenewalRightBlocks = ({ label, headline, description, details, detailItems, detailItemsClassName = "flex flex-col gap-[2rem]", className = "" }: RenewalRightBlocksProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const revealed = useDirectionalRevealInView(ref, RENEWAL_VIEWPORT);
    const reducedMotion = useReducedMotion();

    const blocks = [
        { key: "label", content: label },
        { key: "headline", content: headline },
        { key: "description", content: description },
    ].filter(({ content }) => content != null && content !== false);

    const hasDetailItems = detailItems != null && detailItems.length > 0;
    const hasDetails = details != null && details !== false;

    const renderDetailItems = (startIndex: number) => {
        if (!hasDetailItems) return null;

        return (
            <div className={detailItemsClassName}>
                {detailItems.map((item, index) => (
                    <ClippedRevealBlock
                        key={index}
                        revealed={revealed}
                        delay={(startIndex + index) * BLOCK_STAGGER}
                    >
                        {item}
                    </ClippedRevealBlock>
                ))}
            </div>
        );
    };

    if (reducedMotion) {
        return (
            <div
                ref={ref}
                className={`flex flex-col gap-[3.2rem] ${className}`}
            >
                {blocks.map(({ key, content }) => (
                    <div key={key}>{content}</div>
                ))}
                {hasDetailItems ? <div className={detailItemsClassName}>{detailItems}</div> : null}
                {hasDetails && !hasDetailItems ? <div>{details}</div> : null}
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className={`flex flex-col gap-[3.2rem] ${className}`}
        >
            {blocks.map(({ key, content }, index) => (
                <ClippedRevealBlock
                    key={key}
                    revealed={revealed}
                    delay={index * BLOCK_STAGGER}
                >
                    {content}
                </ClippedRevealBlock>
            ))}
            {hasDetailItems ? renderDetailItems(blocks.length) : null}
            {hasDetails && !hasDetailItems ? (
                <ClippedRevealBlock
                    revealed={revealed}
                    delay={blocks.length * BLOCK_STAGGER}
                >
                    {details}
                </ClippedRevealBlock>
            ) : null}
        </div>
    );
};

export default RenewalRightBlocks;
