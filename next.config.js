/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  swcMinify: false,
  trailingSlash: true,
  assetPrefix: '.',
  basePath: '',
}

module.exports = nextConfig
