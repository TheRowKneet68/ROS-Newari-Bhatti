import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  eslint: {
    // 🚀 Ignore ESLint errors/warnings during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🚀 Ignore TS type errors during builds (optional, if needed)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
