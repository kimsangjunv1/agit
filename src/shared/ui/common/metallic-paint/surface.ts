const smoothDerivative = (value: number, start: number, end: number) => {
    if (value <= start || value >= end) return 0;
    const t = (value - start) / (end - start);
    return (6 * t * (1 - t)) / (end - start);
};

/** Keep the source shading, premultiplied so filtering preserves transparent edges. */
export function createSourceMaterial(pixels: Uint8ClampedArray): Uint8ClampedArray {
    const material = pixels.slice();
    for (let i = 0; i < material.length; i += 4) {
        const alpha = material[i + 3] / 255;
        material[i] = Math.round(material[i] * alpha);
        material[i + 1] = Math.round(material[i + 1] * alpha);
        material[i + 2] = Math.round(material[i + 2] * alpha);
    }
    return material;
}

/** Coverage and local groove coordinates, with the surface normal packed in BA. */
export function createMetalSurface(alpha: Uint8Array, width: number, height: number): Uint8ClampedArray {
    if (width < 1 || height < 1 || alpha.length !== width * height) throw new RangeError("Invalid metal silhouette dimensions");
    const stride = width + 2;
    const rows = height + 2;
    const size = stride * rows;
    const squared = new Float32Array(size);
    const inside = new Uint8Array(size);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y + 1) * stride + x + 1;
            inside[i] = alpha[y * width + x] >= 128 ? 1 : 0;
            squared[i] = inside[i] ? 1e12 : 0;
        }
    }

    // Exact Euclidean distance transform. Padding also gives opaque images a boundary.
    const length = Math.max(stride, rows);
    const input = new Float32Array(length);
    const output = new Float32Array(length);
    const sites = new Int32Array(length);
    const cuts = new Float64Array(length + 1);
    const transform = (count: number) => {
        let last = 0;
        sites[0] = 0;
        cuts[0] = -Infinity;
        cuts[1] = Infinity;
        for (let q = 1; q < count; q++) {
            let p = sites[last];
            let cut = (input[q] + q * q - input[p] - p * p) / (2 * (q - p));
            while (cut <= cuts[last]) {
                p = sites[--last];
                cut = (input[q] + q * q - input[p] - p * p) / (2 * (q - p));
            }
            sites[++last] = q;
            cuts[last] = cut;
            cuts[last + 1] = Infinity;
        }
        last = 0;
        for (let q = 0; q < count; q++) {
            while (cuts[last + 1] < q) last++;
            const delta = q - sites[last];
            output[q] = delta * delta + input[sites[last]];
        }
    };
    for (let y = 0; y < rows; y++) {
        input.set(squared.subarray(y * stride, (y + 1) * stride));
        transform(stride);
        squared.set(output.subarray(0, stride), y * stride);
    }
    for (let x = 0; x < stride; x++) {
        for (let y = 0; y < rows; y++) input[y] = squared[y * stride + x];
        transform(rows);
        for (let y = 0; y < rows; y++) squared[y * stride + x] = inside[y * stride + x] ? Math.max(0.5, Math.sqrt(output[y]) - 0.5) : 0;
    }

    const radii = squared.slice();
    const reach = squared.slice();
    // Propagate inscribed radii through the silhouette. The slight metric allowance
    // prevents staircase edges from becoming false medial axes on curved PNG strokes.
    for (let pass = 0; pass < 4; pass++) {
        const direction = pass % 2 === 0 ? 1 : -1;
        const offsets = [-direction, -direction * stride, -direction * (stride - 1), -direction * (stride + 1)];
        for (let row = 0; row < height; row++) {
            const y = direction === 1 ? row + 1 : height - row;
            for (let column = 0; column < width; column++) {
                const x = direction === 1 ? column + 1 : width - column;
                const i = y * stride + x;
                if (!inside[i]) continue;
                for (let n = 0; n < offsets.length; n++) {
                    const neighbor = i + offsets[n];
                    const value = reach[neighbor] - 0.9 * (n < 2 ? 1 : Math.SQRT2);
                    if (inside[neighbor] && value > reach[i]) {
                        reach[i] = value;
                        radii[i] = radii[neighbor];
                    }
                }
            }
        }
    }

    for (let pass = 0; pass < 3; pass++) {
        const smoothed = radii.slice();
        for (let y = 1; y <= height; y++) {
            for (let x = 1; x <= width; x++) {
                const i = y * stride + x;
                if (!inside[i]) continue;
                let sum = radii[i] * 4;
                let weight = 4;
                for (const offset of [-1, 1, -stride, stride]) {
                    if (!inside[i + offset]) continue;
                    sum += radii[i + offset];
                    weight++;
                }
                smoothed[i] = sum / weight;
            }
        }
        radii.set(smoothed);
    }

    const result = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y + 1) * stride + x + 1;
            const p = (y * width + x) * 4;
            result[p + 1] = alpha[y * width + x];
            result[p + 2] = 128;
            result[p + 3] = 128;
            if (!inside[i]) continue;
            const depth = Math.min(1, squared[i] / Math.max(squared[i], radii[i]));
            const dx = squared[i + 1 - stride] + 2 * squared[i + 1] + squared[i + 1 + stride] - squared[i - 1 - stride] - 2 * squared[i - 1] - squared[i - 1 + stride];
            const dy = squared[i + stride - 1] + 2 * squared[i + stride] + squared[i + stride + 1] - squared[i - stride - 1] - 2 * squared[i - stride] - squared[i - stride + 1];
            const magnitude = Math.hypot(dx, dy);
            // A rounded elliptical shoulder blends into a shallow central groove.
            const slope = (1.4 * (1 - depth)) / Math.sqrt(Math.max(0.12, depth * (2 - depth))) - 0.08 * smoothDerivative(depth, 0.6, 1);
            const nx = magnitude > 0 ? (-dx * slope) / magnitude : 0;
            const ny = magnitude > 0 ? (dy * slope) / magnitude : 0;
            const normalLength = Math.hypot(nx, ny, 1);
            result[p] = depth * 255;
            result[p + 2] = 127.5 + (127.5 * nx) / normalLength;
            result[p + 3] = 127.5 + (127.5 * ny) / normalLength;
        }
    }
    return result;
}
