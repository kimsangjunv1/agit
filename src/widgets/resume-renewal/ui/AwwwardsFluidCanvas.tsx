"use client";

import { useEffect, useRef } from "react";

const REVEAL_DURATION_SECONDS = 1.8;
const MAX_DEVICE_PIXEL_RATIO = 1.5;
const DEFAULT_INITIAL_COLOR = "#ffffff";
const DEFAULT_COLORS = ["#f8b37a", "#fa784d", "#ffd65c"] as const;
const HEX_COLOR_PATTERN = /^#?([\da-f]{3}|[\da-f]{6})$/i;

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_reveal;
uniform vec3 u_initialColor;
uniform vec3 u_colorOne;
uniform vec3 u_colorTwo;
uniform vec3 u_colorThree;

float random(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    vec2 curve = local * local * (3.0 - 2.0 * local);

    float bottomLeft = random(cell);
    float bottomRight = random(cell + vec2(1.0, 0.0));
    float topLeft = random(cell + vec2(0.0, 1.0));
    float topRight = random(cell + vec2(1.0, 1.0));

    return mix(
        mix(bottomLeft, bottomRight, curve.x),
        mix(topLeft, topRight, curve.x),
        curve.y
    );
}

float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.8, -0.6, 0.6, 0.8);

    for (int index = 0; index < 5; index++) {
        value += amplitude * noise(point);
        point = rotation * point * 2.03 + vec2(7.2, 3.8);
        amplitude *= 0.5;
    }

    return value;
}

void main() {
    vec2 point = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float slowTime = u_time * 0.07;

    vec2 flow = vec2(
        fbm(point * 1.25 + vec2(slowTime, 0.7)),
        fbm(point * 1.25 + vec2(4.1, -slowTime))
    );
    vec2 warpedPoint = point + (flow - 0.5) * 0.34;

    float broadColor = fbm(warpedPoint * 1.45 + vec2(-slowTime, slowTime * 0.7));
    float detailColor = fbm(warpedPoint * 2.35 + vec2(3.2 + slowTime, -1.7));

    vec3 fluidColor = mix(u_colorOne, u_colorTwo, smoothstep(0.22, 0.78, broadColor));
    fluidColor = mix(fluidColor, u_colorThree, smoothstep(0.56, 0.86, detailColor) * 0.58);

    float progress = clamp(u_reveal, 0.0, 1.0);
    float easedProgress = progress * progress * (3.0 - 2.0 * progress);
    float aspectRatio = u_resolution.x / u_resolution.y;
    float maximumRadius = length(vec2(aspectRatio * 0.5, 0.5)) + 0.32;
    float irregularity = (fbm(point * 1.9 + vec2(slowTime * 0.6, 2.4)) - 0.5) * 0.38;
    vec2 revealPoint = vec2(
        (point.x + (flow.x - 0.5) * 0.14) * 0.82,
        (point.y + (flow.y - 0.5) * 0.14) * 1.18
    );
    float revealDistance = max(0.0, length(revealPoint) + irregularity * (1.0 - easedProgress * 0.35));
    float revealRadius = mix(-0.08, maximumRadius, easedProgress);
    float feather = mix(0.05, 0.26, easedProgress);
    float revealMask = 1.0 - smoothstep(revealRadius - feather, revealRadius + feather, revealDistance);

    vec3 finalColor = mix(u_initialColor, fluidColor, revealMask * 0.96);
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
    }

    return shader;
};

const createProgram = (gl: WebGLRenderingContext) => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vertexShader || !fragmentShader) {
        if (vertexShader) gl.deleteShader(vertexShader);
        if (fragmentShader) gl.deleteShader(fragmentShader);
        return null;
    }

    const program = gl.createProgram();
    if (!program) {
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        return null;
    }

    return program;
};

const normalizeHexColor = (color: string, fallback: string) => {
    const match = color.trim().match(HEX_COLOR_PATTERN);
    if (!match) return fallback;

    const value = match[1];
    const normalized =
        value.length === 3
            ? value
                  .split("")
                  .map((character) => character.repeat(2))
                  .join("")
            : value;

    return `#${normalized.toLowerCase()}`;
};

const hexToRgb = (color: string): [number, number, number] => [
    Number.parseInt(color.slice(1, 3), 16) / 255,
    Number.parseInt(color.slice(3, 5), 16) / 255,
    Number.parseInt(color.slice(5, 7), 16) / 255,
];

type AwwwardsFluidCanvasProps = {
    className?: string;
    initialColor?: string;
    colors?: readonly [string, string, string];
};

