import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Only use proxy in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/proxy/:path*',
          destination: 'http://3.37.138.131:8000/:path*',
        },
      ];
    }
    return [];
  },
  // Ensure environment variables are available
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
};

export default nextConfig;
