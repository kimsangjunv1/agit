import { describe, expect, it } from "vitest";

import { parsePostMarkdown } from "./parsePostMarkdown";

describe("parsePostMarkdown", () => {
    it("converts headings, content, and two-column tables to editor rows", () => {
        const result = parsePostMarkdown(
            `# 게시글 제목

> 게시글 요약

## 첫 번째 단락

본문 **강조**입니다.

| 왼쪽: 코드 | 오른쪽: 설명 |
| --- | --- |
| \`next start\` | 기본 실행 방식입니다. |

## 두 번째 단락

- 항목 1
- 항목 2`,
            "test",
        );

        expect(result.title).toBe("게시글 제목");
        expect(result.summary).toBe("게시글 요약");
        expect(result.rows).toHaveLength(3);
        expect(result.rows[0][0]).toMatchObject({
            title: "첫 번째 단락",
            blockMode: "main",
        });
        expect(result.rows[0][0].content).toContain("<strong>강조</strong>");
        expect(result.rows[1]).toHaveLength(2);
        expect(result.rows[1][0].content).toContain("<strong>왼쪽: 코드</strong>");
        expect(result.rows[2][0]).toMatchObject({
            title: "두 번째 단락",
            blockMode: "main",
        });
        expect(result.rows[2][0].content).toContain("<ul>");
    });

    it("detects each table cell block mode independently", () => {
        const result = parsePostMarkdown(
            `# 게시글 제목

## 코드 예시

| 왼쪽: app/template.tsx | 오른쪽: 설명 |
| --- | --- |
| \`\`\`tsx<br/>'use client';<br/><br/>export default function Template() {}<br/>\`\`\` | ## 동작 방식<br/><br/>라우트 변경 시 다시 마운트됩니다. |`,
            "test",
        );

        expect(result.rows[1][0]).toMatchObject({
            title: "app/template.tsx",
            blockMode: "code",
        });
        expect(result.rows[1][0].content).toContain('class="language-tsx"');
        expect(result.rows[1][0].content).toContain("export default function Template()");
        expect(result.rows[1][1]).toMatchObject({
            title: "동작 방식",
            blockMode: "main",
        });
        expect(result.rows[1][1].content).toContain("라우트 변경 시 다시 마운트됩니다.");
    });

    it("applies explicit integrated and table cell block directives", () => {
        const result = parsePostMarkdown(
            `# 게시글 제목

[통합/서브]

## 의심했던 지점

- localStorage
- window

| 왼쪽 | 오른쪽 |
| --- | --- |
| [왼쪽/코드]<br/><br/>파일 예시<br/><br/>\`\`\`tsx<br/>const token = localStorage.getItem('token');<br/>\`\`\` | [오른쪽/메인]<br/><br/>서버는 localStorage를 알 수 없습니다. |

[통합/코드]

\`\`\`tsx
export function ClientOnly() {}
\`\`\``,
            "test",
        );

        expect(result.rows[0][0]).toMatchObject({
            title: "",
            blockMode: "sub",
        });
        expect(result.rows[0][0].content).not.toContain("[통합/서브]");
        expect(result.rows[1][0]).toMatchObject({
            title: "파일 예시",
            blockMode: "code",
        });
        expect(result.rows[1][0].content).not.toContain("[왼쪽/코드]");
        expect(result.rows[1][1]).toMatchObject({
            title: "",
            blockMode: "main",
        });
        expect(result.rows[1][1].content).not.toContain("[오른쪽/메인]");
        expect(result.rows[2][0]).toMatchObject({
            title: "",
            blockMode: "code",
        });
    });

    it("keeps multiline code content inside a table cell", () => {
        const result = parsePostMarkdown(
            `# 게시글 제목

[통합/메인]

## 렌더링 차이

| 왼쪽 | 오른쪽 |
| --- | --- |
| [왼쪽/서브]<br/><br/>서버 결과<br/><br/>\`\`\`txt<br/><LoginButton />
\`\`\`<br/><br/>브라우저 결과<br/><br/>\`\`\`txt<br/><UserMenu />
\`\`\` | [오른쪽/메인]<br/><br/>첫 렌더링 결과가 달랐습니다. |`,
            "test",
        );

        expect(result.rows[1]).toHaveLength(2);
        expect(result.rows[1][0]).toMatchObject({ blockMode: "sub" });
        expect(result.rows[1][0].content).toContain("&lt;LoginButton /&gt;");
        expect(result.rows[1][0].content).toContain("&lt;UserMenu /&gt;");
        expect(result.rows[1][1]).toMatchObject({ blockMode: "main" });
    });

    it("keeps pipe characters in code, titleless integrated blocks, and subtitles", () => {
        const result = parsePostMarkdown(
            `# 게시글 제목

[통합/메인]

## 해결 방향

부제목: 브라우저가 준비된 뒤 바꿨다

해결 방향은 명확했습니다.

| Before | After |
|---|---|
| [왼쪽/코드]<br/><br/>파일명: Header<br/><br/>\`\`\`tsx<br/>const token: string | null = null;<br/>\`\`\` | [오른쪽/코드]<br/><br/>파일명: Header<br/><br/>\`\`\`tsx<br/>const [token, setToken] = useState<string | null>(null);<br/>\`\`\` |

[통합/서브]

핵심은 mounted 상태였습니다.

| 왼쪽 | 오른쪽 |
|---|---|
| [왼쪽/코드]<br/><br/>파일명: useMounted<br/><br/>\`\`\`tsx<br/>export function useMounted() {}<br/>\`\`\` | [오른쪽/서브] 여러 컴포넌트에서 같은 패턴이 반복됩니다. |`,
            "test",
        );

        expect(result.rows[0][0]).toMatchObject({
            title: "해결 방향",
            subtitle: "브라우저가 준비된 뒤 바꿨다",
            blockMode: "main",
        });
        expect(result.rows[0][0].content).not.toContain("부제목:");
        expect(result.rows[1]).toHaveLength(2);
        expect(result.rows[1][0].content).toContain("string | null");
        expect(result.rows[1][1].content).toContain("string | null");
        expect(result.rows[2][0]).toMatchObject({ blockMode: "sub" });
        expect(result.rows[2][0].content).toContain("핵심은 mounted 상태였습니다.");
        expect(result.rows[3]).toHaveLength(2);
    });
});
