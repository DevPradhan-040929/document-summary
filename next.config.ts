import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // pdfjs-dist ships a Node canvas reference we don't use in the browser build
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
