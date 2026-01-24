import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Automatically set AUTH_URL on Vercel if not present, but use http for localhost
    AUTH_URL: process.env.AUTH_URL || (process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'),
  },
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'guakzcdxscqwdkrtadkd.supabase.co',
      },
    ],
  },
};

export default nextConfig;