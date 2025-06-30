'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const DynamicTitle: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  useEffect(() => {
    // 更新页面标题和描述
    const updateMetadata = () => {
      // 设置页面标题
      document.title = t('批量广告图片生成器');
      
      // 更新页面描述
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', t('上传您的产品图片，添加自定义文字和按钮样式，一键批量生成适合各大平台的专业广告和A/B测试图片'));
      }
    };
    
    // 初始化时更新一次
    updateMetadata();
    
    // 监听语言变化
    i18n.on('languageChanged', updateMetadata);
    
    // 组件卸载时移除事件监听器
    return () => {
      i18n.off('languageChanged', updateMetadata);
    };
  }, [t, i18n]);
  
  // 这个组件不渲染任何内容，只负责更新标题
  return null;
};

export default DynamicTitle; 