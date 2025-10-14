import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Принудительно используем порт 3000
  experimental: {
    // Дополнительные настройки если нужно
  },
  // Настройки для разработки
  ...(process.env.NODE_ENV === 'development' && {
    // Можно добавить дополнительные настройки для dev режима
  })
};

export default nextConfig;
