// next.config.ts
import type { NextConfig } from "next";

/**
 * Allowlist for dev-mode origins that are permitted to request _next/* dev assets.
 * You can add static hosts here OR set the env var ALLOWED_DEV_ORIGINS to a
 * comma-separated list (e.g. "localhost,127.0.0.1,192.168.1.69").
 */
const allowedFromEnv = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

// treat as production when NODE_ENV === "production"
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    // Enable Next's image optimization in production, but keep unoptimized in dev
    // for faster local iteration or when using non-optimized setups.
    unoptimized: !isProd,

    // allow these remote hosts when using next/image or when OG metadata references remote images
    domains: [
      "nweybjowqtrqpdxqfwkg.supabase.co", // Supabase storage (your logo & menu images)
      "newaribhattiandkathmandumomoghar.com", // your domain (if you host assets in /public)
    ],

    // remotePatterns gives you more fine-grained control (optional but helpful)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nweybjowqtrqpdxqfwkg.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "newaribhattiandkathmandumomoghar.com",
        pathname: "/**",
      },
    ],
  },

  eslint: {
    // Do not ignore ESLint errors in production builds
    ignoreDuringBuilds: !isProd,
  },
  typescript: {
    // Do not ignore TypeScript build errors in production
    ignoreBuildErrors: !isProd,
  },

  // Allow other local/dev hosts to request _next/* dev assets
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.1.69",
    ...allowedFromEnv,
  ],
};

export default nextConfig;
