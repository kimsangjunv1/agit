"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

import useNavigate from "@/shared/hooks/useNavigate";

type TransitionLinkProps = ComponentProps<typeof Link>;

const isModifiedClick = (event: React.MouseEvent<HTMLAnchorElement>) => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

const isInternalHref = (href: TransitionLinkProps["href"]) => {
    const path = typeof href === "string" ? href : (href.pathname ?? "/");
    return path.startsWith("/");
};

const TransitionLink = ({ href, onClick, onMouseEnter, ...props }: TransitionLinkProps) => {
    const router = useRouter();
    const { pushToUrl } = useNavigate();

    const hrefString = typeof href === "string" ? href : (href.pathname ?? "/");

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || isModifiedClick(event)) return;

        if (!isInternalHref(href)) return;

        event.preventDefault();
        pushToUrl(hrefString);
    };

    const handleMouseEnter = (event: React.MouseEvent<HTMLAnchorElement>) => {
        onMouseEnter?.(event);

        if (isInternalHref(href)) {
            router.prefetch(hrefString);
        }
    };

    return (
        <Link
            href={href}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            {...props}
        />
    );
};

export default TransitionLink;
