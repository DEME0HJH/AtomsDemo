/** @type {import('next').NextConfig} */
const nextConfig = {
  // 使用 server 模式以支持 API Routes
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
