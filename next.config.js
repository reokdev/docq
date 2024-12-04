/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ["i.imgur.com"],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
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