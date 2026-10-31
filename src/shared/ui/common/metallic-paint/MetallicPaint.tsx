"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { createMetalSurface, createSourceMaterial } from "./surface";

export interface MetallicPaintProps {
    /** PNG/WebP silhouette with alpha. Opaque pixels become metal. */
    imageSrc?: string;
    /** Preserve an already-shaded image's original material instead of recoloring its silhouette. */
    preserveMaterial?: boolean;
    text?: string;
    fontFamily?: string;
    fontWeight?: number | string;
    /** Base metal color. Drives the shaded palette, e.g. gold `#ff9f0d`. */
    color?: string;
    backgroundColor?: string;
    /** Animated gloss band density. Higher = tighter stripes. */
    density?: number;
    /** Softness of the gloss bands. */
    softness?: number;
    /** Chromatic shift of the gloss. */
    dispersion?: number;
    /** Edge wobble on the metal bands. */
    distortion?: number;
    /** Edge bevel strength. Higher = deeper emboss. */
    edgeBend?: number;
    /** Gloss band angle in degrees. */
    angle?: number;
    /** Gloss animation speed. */
    speed?: number;
    scale?: number;
    rotation?: number;
    /** Pointer tilt strength. */
    mouseTilt?: number;
    lightMode?: boolean;
    intro?: boolean;
    paused?: boolean;
    dpr?: number;
    /** Rendered width. A number is pixels; a string is used as CSS. */
    width?: number | string;
    /** Rendered height. A number is pixels; a string is used as CSS. */
    height?: number | string;
    className?: string;
    style?: CSSProperties;
}

type Rgba = number[];

interface Settings {
    preserveMaterial: boolean;
    tint: Rgba;
    back: Rgba;
    density: number;
    softness: number;
    dispersion: number;
    distortion: number;
    edgeBend: number;
    angle: number;
    speed: number;
    scale: number;
    rotation: number;
    mouseTilt: number;
    lightMode: boolean;
    intro: boolean;
    paused: boolean;
    dpr?: number;
}

interface MetalImage {
    surface: ImageData;
    material: ImageData;
}

interface Engine {
    setPending: (value: boolean) => void;
    setImage: (data: MetalImage | null) => void;
    wake: () => void;
    redraw: () => void;
}

const WORKING_SIZE = 1024;
const MAX_SIDE = 2048;
const MAX_PIXELS = 2560 * 1600 * 2;

const VERTEX = `#version 300 es
layout(location = 0) in vec2 a_position;
uniform vec2 u_resolution;
uniform float u_imageAspect;
uniform float u_scale;
uniform float u_rotation;
out vec2 v_imageUV;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  vec2 uv = a_position * 0.5;
  float r = u_rotation * 3.14159265358979323846 / 180.0;
  mat2 turn = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 imageBox;
  imageBox.x = min(u_resolution.x / u_imageAspect, u_resolution.y) * u_imageAspect;
  imageBox.y = imageBox.x / u_imageAspect;
  v_imageUV = uv * (u_resolution / imageBox) / u_scale;
  v_imageUV.x *= u_imageAspect;
  v_imageUV = turn * v_imageUV;
  v_imageUV.x /= u_imageAspect;
  v_imageUV += 0.5;
  v_imageUV.y = 1.0 - v_imageUV.y;
}`;

const FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D u_image;
uniform sampler2D u_material;
uniform float u_preserveMaterial;
uniform float u_time;
uniform vec4 u_colorBack;
uniform vec4 u_colorTint;
uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_angle;
uniform float u_rotation;
uniform vec2 u_tilt;
uniform float u_reveal;
uniform float u_light;
uniform float u_pixelRatio;
in vec2 v_imageUV;
out vec4 fragColor;

#define PI 3.14159265358979323846

vec2 turn(vec2 p, float angle) {
  float c = cos(angle), s = sin(angle);
  return mat2(c, s, -s, c) * p;
}

float metalHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float metalNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  vec2 blend = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(metalHash(cell), metalHash(cell + vec2(1.0, 0.0)), blend.x),
    mix(metalHash(cell + vec2(0.0, 1.0)), metalHash(cell + 1.0), blend.x), blend.y);
}

vec4 shadeMetal(vec2 uv) {
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return vec4(0.0);
  vec4 surface = textureLod(u_image, uv, 0.0);
  float coverage = surface.g;
  if (coverage < 0.001 && u_preserveMaterial < 0.5) return vec4(0.0);
  float depth = surface.r;
  vec2 xy = surface.ba * 2.0 - 1.0;
  vec3 normal = normalize(vec3(xy, sqrt(max(0.015, 1.0 - dot(xy, xy)))));
  normal = normalize(vec3(normal.xy * u_contour, normal.z));
  normal.xy = turn(normal.xy, u_rotation * PI / 180.0);
  normal = normalize(normal + vec3(u_tilt * vec2(0.16, -0.16), 0.0));

  if (u_preserveMaterial > 0.5) {
    vec4 source = textureLod(u_material, uv, 0.0);
    vec3 material = source.rgb;
    float luminance = dot(material, vec3(0.2126, 0.7152, 0.0722)) / max(source.a, 0.001);
    vec2 direction = turn(normalize(vec2(0.27, 1.0)), (u_angle - 70.0) * PI / 180.0);
    float path = dot(uv - 0.5, direction) + 0.12 * dot(normal.xy, vec2(0.6, -0.8));
    float phase = (path * (1.10 + 0.18 * u_repetition) + u_time / 4.0) * 2.0 * PI;
    float wave = sin(phase + 0.15 * sin(u_time * 0.17 + uv.x * 2.0));
    float motion = smoothstep(0.0, 0.65, abs(u_time));
    // A distinct highlight and warm reflection travel over the original gold shading.
    float sheen = 0.66 * motion * smoothstep(0.12, 0.65, luminance)
      * pow(max(wave, 0.0), mix(5.0, 2.5, u_softness));
    material = mix(material, vec3(1.0, 0.96, 0.76) * source.a, sheen);
    float reflection = motion * pow(max(-wave, 0.0), 1.5) * (1.0 - smoothstep(0.80, 1.0, luminance));
    material *= 1.0 - vec3(0.40, 0.48, 0.58) * reflection;
    float reveal = smoothstep(0.0, 0.3, u_reveal);
    reveal *= smoothstep(1.0 - u_reveal * 1.12, 1.08 - u_reveal * 1.12, 1.0 - depth);
    coverage = source.a * reveal;
    return vec4(material * reveal, coverage);
  }

  vec2 lightPlane = vec2(uv.x - 0.5, 0.5 - uv.y);
  float upperLeftLight = 1.0 - smoothstep(-0.65, 0.65, dot(uv - 0.5, normalize(vec2(0.78, 1.0))));
  float upperLight = (1.0 - smoothstep(0.14, 0.82, uv.y + 0.12 * (uv.x - 0.5))) * mix(0.85, 1.0, upperLeftLight);
  vec3 key = normalize(vec3(-0.80, 0.95, 1.0) - vec3(lightPlane * 0.45, 0.0));
  float facing = max(dot(normal, key), 0.0);
  float cavity = smoothstep(0.48, 0.96, depth);
  float tone = clamp(0.24 + 0.94 * facing - 0.10 * cavity, 0.0, 1.0);
  // Base metal palette comes from color prop; dark/mid/pale steps keep the emboss look.
  vec3 base = max(u_colorTint.rgb, vec3(0.004));
  vec3 shadow = base * 0.22;
  vec3 bronze = base * 0.42;
  vec3 gold = base;
  vec3 pale = mix(base, vec3(1.0), 0.72);
  vec3 metal = mix(bronze, gold, smoothstep(0.16, 0.76, tone));
  metal = mix(metal, pale, 0.90 * smoothstep(0.78, 1.0, tone));
  metal *= 1.0 - 0.08 * cavity;

  // Restore the original rounded lip, recessed walls and edge shading.
  float lip = exp(-pow((depth - 0.18) / 0.20, 2.0));
  metal = mix(metal, pale, lip * smoothstep(0.50, 0.95, facing) * 0.70);
  float outline = 1.0 - smoothstep(0.01, 0.16, depth);
  metal = mix(metal, shadow, outline * 0.42);
  vec3 reliefReflection = reflect(vec3(0.0, 0.0, -1.0), normal);
  float groundReflection = 1.0 - smoothstep(-0.30, 0.10, reliefReflection.y + 0.20 * reliefReflection.x);
  metal *= 1.0 - 0.30 * groundReflection;
  metal = pow(clamp(metal, 0.0, 1.0), vec3(0.94));
  metal *= mix(vec3(0.82, 0.76, 0.66), vec3(1.09, 1.07, 1.02), upperLeftLight);
  vec3 rimColor = metal;

  // Broad, smoothly warped reflections drift upward-left without repeating a fixed band.
  vec3 reflectionNormal = normalize(vec3(normal.xy * 0.40, normal.z + 0.90));
  vec3 reflected = reflect(vec3(0.0, 0.0, -1.0), reflectionNormal);
  float angle = (u_angle - 70.0) * PI / 180.0;
  vec2 direction = turn(normalize(vec2(0.27, 1.0)), angle);
  float density = 3.1 + u_repetition * 0.275;
  vec2 p = uv * density + direction * u_time * 0.115;
  p += reflected.xy * 0.20;
  vec2 warp = vec2(metalNoise(p * 0.63 + vec2(7.3, u_time * 0.018)),
    metalNoise(p * 0.71 + vec2(-u_time * 0.013, 19.1))) - 0.5;
  p += warp * (0.75 + 1.5 * u_distortion);
  float environment = 0.85 * metalNoise(p * 0.72)
    + 0.15 * metalNoise(turn(p, 0.72) * 1.10 + 4.7);
  // Dense dark reflection cores follow the chosen metal tint.
  float brown = exp(-pow(max(environment - 0.18, 0.0) / 0.42, 2.0));
  float darkCore = exp(-pow(max(environment - 0.12, 0.0) / 0.075, 2.0));
  float reflectionStrength = mix(1.0, 0.72, upperLight);
  metal = mix(metal, base * 0.55, 0.34 * brown * reflectionStrength);
  metal = mix(metal, base * 0.06, 0.94 * darkCore * mix(1.0, 0.94, upperLight));

  float reflectedLight = smoothstep(0.43, 0.73, environment);
  float lightCore = exp(-pow((environment - 0.62) / mix(0.12, 0.20, u_softness), 2.0));
  float gloss = clamp(0.55 * reflectedLight + 0.35 * lightCore, 0.0, 0.88);
  vec3 highlight = mix(base, vec3(1.0), 0.82) - vec3(0.0, abs(u_shiftRed) * 0.025, abs(u_shiftBlue) * 0.065);
  metal = mix(metal, highlight, gloss);
  metal += mix(base, vec3(1.0), 0.55) * upperLight * 0.08 * (1.0 - 0.35 * darkCore);
  // Keep the restored rim visible while reflections flow across the inner face.
  metal = mix(metal, rimColor, max(outline, lip));
  metal *= 1.0 - 0.035 * u_light;

  float reveal = smoothstep(0.0, 0.3, u_reveal);
  reveal *= smoothstep(1.0 - u_reveal * 1.12, 1.08 - u_reveal * 1.12, 1.0 - depth);
  coverage *= reveal;
  return vec4(clamp(metal, 0.0, 1.0) * coverage, coverage);
}

