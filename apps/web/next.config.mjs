import dotenv from "dotenv";
dotenv.config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    // ✅ กำหนด fallback URL ให้ dev กับ prod
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
    const uploadBase = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL || "http://localhost:4000/uploads";

    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${uploadBase}/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: new URL(
          process.env.NEXT_PUBLIC_API_BASE_URL || "https://kaizeninst-api.onrender.com"
        ).hostname,
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
