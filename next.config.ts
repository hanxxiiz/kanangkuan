import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lhbcozrtlfznhiousjac.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  }
};

const withPWASetup = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default withPWASetup(nextConfig);