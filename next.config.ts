import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // API requests now go through /app/api/proxy/route.ts
  // No need for rewrites since we handle it server-side
};

export default nextConfig;
