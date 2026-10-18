import { describe, expect, it } from "vitest";

import type { SectionContent } from "@/entities/post/model/post.type";
import { getNextBlockModePatch } from "./blockMode";

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
