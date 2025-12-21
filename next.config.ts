import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Disable strict mode for development (can cause double renders)
  reactStrictMode: true,

  // Allow images from external domains if needed
  images: {
    remotePatterns: [],
  },

  // Environment variable validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
};

export default nextConfig;
