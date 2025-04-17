/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Nonaktifkan app directory
  experimental: {
    appDir: false,
  },
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
};

export default nextConfig;
