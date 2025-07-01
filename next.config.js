/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // LeanCloud 依赖在服务器端可能会导致问题，设置为仅在客户端加载
    if (isServer) {
      config.externals = [...(config.externals || []), 'leancloud-storage'];
    }
    return config;
  },
  // 确保环境变量可用
  env: {
    NEXT_PUBLIC_LEANCLOUD_APP_ID: process.env.NEXT_PUBLIC_LEANCLOUD_APP_ID,
    NEXT_PUBLIC_LEANCLOUD_APP_KEY: process.env.NEXT_PUBLIC_LEANCLOUD_APP_KEY,
    NEXT_PUBLIC_LEANCLOUD_SERVER_URL: process.env.NEXT_PUBLIC_LEANCLOUD_SERVER_URL,
    NEXT_PUBLIC_GOOGLE_SHEETS_URL: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL
  }
};

module.exports = nextConfig; 