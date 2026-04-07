/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  swcMinify: false,
  trailingSlash: true,
  // GitHub Pages 配置
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ai-avatar-market' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/ai-avatar-market' : '',
}

module.exports = nextConfig
