import type { Metadata } from "next";

import { getSiteUrl } from "@/shared/lib/siteUrl";
import { AUTHOR_NAME, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME } from "@/shared/lib/seo/constants";

type PostMetadataInput = {
    idx: number;
    title: string;
    summary: string;
    thumbnail?: string;
    created_at?: string;
};

export const NOINDEX_METADATA: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export function buildCanonicalUrl(path: string) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${getSiteUrl()}${normalizedPath}`;
}

export function buildPostMetadata(post: PostMetadataInput): Metadata {
    const path = `/post/${post.idx}`;
    const description = post.summary?.trim() || SITE_DESCRIPTION;
    const images = post.thumbnail ? [{ url: post.thumbnail, alt: post.title }] : undefined;

    return {
        title: post.title,
        description,
        keywords: [...SITE_KEYWORDS, post.title],
        alternates: {
            canonical: path,
        },
        openGraph: {
            type: "article",
            locale: "ko_KR",
            siteName: SITE_NAME,
            title: post.title,
            description,
            url: buildCanonicalUrl(path),
            publishedTime: post.created_at,
            images,
        },
        twitter: {
            card: post.thumbnail ? "summary_large_image" : "summary",
            title: post.title,
            description,
            images: post.thumbnail ? [post.thumbnail] : undefined,
        },
    };
}

export function buildPageMetadata({ title, description = SITE_DESCRIPTION, path }: { title: string; description?: string; path: string }): Metadata {
    return {
        title,
        description,
        keywords: SITE_KEYWORDS,
        alternates: {
            canonical: path,
        },
        openGraph: {
            type: "website",
            locale: "ko_KR",
            siteName: SITE_NAME,
            title: `${title} | ${SITE_NAME}`,
            description,
            url: buildCanonicalUrl(path),
        },
        twitter: {
            card: "summary",
            title: `${title} | ${SITE_NAME}`,
            description,
        },
    };
}

export function buildWebsiteJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: getSiteUrl(),
        inLanguage: "ko-KR",
        author: {
            "@type": "Person",
            name: AUTHOR_NAME,
        },
    };
}

export function buildBlogPostingJsonLd(post: PostMetadataInput) {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.summary,
        image: post.thumbnail ? [post.thumbnail] : undefined,
        datePublished: post.created_at,
        author: {
            "@type": "Person",
            name: AUTHOR_NAME,
        },
        publisher: {
            "@type": "Organization",
            name: SITE_NAME,
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": buildCanonicalUrl(`/post/${post.idx}`),
        },
    };
}
