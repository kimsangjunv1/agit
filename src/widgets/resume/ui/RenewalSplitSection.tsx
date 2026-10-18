"use client";

import { ReactNode } from "react";

import { R } from "./renewalStyles";

type RenewalSplitSectionProps = {
    id?: string;
    left?: ReactNode;
    children: ReactNode;
    className?: string;
    divider?: boolean;
    /** 왼쪽 영역 패딩 없이 섹션 절반을 꽉 채울 때 */
    leftFill?: boolean;
    /** leftFill 또는 기본 left 래퍼에 추가할 클래스 */
    leftWrapperClassName?: string;
    /** 오른쪽 컬럼(R.right)에 추가할 클래스 */
    rightClassName?: string;
    /** split 그리드(R.split)에 추가할 클래스 */
    splitClassName?: string;
    /** 오른쪽 inner(R.rightInner)에 추가할 클래스 */
    rightInnerClassName?: string;
};

const RenewalSplitSection = ({
    id,
    left,
    children,
    className = "",
    divider = false,
    leftFill = false,
    leftWrapperClassName = "",
    rightClassName = "",
    splitClassName = "",
    rightInnerClassName = "",
}: RenewalSplitSectionProps) => {
    const leftFillClasses = leftWrapperClassName || "min-h-[100svh] p-[3.2rem]";

    return (
        <section
            id={id}
            className={`${R.root} ${R.section} ${divider ? R.divider : ""} ${className}`}
        >
            <div className={`${R.split} ${splitClassName}`}>
                {left ? (
                    leftFill ? (
                        <div className={`relative box-border ${leftFillClasses}`}>{left}</div>
                    ) : (
                        <div className={`flex items-start justify-center px-[2.4rem] tablet:px-[4rem] py-[4rem] tablet:py-[8rem] min-h-[24rem] tablet:min-h-[48rem] ${leftWrapperClassName}`}>
                            <div className={R.leftInner}>{left}</div>
                        </div>
                    )
                ) : (
                    <div
                        className="hidden tablet:block"
                        aria-hidden
                    />
                )}

                <div className={`${R.right} ${rightClassName}`}>
                    <div className={`${R.rightInner} ${rightInnerClassName}`}>{children}</div>
                </div>
            </div>
        </section>
    );
};

export default RenewalSplitSection;
