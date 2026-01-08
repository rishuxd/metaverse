import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "7002",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "spaces.rishuffled.in",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
