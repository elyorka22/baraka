import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Отключаем статическую генерацию для страниц, которые требуют аутентификации
  output: undefined, // Используем стандартный режим (не static export)
  
  // Оптимизация изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Оптимизация компиляции
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Экспериментальные функции для производительности
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
};

export default nextConfig;
