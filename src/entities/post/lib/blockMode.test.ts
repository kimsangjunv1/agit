import { describe, expect, it } from "vitest";

import type { SectionContent } from "@/entities/post/model/post.type";
import { getNextBlockModePatch, getSectionEndRowIndexes } from "./blockMode";

describe("getNextBlockModePatch", () => {
    it("keeps content when switching from code to main", () => {
        const block: SectionContent = {
            id: "block-1",
            type: 0,
            title: "script",
            subtitle: "",
            summary: "",
            content: "<pre><code>const answer = 42;</code></pre>",
            imageUrl: "",
            blockMode: "code",
        };

        const nextBlock = { ...block, ...getNextBlockModePatch(block) };

        expect(nextBlock.blockMode).toBe("main");
        expect(nextBlock.content).toBe(block.content);
    });
});

const rowBlock = (id: string, blockMode: "main" | "sub" | "code"): SectionContent => ({
    id,
    type: blockMode === "code" ? 2 : 0,
    title: blockMode === "main" ? "제목" : "",
    summary: "",
    subtitle: blockMode === "main" ? "부제" : "",
    content: "",
    imageUrl: "",
    blockMode,
});

describe("getSectionEndRowIndexes", () => {
    it("내용 블록이 없으면 대제목 행을 소절 끝으로 본다", () => {
        const rows = [[rowBlock("main-1", "main")], [rowBlock("main-2", "main")]];

        expect([...getSectionEndRowIndexes(rows)]).toEqual([0]);
    });

    it("마지막 내용 블록이 있는 행만 소절 끝으로 본다", () => {
        const rows = [[rowBlock("main-1", "main")], [rowBlock("sub-1", "sub")], [rowBlock("sub-2", "sub")], [rowBlock("main-2", "main")]];

        expect([...getSectionEndRowIndexes(rows)]).toEqual([2]);
    });

    it("코드 행이 뒤에 있어도 간격은 마지막 내용 행에 둔다", () => {
        const rows = [[rowBlock("main-1", "main")], [rowBlock("sub-1", "sub")], [rowBlock("code-1", "code")], [rowBlock("main-2", "main")]];

        expect([...getSectionEndRowIndexes(rows)]).toEqual([1]);
    });

    it("목록의 마지막 행에는 소절 끝 간격을 두지 않는다", () => {
        const rows = [[rowBlock("main-1", "main")], [rowBlock("sub-1", "sub")]];

        expect([...getSectionEndRowIndexes(rows)]).toEqual([]);
    });

    it("같은 행의 뒤쪽 대제목이 내용 블록을 가지면 그 행은 붙인다", () => {
        const rows = [[rowBlock("left", "main"), rowBlock("right", "main")], [rowBlock("sub-1", "sub")], [rowBlock("next", "main")]];

        expect([...getSectionEndRowIndexes(rows)]).toEqual([1]);
    });
});
