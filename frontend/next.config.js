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

  // Proxy para o backend em desenvolvimento (dentro do Docker)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api:5000/api/:path*',
      },
    ];
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configurações experimentais
  experimental: {
    // Otimizações para Docker
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig
