/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      net: false,
      tls: false,
      dns: false,
    };
    // Add this to handle dynamic route parameters
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['*']
    }
  },
};

module.exports = nextConfig;