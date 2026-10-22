import { describe, expect, it } from "vitest";

import { buildPostMetadata, buildCanonicalUrl, serializeJsonLd } from "@/shared/lib/seo/metadata";

describe("buildCanonicalUrl", () => {
    it("절대 URL을 생성한다", () => {
        expect(buildCanonicalUrl("/post/1")).toBe("http://localhost:3100/post/1");
    });
});

describe("buildPostMetadata", () => {
    it("게시물 제목과 요약을 메타데이터에 반영한다", () => {
        const metadata = buildPostMetadata({
            idx: 1,
            title: "테스트 게시물",
            summary: "요약 내용",
            thumbnail: "https://example.com/thumb.jpg",
            created_at: "2025-01-01T00:00:00.000Z",
        });

        expect(metadata.title).toBe("테스트 게시물");
        expect(metadata.description).toBe("요약 내용");
        expect(metadata.alternates?.canonical).toBe("/post/1");
        expect(metadata.openGraph?.title).toBe("테스트 게시물");
    });
});

describe("serializeJsonLd", () => {
    it("스크립트를 끊는 < 문자를 이스케이프한다", () => {
        const serialized = serializeJsonLd({ headline: "</script><script>" });

        expect(serialized).not.toContain("<");
        expect(serialized).toContain("\\u003c/script>\\u003cscript>");
    });
});
