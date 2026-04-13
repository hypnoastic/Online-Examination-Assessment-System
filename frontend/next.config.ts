import path from "node:path";
import type { NextConfig } from "next";

const backendSourceDirectory = path.resolve(__dirname, "../backend/src");

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  webpack(config) {
    config.resolve.alias["@oeas/backend"] = backendSourceDirectory;

    return config;
  },
};

export default nextConfig;
