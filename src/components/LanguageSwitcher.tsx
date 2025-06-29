'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // 保存语言选择到localStorage
    localStorage.setItem('i18nextLng', lng);
  };

  // 只在客户端渲染此组件，避免服务器/客户端不一致
  if (!mounted) return null;

  return (
    <div className="absolute right-5 top-5 z-50">
      <div className="bg-white rounded-lg shadow-md p-2">
        <div className="flex items-center space-x-2 text-sm">
          <span className="font-medium text-gray-700">{t('Language')}: </span>
          <div className="flex space-x-1">
            <button
              onClick={() => changeLanguage('zh')}
              className={`px-2 py-1 rounded ${
                i18n.language === 'zh' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              {t('Chinese')}
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2 py-1 rounded ${
                i18n.language === 'en' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              {t('English')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher; 