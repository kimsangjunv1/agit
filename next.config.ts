import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
    async redirects() {
        return [
            {
                source: "/resume-renewal",
                destination: "/resume",
                permanent: true,
            },
        ];
    },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "**.supabase.co",
            },
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
        ],
    },

    compiler: {
        removeConsole: false,
    },
};

export default withBundleAnalyzer(nextConfig);
