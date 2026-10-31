import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { createMetalSurface, createSourceMaterial } from "./surface";

const silhouette = (width: number, height: number, inside: (x: number, y: number) => boolean) => {
    const alpha = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) alpha[y * width + x] = inside(x, y) ? 255 : 0;
    }
    return alpha;
};

describe("createSourceMaterial", () => {
    it("preserves the original gold highlights and dark reflections", () => {
        const pixels = new Uint8ClampedArray([255, 230, 143, 255, 56, 29, 7, 255]);
        const material = createSourceMaterial(pixels);
        expect(Array.from(material)).toEqual(Array.from(pixels));
        expect(material).not.toBe(pixels);
    });

    it("premultiplies transparent edges without changing source pixels or alpha", () => {
        const pixels = new Uint8ClampedArray([240, 176, 80, 128, 255, 255, 255, 0, 250, 220, 150, 64]);
        const original = pixels.slice();
        expect(Array.from(createSourceMaterial(pixels))).toEqual([120, 88, 40, 128, 0, 0, 0, 0, 63, 55, 38, 64]);
        expect(pixels).toEqual(original);
    });
});

describe("createMetalSurface", () => {
    it("preserves transparent holes and antialiased coverage", () => {
        const alpha = new Uint8Array([0, 64, 127, 128, 192, 255, 0, 255, 0]);
        const surface = createMetalSurface(alpha, 3, 3);
        expect(Array.from(alpha, (_, i) => surface[i * 4 + 1])).toEqual(Array.from(alpha));
    });

    it("keeps both thin and thick stroke centers recessed", () => {
        const width = 36;
        const alpha = silhouette(width, 31, (x, y) => y >= 2 && y <= 28 && ((x >= 2 && x <= 8) || (x >= 16 && x <= 30)));
        const surface = createMetalSurface(alpha, width, 31);
        const depth = (x: number) => surface[(15 * width + x) * 4];
        expect(depth(5)).toBeGreaterThan(245);
        expect(depth(23)).toBeGreaterThan(245);
        expect(depth(2)).toBeLessThan(depth(5));
        expect(depth(16)).toBeLessThan(depth(23));
    });

    it("gives opposite bevel walls opposite surface directions", () => {
        const width = 25;
        const alpha = silhouette(width, 31, (x, y) => x >= 4 && x <= 20 && y >= 2 && y <= 28);
        const surface = createMetalSurface(alpha, width, 31);
        const normalX = (x: number) => surface[(15 * width + x) * 4 + 2] - 128;
        expect(normalX(7) * normalX(17)).toBeLessThan(0);
        expect(Math.abs(normalX(7))).toBeGreaterThan(15);
    });

    it("keeps the stroke shoulders rounded without flattening their volume", () => {
        const width = 49;
        const alpha = silhouette(width, 61, (x, y) => x >= 4 && x <= 44 && y >= 2 && y <= 58);
        const surface = createMetalSurface(alpha, width, 61);
        const frontFacing = (x: number) => {
            const i = (30 * width + x) * 4;
            const nx = (surface[i + 2] / 255) * 2 - 1;
            const ny = (surface[i + 3] / 255) * 2 - 1;
            return Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        };
        // Mid-width shoulders retain curvature without becoming steep, cut-looking walls.
        expect(frontFacing(14)).toBeGreaterThan(0.5);
        expect(frontFacing(14)).toBeLessThan(0.8);
        expect(frontFacing(15)).toBeGreaterThan(frontFacing(13));
        expect(frontFacing(15) - frontFacing(13)).toBeLessThan(0.12);
    });

    it("retains curved bevel walls instead of flattening most of a round stroke", () => {
        const width = 49;
        const alpha = silhouette(width, width, (x, y) => {
            const radius = Math.hypot(x - 24, y - 24);
            return radius >= 12 && radius <= 21;
        });
        const surface = createMetalSurface(alpha, width, width);
        let stroke = 0;
        let floor = 0;
        for (let i = 0; i < alpha.length; i++) {
            if (!alpha[i]) continue;
            stroke++;
            if (surface[i * 4] > 230) floor++;
        }
        expect(floor / stroke).toBeLessThan(0.35);
    });

    it("retains bevels along the curved strokes in the company logo", async () => {
        const { data, info } = await sharp("public/images/common/ttobagi-logo.webp").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const alpha = Uint8Array.from({ length: info.width * info.height }, (_, i) => data[i * 4 + 3]);
        const surface = createMetalSurface(alpha, info.width, info.height);
        let stroke = 0;
        let floor = 0;
        for (let i = 0; i < alpha.length; i++) {
            if (alpha[i] < 128) continue;
            stroke++;
            if (surface[i * 4] > 230) floor++;
        }
        expect(floor / stroke).toBeLessThan(0.35);
    });

    it("preserves the normals around an internal cutout", () => {
        const width = 31;
        const alpha = silhouette(width, width, (x, y) => x >= 2 && x <= 28 && y >= 2 && y <= 28 && !(x >= 11 && x <= 19 && y >= 11 && y <= 19));
        const surface = createMetalSurface(alpha, width, width);
        expect(surface[(15 * width + 15) * 4 + 1]).toBe(0);
        expect(surface[(15 * width + 9) * 4 + 2]).not.toBe(surface[(15 * width + 21) * 4 + 2]);
    });

    it("handles empty silhouettes and strokes touching the image boundary", () => {
        const empty = createMetalSurface(new Uint8Array(9), 3, 3);
        expect(
            Array.from(empty)
                .filter((_, i) => i % 4 === 1)
                .every((value) => value === 0),
        ).toBe(true);
        const full = createMetalSurface(new Uint8Array(81).fill(255), 9, 9);
        expect(full[(4 * 9 + 4) * 4]).toBeGreaterThan(245);
        expect(full[(4 * 9 + 4) * 4 + 2]).toBeCloseTo(128, -1);
    });
});
