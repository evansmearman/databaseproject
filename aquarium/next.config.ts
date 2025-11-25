import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    unoptimized: true, // Skip image optimization entirely
  },
};

export default nextConfig;