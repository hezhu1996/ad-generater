'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 服务条款 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              {t('服务条款')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t('用户协议')}
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t('隐私政策')}
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t('Cookie政策')}
                </a>
              </li>
            </ul>
          </div>

          {/* 使用须知 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              {t('使用须知')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#content-policy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t('内容政策')}
                </a>
              </li>
              <li>
                <a href="#advertising-guidelines" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t('广告准则')}
                </a>
              </li>
              <li>
                <a href="#intellectual-property" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t('知识产权')}
                </a>
              </li>
            </ul>
          </div>

          {/* 联系我们 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              {t('联系我们')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#support" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t('技术支持')}
                </a>
              </li>
              <li>
                <a href="#feedback" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t('意见反馈')}
                </a>
              </li>
              <li>
                <a href="#report" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t('举报滥用')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 重要声明 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">{t('重要声明')}</h4>
            <div className="text-xs text-blue-700 space-y-2">
              <p>
                • {t('本服务仅用于生成广告创意素材，用户需确保上传内容符合相关法律法规')}
              </p>
              <p>
                • {t('用户对其上传的内容及生成的广告素材承担完全责任')}
              </p>
              <p>
                • {t('禁止上传涉及版权、商标侵权或违法违规的内容')}
              </p>
              <p>
                • {t('我们保留审核、拒绝或删除不当内容的权利')}
              </p>
              <p>
                • {t('生成的广告素材仅供参考，实际投放需遵守各平台的广告政策')}
              </p>
            </div>
          </div>

          {/* 版权信息 */}
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} RapidAd Generator. {t('保留所有权利')}。
            </div>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <span className="text-xs text-gray-500">
                {t('服务由 AI 技术驱动')}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                {t('遵循数据保护法规')}
              </span>
            </div>
          </div>
        </div>

        {/* 用户同意条款 */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600 leading-relaxed">
            {t('通过使用本服务，您同意我们的')}{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">{t('用户协议')}</a>
            {' '}{t('和')}{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">{t('隐私政策')}</a>
            {t('。我们使用 Cookie 来改善用户体验。本服务提供的AI广告生成功能仅用于合法商业用途，用户需确保遵守目标投放平台的广告政策和当地法律法规。对于因使用本服务产生的任何法律后果，用户应承担相应责任。')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
