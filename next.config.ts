import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    // Ignores all ESLint errors/warnings during build
    ignoreDuringBuilds: true,
  },

  // Other config options can go here
};

export default nextConfig;
