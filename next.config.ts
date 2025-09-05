import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "v360.diamonds",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "data1.360view.link",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "onedrive.live.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
