import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Отключаем статическую генерацию для страниц, которые требуют аутентификации
  output: undefined, // Используем стандартный режим (не static export)
};

export default nextConfig;
