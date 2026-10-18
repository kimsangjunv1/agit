import type { CSSProperties } from "react";

export const hashString = (value: string): number => {
    let hash = 5381;

    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 33) ^ value.charCodeAt(index);
    }

    return Math.abs(hash);
};

const pickFromHash = (hash: number, slot: number, min: number, max: number): number => {
    const combined = hash ^ (slot * 2654435761);

    return min + (Math.abs(combined) % (max - min + 1));
};

export const generateMeshGradientStyle = (seed: string | number): CSSProperties => {
    const hash = hashString(String(seed));
    const baseHue = hash % 360;
    const hues = [baseHue, (baseHue + 35 + pickFromHash(hash, 1, 0, 70)) % 360, (baseHue + 110 + pickFromHash(hash, 2, 0, 55)) % 360, (baseHue + 195 + pickFromHash(hash, 3, 0, 65)) % 360];

    const blobs = hues.map((hue, index) => ({
        hue,
        x: 8 + pickFromHash(hash, index + 4, 0, 84),
        y: 8 + pickFromHash(hash, index + 8, 0, 84),
        width: 58 + pickFromHash(hash, index + 12, 0, 42),
        height: 48 + pickFromHash(hash, index + 16, 0, 52),
        saturation: 42 + pickFromHash(hash, index + 20, 0, 24),
        lightness: 56 + pickFromHash(hash, index + 24, 0, 14),
        opacity: (55 + pickFromHash(hash, index + 28, 0, 35)) / 100,
    }));

    const baseSaturation = 18 + pickFromHash(hash, 40, 0, 12);
    const baseLightness = 88 + pickFromHash(hash, 41, 0, 8);
    const baseColor = `hsl(${baseHue} ${baseSaturation}% ${baseLightness}%)`;

    const gradients = blobs
        .map((blob) => `radial-gradient(ellipse ${blob.width}% ${blob.height}% at ${blob.x}% ${blob.y}%, hsl(${blob.hue} ${blob.saturation}% ${blob.lightness}% / ${blob.opacity}), transparent)`)
        .join(", ");

    return {
        background: `${gradients}, ${baseColor}`,
    };
};

export const THUMBNAIL_NOISE_DATA_URI = `url("data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`;

export const hasPostThumbnail = (src?: string | null): src is string => Boolean(src?.trim());
