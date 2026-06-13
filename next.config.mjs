/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  transpilePackages: ['@monaco-editor/react'],
};

export default nextConfig;
