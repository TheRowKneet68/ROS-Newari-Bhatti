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

const nextConfig: NextConfig = {
  images: {
    // keep unoptimized true for dev or if you don't want Next's image optimization
    // (you can set to false later if you want Next to optimize images)
    unoptimized: true,

    // allow these remote hosts when using next/image or when OG metadata references remote images
    domains: [
      "nweybjowqtrqpdxqfwkg.supabase.co", // Supabase storage (your current logo)
      "newaribhattiandkathmandumomoghar.com", // your own domain (if you host logo in /public)
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
    // 🚀 Ignore ESLint errors/warnings during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🚀 Ignore TS type errors during builds (optional, if needed)
    ignoreBuildErrors: true,
  },

  // Add allowedDevOrigins so other devices on your LAN (or different hosts) can
  // request _next/* dev assets without that cross-origin warning.
  // Keep this list minimal and ONLY for development.
  allowedDevOrigins: [
    // common local entries:
    "localhost",
    "127.0.0.1",
    // add your dev machine / phone IP that triggered the warning (example):
    "192.168.1.69",
    // plus any from the ALLOWED_DEV_ORIGINS env var
    ...allowedFromEnv,
  ],
};

export default nextConfig;
