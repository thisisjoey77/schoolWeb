import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'http://3.37.138.131:8000/:path*',
      },
    ];
  },
};

export default nextConfig;
