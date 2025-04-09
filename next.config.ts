import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    XAI_API_KEY: process.env.XAI_API_KEY
  }
};

export default nextConfig;
