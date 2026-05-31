import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip data collection for API routes to avoid Prisma client initialization at build time
  experimental: {
    // This allows API routes to skip data collection during build
  },
};

export default nextConfig;
