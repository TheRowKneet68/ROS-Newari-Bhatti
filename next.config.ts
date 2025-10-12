import type { NextConfig } from "next";

/**
 * Allowlist for dev-mode origins that are permitted to request _next/* dev assets.
 * You can add static hosts here OR set the env var ALLOWED_DEV_ORIGINS to a
 * comma-separated list (e.g. "localhost,127.0.0.1,192.168.1.69").
 */
const allowedFromEnv = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  : [];

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
