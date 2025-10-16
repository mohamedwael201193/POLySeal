/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    // Enable Server Components
    serverComponentsExternalPackages: ['ethers']
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Handle ethers.js and other node modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false
      }
    }

    return config
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
        permanent: false,
        has: [
          {
            type: 'host',
            value: '(?!localhost).*' // Only redirect in production
          }
        ]
      }
    ]
  },

  // Images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },

  // Output configuration for deployment
  output: 'standalone',
  
  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // Build optimization
  swcMinify: true
}

module.exports = nextConfig