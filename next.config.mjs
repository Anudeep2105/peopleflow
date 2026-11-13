/** @type {import('next').NextConfig} */
const nextConfig = { poweredByHeader: false, distDir: process.env.NEXT_BUILD_DIR || '.next', experimental: { serverActions: { bodySizeLimit: '2mb' } } };
export default nextConfig;
