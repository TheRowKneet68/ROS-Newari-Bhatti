// next.config.ts
const nextConfig: NextConfig = {
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    // 🚀 Allow production builds even if type errors exist
    ignoreBuildErrors: true,
  },
};
