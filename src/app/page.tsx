'use client';

import AdGenerator from '@/components/AdGenerator'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import I18nProvider from '@/components/I18nProvider'
import FeedbackForm from '@/components/FeedbackForm'
import { useTranslation } from 'react-i18next'
import usePageTracking from '@/components/usePageTracking'

function Home() {
  const { t } = useTranslation();
  
  // 添加页面浏览跟踪
  usePageTracking({ 
    pageTitle: t('批量广告图片生成器'),
    pagePath: '/' 
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 relative">
        <LanguageSwitcher />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('批量广告图片生成器')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('上传您的产品图片，添加自定义文字和按钮样式，一键批量生成适合各大平台的专业广告和A/B测试图片')}
          </p>
        </div>
        <AdGenerator />
        
        {/* 添加反馈表单组件 */}
        <FeedbackForm />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <I18nProvider>
      <Home />
    </I18nProvider>
  );
}
