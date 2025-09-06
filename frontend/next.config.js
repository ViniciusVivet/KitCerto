/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar standalone output para Docker
  output: 'standalone',
  
  // Configurações de imagem
  images: {
    unoptimized: true, // Para Docker
  },
  
  // Configurações de ambiente
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
  },
  
  // Configurações experimentais
  experimental: {
    // Otimizações para Docker
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig
