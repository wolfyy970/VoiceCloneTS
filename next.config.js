/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  },
};

module.exports = nextConfig;
