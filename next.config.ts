import type { NextConfig } from 'next';

// Nếu host trong thư mục con (vd GitHub Pages: /rubik-cfop), đặt biến môi trường
// NEXT_PUBLIC_BASE_PATH=/rubik-cfop khi build.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: 'export', // xuất ra file tĩnh trong thư mục out/ => chạy được offline
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
