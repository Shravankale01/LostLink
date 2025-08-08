import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    // This prevents ESLint errors from failing the production build
    // Use with caution and remove once your codebase is clean
    ignoreDuringBuilds: true,
  },

  // Add other Next.js config options here if needed
};

export default nextConfig;
