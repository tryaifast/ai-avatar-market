/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel部署不需要output:'export'，Vercel原生支持API Routes和动态路由
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  reactStrictMode: false,
}
