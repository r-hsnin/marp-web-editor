/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    webpackMemoryOptimizations: true,
    preloadEntriesOnStart: false,
  },
};

export default nextConfig;
