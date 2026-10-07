import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    // CSS disisipkan ke HTML supaya tidak ada request CSS yang memblokir render.
    inlineCss: true,
  },
};

export default nextConfig;
