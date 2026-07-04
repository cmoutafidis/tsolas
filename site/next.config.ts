import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // fully static site — deployable to Vercel or any static host
  trailingSlash: true, // emit /article/x/index.html; stable relative asset paths
  images: { unoptimized: true }, // no image optimization server in a static export
};

export default nextConfig;
