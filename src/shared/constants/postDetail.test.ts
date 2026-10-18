import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { PUBLIC_ISR_REVALIDATE_SECONDS } from "./postDetail";

const ISR_PAGE_FILES = ["src/app/(site)/page.tsx", "src/app/(site)/post/[id]/page.tsx"];

describe("PUBLIC_ISR_REVALIDATE_SECONDS", () => {
    it.each(ISR_PAGE_FILES)("matches revalidate export in %s", (relativePath) => {
        const source = readFileSync(join(process.cwd(), relativePath), "utf8");

        expect(source).toContain(`export const revalidate = ${PUBLIC_ISR_REVALIDATE_SECONDS}`);
    });
});
