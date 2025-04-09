/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    XAI_API_KEY: process.env.XAI_API_KEY
  }
};

module.exports = nextConfig; 