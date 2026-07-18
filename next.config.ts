import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles image optimization automatically
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Server Actions are enabled by default in Next.js 16
  // Increase body size limit for image uploads (4MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
