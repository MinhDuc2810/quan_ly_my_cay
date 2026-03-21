import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
         protocol: "https",
         hostname: "seoul-spicy-production.up.railway.app",
      }
    ],
  },
};

export default nextConfig;
