// filename: frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ SSR server mode (next start) ажиллах ёстой
  // export mode байж БОЛОХГҮЙ
  output: "standalone",

  // if you use next/image with external sources, keep this.
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "nginx" },
      { protocol: "http", hostname: "backend" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
