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
        // 권한을 확인하는 게시글 이미지 API가 최적화 캐시에 저장되지 않게 한다.
        localPatterns: [{ pathname: "/images/**", search: "" }],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
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
