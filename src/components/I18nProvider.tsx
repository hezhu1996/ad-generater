'use client';

import React, { useEffect, useState } from 'react';
import '../i18n/i18n'; // 在客户端组件中导入i18n配置

interface I18nProviderProps {
  children: React.ReactNode;
}

const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  // 使用状态来跟踪是否已经在客户端
  const [isClient, setIsClient] = useState(false);

  // 确保i18n只在客户端初始化
  useEffect(() => {
    // 标记现在是在客户端
    setIsClient(true);
  }, []);

  // 只在客户端渲染子组件(同构渲染时跳过客户端特定内容)
  // 这将避免服务器和客户端之间的不匹配
  if (!isClient) {
    // 服务器渲染或首次客户端渲染时，返回一个占位符
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // 现在是客户端渲染，安全返回children
  return <>{children}</>;
};

export default I18nProvider; 