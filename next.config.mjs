/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  // Vercel specific: allow dynamic routes in static export
  trailingSlash: true,
};

export default nextConfig;
