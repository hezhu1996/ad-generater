/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // LeanCloud 依赖在服务器端可能会导致问题，设置为仅在客户端加载
    if (isServer) {
      config.externals = [...(config.externals || []), 'leancloud-storage'];
    }
    return config;
  }
};

module.exports = nextConfig; 