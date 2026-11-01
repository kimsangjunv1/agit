import type { ReactNode, RefObject } from "react";

type RenewalSectionItemProps = {
    title: string;
    text?: string;
    element?: ReactNode;
    backdrop?: ReactNode;
    className?: { container?: string; title?: string; text?: string };
    divider?: boolean;
    isFirstSection?: boolean;
    sectionRef?: RefObject<HTMLElement | null>;
};

const RenewalSectionItem = ({ title, text, element, backdrop, divider = true, isFirstSection = false, sectionRef, className }: RenewalSectionItemProps) => {
    const contentLayerClassName = backdrop ? "relative z-10" : "";

    return (
        <section
            ref={sectionRef}
            className={`pb-[5.2rem] px-[5.2rem] flex flex-col gap-[1.6rem] ${className?.container ? className?.container : ""} ${divider ? "border-b border-b-[#ffffff20]" : ""} ${isFirstSection ? "pt-[19.2rem]" : "pt-[5.2rem]"}`}
        >
            {backdrop}
            <h5 className={`${contentLayerClassName} ${className?.title ?? ""} font-bold`}>{title}</h5>
            <p className={`${contentLayerClassName} ${className?.text ?? ""} ${className?.text ? "" : "leading-[1.5]"} `}>{text}</p>
            {element ? <div className={contentLayerClassName}>{element}</div> : null}
        </section>
    );
};

export default RenewalSectionItem;
