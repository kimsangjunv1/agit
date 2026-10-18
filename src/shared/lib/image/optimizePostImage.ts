import sharp from "sharp";

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 82;

export type OptimizedPostImage = {
    buffer: Buffer;
    contentType: string;
    extension: string;
};

const isSvgFile = (file: File) => file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");

export const optimizePostImage = async (file: File): Promise<OptimizedPostImage> => {
    if (isSvgFile(file)) {
        throw new Error("SVG 파일은 업로드할 수 없습니다.");
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(inputBuffer, { animated: true }).metadata();
    const isAnimatedGif = metadata.format === "gif" && (metadata.pages ?? 1) > 1;

    let pipeline = sharp(inputBuffer, { animated: isAnimatedGif });

    if (metadata.width && metadata.width > MAX_WIDTH) {
        pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    const buffer = await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer();

    return {
        buffer,
        contentType: "image/webp",
        extension: "webp",
    };
};
