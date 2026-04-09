/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  // 修复静态导出的资源路径问题
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  // 保持false避免路径问题
  trailingSlash: false,
  // 禁用严格模式以避免双渲染问题
  reactStrictMode: false,
}

module.exports = nextConfig