const AwwwardsFluidCanvas = ({ className = "", initialColor = DEFAULT_INITIAL_COLOR, colors = DEFAULT_COLORS }: AwwwardsFluidCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const normalizedInitialColor = normalizeHexColor(initialColor, DEFAULT_INITIAL_COLOR);
    const colorOne = normalizeHexColor(colors[0], DEFAULT_COLORS[0]);
    const colorTwo = normalizeHexColor(colors[1], DEFAULT_COLORS[1]);
    const colorThree = normalizeHexColor(colors[2], DEFAULT_COLORS[2]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl", {
            alpha: false,
            antialias: false,
            powerPreference: "high-performance",
        });
        if (!gl) return;

        const program = createProgram(gl);
        if (!program) return;

        const positionBuffer = gl.createBuffer();
        if (!positionBuffer) {
            gl.deleteProgram(program);
            return;
        }

        const positionLocation = gl.getAttribLocation(program, "a_position");
        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        const timeLocation = gl.getUniformLocation(program, "u_time");
        const revealLocation = gl.getUniformLocation(program, "u_reveal");
        const initialColorLocation = gl.getUniformLocation(program, "u_initialColor");
        const colorOneLocation = gl.getUniformLocation(program, "u_colorOne");
        const colorTwoLocation = gl.getUniformLocation(program, "u_colorTwo");
        const colorThreeLocation = gl.getUniformLocation(program, "u_colorThree");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const initialColorRgb = hexToRgb(normalizedInitialColor);
        const colorOneRgb = hexToRgb(colorOne);
        const colorTwoRgb = hexToRgb(colorTwo);
        const colorThreeRgb = hexToRgb(colorThree);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.useProgram(program);
        gl.uniform3fv(initialColorLocation, initialColorRgb);
        gl.uniform3fv(colorOneLocation, colorOneRgb);
        gl.uniform3fv(colorTwoLocation, colorTwoRgb);
        gl.uniform3fv(colorThreeLocation, colorThreeRgb);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        let animationFrameId: number | null = null;
        let revealStartedAt: number | null = null;
        let isVisible = false;

        const resizeCanvas = () => {
            const { width, height } = canvas.getBoundingClientRect();
            const pixelRatio = Math.min(window.devicePixelRatio, MAX_DEVICE_PIXEL_RATIO);
            const nextWidth = Math.max(1, Math.round(width * pixelRatio));
            const nextHeight = Math.max(1, Math.round(height * pixelRatio));

            if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
                canvas.width = nextWidth;
                canvas.height = nextHeight;
                gl.viewport(0, 0, nextWidth, nextHeight);
            }
        };

        const render = (now: number) => {
            animationFrameId = null;
            if (!isVisible) return;

            resizeCanvas();
            revealStartedAt ??= now;

            const elapsedSeconds = (now - revealStartedAt) / 1000;
            const revealProgress = reducedMotion ? 1 : Math.min(elapsedSeconds / REVEAL_DURATION_SECONDS, 1);
            const motionTime = reducedMotion ? 0 : elapsedSeconds;

            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.uniform1f(timeLocation, motionTime);
            gl.uniform1f(revealLocation, revealProgress);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            if (!reducedMotion) animationFrameId = window.requestAnimationFrame(render);
        };

        const startRendering = () => {
            if (animationFrameId === null) animationFrameId = window.requestAnimationFrame(render);
        };

        const stopRendering = () => {
            if (animationFrameId !== null) window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        };

        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                isVisible = entry.isIntersecting;
                if (isVisible) startRendering();
                else stopRendering();
            },
            { threshold: 0.15 },
        );
        const resizeObserver = new ResizeObserver(() => {
            if (isVisible) startRendering();
        });
        const handleContextLost = (event: Event) => {
            event.preventDefault();
            stopRendering();
        };

        intersectionObserver.observe(canvas);
        resizeObserver.observe(canvas);
        canvas.addEventListener("webglcontextlost", handleContextLost);

        return () => {
            stopRendering();
            intersectionObserver.disconnect();
            resizeObserver.disconnect();
            canvas.removeEventListener("webglcontextlost", handleContextLost);
            gl.deleteBuffer(positionBuffer);
            gl.deleteProgram(program);
        };
    }, [colorOne, colorThree, colorTwo, normalizedInitialColor]);

    return (
        <canvas
            ref={canvasRef}
            className={`block h-full w-full ${className}`}
            style={{
                background: `radial-gradient(circle at center, ${colorOne} 0%, ${colorTwo} 42%, ${colorThree} 68%, ${normalizedInitialColor} 100%)`,
            }}
            aria-hidden="true"
        />
    );
};

export default AwwwardsFluidCanvas;
