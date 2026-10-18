import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@next/next/no-img-element": "off",
            "@typescript-eslint/no-unused-expressions": "warn",
            "react-hooks/exhaustive-deps": "off",
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/static-components": "off",
            "react-hooks/refs": "off",
        },
    },
    ...[
        ["shared", ["app", "views", "widgets", "features", "entities"]],
        ["entities", ["app", "views", "widgets", "features"]],
        ["features", ["app", "views", "widgets"]],
        ["widgets", ["app", "views"]],
        ["views", ["app", "features", "entities"]],
    ].map(([layer, restrictedLayers]) => ({
        files: [`src/${layer}/**/*.{ts,tsx}`],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: restrictedLayers.map((name) => `@/${name}/**`),
                            message: "app → views → widgets → features → entities → shared 방향을 지켜주세요.",
                        },
                    ],
                },
            ],
        },
    })),
    {
        ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
    },
];

export default eslintConfig;
