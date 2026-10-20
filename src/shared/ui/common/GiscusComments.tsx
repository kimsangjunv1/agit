"use client";

import Giscus from "@giscus/react";

type GiscusCommentsProps = {
    term: string;
    className?: string;
};

const isGiscusConfigured = () =>
    Boolean(process.env.NEXT_PUBLIC_GISCUS_REPO && process.env.NEXT_PUBLIC_GISCUS_REPO_ID && process.env.NEXT_PUBLIC_GISCUS_CATEGORY && process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID);

const GiscusComments = ({ term, className }: GiscusCommentsProps) => {
    if (!isGiscusConfigured()) return null;

    return (
        <section
            id="comments"
            className={`scroll-mt-[18rem] tablet:scroll-mt-[12rem] ${className ?? ""}`}
        >
            <Giscus
                repo={process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}`}
                repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID!}
                category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY}
                categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID}
                mapping="specific"
                term={term}
                strict="0"
                reactionsEnabled="0"
                emitMetadata="0"
                inputPosition="bottom"
                theme="transparent_dark"
                lang="ko"
                loading="lazy"
            />
            {/* <h3 className="text-[2.0rem] font-bold text-[var(--color-gray-1000)] mb-[2.4rem]">댓글</h3>
            <div className="giscus w-full">
            </div> */}
        </section>
    );
};

export default GiscusComments;
