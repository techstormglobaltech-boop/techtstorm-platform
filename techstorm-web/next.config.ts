import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Automatically set AUTH_URL on Vercel if not present
    AUTH_URL: process.env.AUTH_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'localhost:3000'}`,
  },
  reactCompiler: true,
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