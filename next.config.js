/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 启用静态导出
  trailingSlash: true,
  images: {
    unoptimized: true // Cloudflare Pages 需要此配置
  }
}

module.exports = nextConfig