/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images-api.printify.com", pathname: "/**" },
      { protocol: "https", hostname: "images.printify.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.printify.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
