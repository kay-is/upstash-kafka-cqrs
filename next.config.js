/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    appDir: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        crypto: false,
      }
    }

    return config
  },
}