void main() {
  // Shade subpixels before averaging, so thin opposing walls do not cancel their normals.
  vec2 dx = dFdx(v_imageUV) * max(0.5, 0.28 * u_pixelRatio);
  vec2 dy = dFdy(v_imageUV) * max(0.5, 0.28 * u_pixelRatio);
  vec4 metal = 0.25 * (shadeMetal(v_imageUV - dx - dy) + shadeMetal(v_imageUV + dx - dy)
    + shadeMetal(v_imageUV - dx + dy) + shadeMetal(v_imageUV + dx + dy));
  vec2 pixelX = dFdx(v_imageUV) * u_pixelRatio;
  vec2 pixelY = dFdy(v_imageUV) * u_pixelRatio;
  vec2 shadowUV = v_imageUV - pixelX * 0.2 + pixelY * 0.35;
  vec2 sx = pixelX * 0.45, sy = pixelY * 0.45;
  float shadow = 0.4 * textureLod(u_image, shadowUV, 0.0).g;
  shadow += 0.15 * (textureLod(u_image, shadowUV + sx, 0.0).g + textureLod(u_image, shadowUV - sx, 0.0).g
    + textureLod(u_image, shadowUV + sy, 0.0).g + textureLod(u_image, shadowUV - sy, 0.0).g);
  shadow *= 0.22 * smoothstep(0.0, 0.8, u_reveal) * (1.0 - metal.a) * (1.0 - u_preserveMaterial);
  metal.rgb += u_colorTint.rgb * vec3(0.25, 0.18, 0.10) * shadow;
  metal.a += shadow;
  vec3 back = u_colorBack.rgb * u_colorBack.a;
  fragColor = vec4(metal.rgb + back * (1.0 - metal.a), metal.a + u_colorBack.a * (1.0 - metal.a));
}`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const cssSize = (value: number | string) => (typeof value === "number" ? `${value}px` : value);

const parseColor = (() => {
    let context: CanvasRenderingContext2D | null = null;
    return (value: string, fallback: Rgba): Rgba => {
        if (typeof document === "undefined") return fallback;
        context ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
        if (!context) return fallback;
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = "rgba(0, 0, 0, 0)";
        context.fillStyle = String(value);
        context.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
        return [r / 255, g / 255, b / 255, a / 255];
    };
})();

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("MetallicPaint: failed to load the image"));
        image.src = src;
    });

const isVector = async (src: string): Promise<boolean> => {
    if (/\.svg($|[?#])/i.test(src) || src.startsWith("data:image/svg+xml")) return true;
    if (!src.startsWith("blob:")) return false;
    try {
        const blob = await (await fetch(src)).blob();
        return blob.type === "image/svg+xml";
    } catch {
        return false;
    }
};

const drawImageSource = async (src: string): Promise<HTMLCanvasElement> => {
    const [image, vector] = await Promise.all([loadImage(src), isVector(src)]);
    let width = image.naturalWidth || image.width || MAX_SIDE;
    let height = image.naturalHeight || image.height || MAX_SIDE;
    const longest = Math.max(width, height);
    const fit = vector ? MAX_SIDE / longest : clamp(1024 / longest, 1, MAX_SIDE / longest);
    width = Math.max(1, Math.round(width * fit));
    height = Math.max(1, Math.round(height * fit));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
    ctx.drawImage(image, 0, 0, width, height);
    const data = ctx.getImageData(0, 0, width, height);
    let opaque = true;
    for (let i = 3; i < data.data.length; i += 4) {
        if (data.data[i] < 250) {
            opaque = false;
            break;
        }
    }
    if (opaque) {
        for (let i = 0; i < data.data.length; i += 4) {
            const light = Math.min(data.data[i], data.data[i + 1], data.data[i + 2]);
            data.data[i + 3] = Math.round(clamp((250 - light) / 30, 0, 1) * 255);
        }
        ctx.putImageData(data, 0, 0);
    }
    return canvas;
};

const drawTextSource = async (text: string, fontFamily: string, fontWeight: number | string): Promise<HTMLCanvasElement | null> => {
    const size = 320;
    const font = `${fontWeight} ${size}px ${fontFamily}`;
    try {
        await document.fonts?.load(font, text);
    } catch {
        return null;
    }
    const probe = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
    probe.font = font;
    const metrics = probe.measureText(text);
    const ascent = metrics.actualBoundingBoxAscent || size * 0.8;
    const descent = metrics.actualBoundingBoxDescent || size * 0.2;
    const left = metrics.actualBoundingBoxLeft || 0;
    const right = metrics.actualBoundingBoxRight || metrics.width;
    const pad = size * 0.12;
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(left + right + pad * 2);
    canvas.height = Math.ceil(ascent + descent + pad * 2);
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.font = font;
    ctx.fillStyle = "#000";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, pad + left, pad + ascent);
    return canvas;
};

const processShape = (source: HTMLCanvasElement): MetalImage => {
    const fit = Math.min(1, WORKING_SIZE / Math.max(source.width, source.height));
    const width = Math.max(1, Math.round(source.width * fit));
    const height = Math.max(1, Math.round(source.height * fit));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
    ctx.drawImage(source, 0, 0, width, height);
    const pixels = ctx.getImageData(0, 0, width, height).data;
    const alpha = new Uint8Array(width * height);
    for (let i = 0; i < alpha.length; i++) alpha[i] = pixels[i * 4 + 3];
    const result = ctx.createImageData(width, height);
    result.data.set(createMetalSurface(alpha, width, height));
    const material = ctx.createImageData(width, height);
    material.data.set(createSourceMaterial(pixels));
    return { surface: result, material };
};

const imageSurfaces = new Map<string, Promise<MetalImage>>();

const loadImageSurface = (src: string): Promise<MetalImage> => {
    const cached = imageSurfaces.get(src);
    if (cached) return cached;
    const pending = drawImageSource(src).then(processShape);
    imageSurfaces.set(src, pending);
    if (imageSurfaces.size > 4) {
        const oldest = imageSurfaces.keys().next().value;
        if (oldest !== undefined) imageSurfaces.delete(oldest);
    }
    void pending.catch(() => {
        if (imageSurfaces.get(src) === pending) imageSurfaces.delete(src);
    });
    return pending;
};

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    gl.deleteShader(shader);
    return null;
};

export function MetallicPaint({
    imageSrc,
    preserveMaterial = false,
    text,
    fontFamily = "system-ui, sans-serif",
    fontWeight = 800,
    color = "#ff9f0d",
    backgroundColor = "transparent",
    density = 1.8,
    softness = 0.05,
    dispersion = 0.15,
    distortion = 0.07,
    edgeBend = 1,
    angle = 70,
    speed = 1,
    scale: scaleProp,
    rotation = 0,
    mouseTilt = 0.5,
    lightMode = false,
    intro = true,
    paused = false,
    dpr,
    width,
    height,
    className = "",
    style,
}: MetallicPaintProps) {
    const sized = width != null || height != null;
    const scale = scaleProp ?? (sized ? 1 : 0.6);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Engine | null>(null);
    const settingsRef = useRef<Settings>(null as unknown as Settings);

    useEffect(() => {
        settingsRef.current = {
            preserveMaterial,
            tint: parseColor(color, [1, 1, 1, 1]),
            back: parseColor(backgroundColor, [0, 0, 0, 0]),
            density: clamp(density, 0.5, 12),
            softness: clamp(softness, 0, 1),
            dispersion: clamp(dispersion, -1, 1),
            distortion: clamp(distortion, 0, 1),
            edgeBend: clamp(edgeBend, 0, 1.5),
            angle,
            speed,
            scale: Math.max(0.05, scale),
            rotation,
            mouseTilt: clamp(mouseTilt, 0, 1.5),
            lightMode,
            intro,
            paused,
            dpr,
        };
    });

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return undefined;
        const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
        if (!gl) return undefined;
        const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
        const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
        const program = gl.createProgram();
        if (!vertex || !fragment || !program) return undefined;
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
        gl.useProgram(program);

        const uniforms: Record<string, WebGLUniformLocation | null> = {};
        const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < count; i++) {
            const info = gl.getActiveUniform(program, i);
            if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
        }

        const vao = gl.createVertexArray();
        const buffer = gl.createBuffer();
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.uniform1i(uniforms.u_image, 0);

        const materialTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, materialTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.uniform1i(uniforms.u_material, 1);
        gl.activeTexture(gl.TEXTURE0);

        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
        const state = {
            raf: 0,
            last: 0,
            time: 0,
            visible: true,
            pending: false,
            hasImage: false,
            imageAspect: 1,
            width: 0,
            height: 0,
            pixelRatio: 1,
            revealStart: -1,
            reveal: settingsRef.current.intro && !reduce ? 0 : 1,
            tiltX: 0,
            tiltY: 0,
            velocityX: 0,
            velocityY: 0,
            targetX: 0,
            targetY: 0,
            alive: true,
        };

        const resize = () => {
            const s = settingsRef.current;
            const rect = container.getBoundingClientRect();
            const base = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);
            let ratio = s.dpr ?? Math.max(base, Math.min(rect.width, rect.height) < 160 ? 3 : 2);
            const pixels = rect.width * rect.height * ratio * ratio;
            if (pixels > MAX_PIXELS) ratio *= Math.sqrt(MAX_PIXELS / pixels);
            const width = Math.max(1, Math.round(rect.width * ratio));
            const height = Math.max(1, Math.round(rect.height * ratio));
            state.pixelRatio = width / Math.max(1, rect.width);
            if (width === state.width && height === state.height) return;
            state.width = width;
            state.height = height;
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
        };

        const draw = () => {
            const s = settingsRef.current;
            if (state.pending || !state.hasImage) {
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                return;
            }
            gl.useProgram(program);
            gl.uniform2f(uniforms.u_resolution, state.width, state.height);
            gl.uniform1f(uniforms.u_time, state.time);
            gl.uniform1f(uniforms.u_preserveMaterial, s.preserveMaterial ? 1 : 0);
            gl.uniform1f(uniforms.u_imageAspect, state.imageAspect);
            gl.uniform1f(uniforms.u_scale, s.scale);
            gl.uniform1f(uniforms.u_rotation, s.rotation);
            gl.uniform4f(uniforms.u_colorBack, s.back[0], s.back[1], s.back[2], s.back[3]);
            gl.uniform4f(uniforms.u_colorTint, s.tint[0], s.tint[1], s.tint[2], s.tint[3]);
            gl.uniform1f(uniforms.u_softness, s.softness);
            gl.uniform1f(uniforms.u_repetition, s.density);
            gl.uniform1f(uniforms.u_shiftRed, s.dispersion);
            gl.uniform1f(uniforms.u_shiftBlue, s.dispersion);
            gl.uniform1f(uniforms.u_distortion, s.distortion);
            gl.uniform1f(uniforms.u_contour, s.edgeBend);
            gl.uniform1f(uniforms.u_angle, s.angle);
            gl.uniform2f(uniforms.u_tilt, state.tiltX, state.tiltY);
            gl.uniform1f(uniforms.u_reveal, state.reveal);
            gl.uniform1f(uniforms.u_light, s.lightMode ? 1 : 0);
            gl.uniform1f(uniforms.u_pixelRatio, state.pixelRatio);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.bindVertexArray(vao);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };

        const frame = (now: number) => {
            state.raf = 0;
            if (!state.alive) return;
            const s = settingsRef.current;
            const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;
            state.last = now;
            const moving = !s.paused && !reduce && s.speed !== 0;
            if (moving) state.time += dt * s.speed;

            let busy = moving;
            if (state.reveal < 1 && !state.pending) {
                if (state.revealStart < 0) state.revealStart = now;
                const progress = clamp((now - state.revealStart) / 1600, 0, 1);
                state.reveal = 1 - (1 - progress) ** 3;
                if (moving) state.time += dt * 2.4 * (1 - progress) ** 2;
                busy = true;
            }

            const stiffness = 60;
            const damping = 14;
            const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
            const h = dt / steps;
            for (let i = 0; i < steps; i++) {
                state.velocityX += (stiffness * (state.targetX * s.mouseTilt - state.tiltX) - damping * state.velocityX) * h;
                state.velocityY += (stiffness * (state.targetY * s.mouseTilt - state.tiltY) - damping * state.velocityY) * h;
                state.tiltX += state.velocityX * h;
                state.tiltY += state.velocityY * h;
            }
            if (
                Math.abs(state.targetX * s.mouseTilt - state.tiltX) > 0.0005 ||
                Math.abs(state.targetY * s.mouseTilt - state.tiltY) > 0.0005 ||
                Math.abs(state.velocityX) + Math.abs(state.velocityY) > 0.0005
            ) {
                busy = true;
            }

            draw();
            if (busy && state.visible) state.raf = requestAnimationFrame(frame);
            else state.last = 0;
        };

        const wake = () => {
            if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);
        };

        const onMove = (event: PointerEvent) => {
            const rect = container.getBoundingClientRect();
            state.targetX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1.2, 1.2);
            state.targetY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1.2, 1.2);
            wake();
        };

        const onLeave = () => {
            state.targetX = 0;
            state.targetY = 0;
            wake();
        };

        const resizeObserver = new ResizeObserver(() => {
            resize();
            draw();
        });
        resizeObserver.observe(container);

        const visibility = new IntersectionObserver((entries) => {
            state.visible = entries.some((entry) => entry.isIntersecting);
            if (state.visible) wake();
        });
        visibility.observe(container);

        const onLost = (event: Event) => {
            event.preventDefault();
            state.alive = false;
            cancelAnimationFrame(state.raf);
        };

        canvas.addEventListener("webglcontextlost", onLost);
        container.addEventListener("pointermove", onMove);
        container.addEventListener("pointerleave", onLeave);

        engineRef.current = {
            setPending: (value: boolean) => {
                state.pending = value;
                draw();
            },
            setImage: (data: MetalImage | null) => {
                state.pending = false;
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                if (data) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data.surface);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    state.imageAspect = data.surface.width / data.surface.height;
                    state.hasImage = true;
                } else {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    state.imageAspect = 1;
                    state.hasImage = false;
                }
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, materialTexture);
                if (data) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data.material);
                else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
                gl.activeTexture(gl.TEXTURE0);
                draw();
                wake();
            },
            wake,
            redraw: () => {
                resize();
                draw();
                wake();
            },
        };

        resize();
        draw();
        wake();

        return () => {
            state.alive = false;
            cancelAnimationFrame(state.raf);
            resizeObserver.disconnect();
            visibility.disconnect();
            canvas.removeEventListener("webglcontextlost", onLost);
            container.removeEventListener("pointermove", onMove);
            container.removeEventListener("pointerleave", onLeave);
            engineRef.current = null;
            gl.deleteTexture(texture);
            gl.deleteTexture(materialTexture);
            gl.deleteBuffer(buffer);
            gl.deleteVertexArray(vao);
            gl.deleteProgram(program);
        };
    }, []);

    useEffect(() => {
        let active = true;
        const source = text ? drawTextSource(text, fontFamily, fontWeight).then((canvas) => (canvas ? processShape(canvas) : null)) : imageSrc ? loadImageSurface(imageSrc) : null;
        if (!source) {
            engineRef.current?.setImage(null);
            return undefined;
        }
        engineRef.current?.setPending(true);
        source
            .then((data) => {
                if (active) engineRef.current?.setImage(data);
            })
            .catch(() => {
                if (active) engineRef.current?.setImage(null);
            });
        return () => {
            active = false;
        };
    }, [imageSrc, text, fontFamily, fontWeight]);

    useEffect(() => {
        engineRef.current?.redraw();
    });

    return (
        <div
            ref={containerRef}
            className={`relative shrink-0 ${width == null ? "w-full" : ""} ${height == null ? "h-full" : ""} ${className}`.trim()}
            style={{
                ...style,
                width: width == null ? style?.width : cssSize(width),
                height: height == null ? style?.height : cssSize(height),
            }}
        >
            <canvas
                ref={canvasRef}
                className="block h-full w-full"
            />
        </div>
    );
}
