import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/tennis", destination: "/play", permanent: false },
      { source: "/contact", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
