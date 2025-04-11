/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    XAI_API_KEY: process.env.XAI_API_KEY
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
        port: '',
        pathname: '/**', // Allow any path under this hostname
      },
      // Add other allowed hostnames here if needed
    ],
  }
};

module.exports = nextConfig; 