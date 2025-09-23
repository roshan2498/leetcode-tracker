import type { NextConfig } from "next";

const isStaticExport = process.env.BUILD_STATIC === 'true';

const nextConfig: NextConfig = {
  // Enable static export only for GitHub Pages deployment
  ...(isStaticExport && { output: 'export' }),
  
  // Disable image optimization for static export
  images: {
    unoptimized: isStaticExport,
  },

  // Base path for GitHub Pages (will be overridden in production)
  basePath: process.env.NODE_ENV === 'production' && isStaticExport ? '/leetcode-tracker' : '',
  
  // Ensure trailing slashes are handled correctly
  trailingSlash: isStaticExport,

  // Performance optimizations
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Compress responses
  compress: true,

  // Security headers (only for non-static builds)
  ...(!isStaticExport && {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin'
            }
          ]
        }
      ]
    }
  }),

  // Webpack configuration for better bundling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
