'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import I18nProvider from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Footer from '@/components/Footer';
import usePageTracking from '@/components/usePageTracking';

function TermsPage() {
  const { t } = useTranslation();
  
  usePageTracking({ 
    pageTitle: t('用户协议'),
    pagePath: '/terms' 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <LanguageSwitcher />
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('用户协议')}
            </h1>
            <p className="text-gray-600">
              {t('最后更新日期')}: 2025年6月30日
            </p>
          </div>

          <div className="prose max-w-none space-y-6">
            {/* 协议接受 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. {t('协议接受')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('欢迎使用批量广告图片生成器（以下简称"本服务"）。通过访问或使用本服务，您同意受本用户协议的约束。如果您不同意本协议的任何条款，请不要使用本服务。')}
              </p>
            </section>

            {/* 服务描述 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. {t('服务描述')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {t('本服务是一个AI驱动的广告图片生成平台，提供以下功能：')}
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('产品图片上传和处理')}</li>
                <li>{t('自定义文字和按钮样式添加')}</li>
                <li>{t('批量生成适合多平台的广告图片')}</li>
                <li>{t('A/B测试素材生成')}</li>
                <li>{t('预览和下载功能')}</li>
              </ul>
            </section>

            {/* 用户责任 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. {t('用户责任')}
              </h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-800">3.1 {t('内容责任')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('您对上传到本服务的所有内容承担完全责任，包括但不限于：')}
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>{t('确保拥有上传图片的合法使用权')}</li>
                  <li>{t('确保内容不侵犯他人知识产权')}</li>
                  <li>{t('确保内容符合当地法律法规')}</li>
                  <li>{t('确保内容不包含有害、非法或不当信息')}</li>
                </ul>
              </div>
            </section>

            {/* 禁止行为 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. {t('禁止行为')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {t('使用本服务时，您不得进行以下行为：')}
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('上传包含版权侵权内容的图片')}</li>
                <li>{t('生成虚假、误导性或欺诈性广告')}</li>
                <li>{t('上传包含暴力、色情或仇恨内容的材料')}</li>
                <li>{t('尝试破坏或干扰服务的正常运行')}</li>
                <li>{t('使用自动化工具恶意大量请求服务')}</li>
                <li>{t('逆向工程或试图获取源代码')}</li>
              </ul>
            </section>

            {/* 知识产权 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. {t('知识产权')}
              </h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-800">5.1 {t('服务知识产权')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('本服务的所有技术、设计、代码和功能均受知识产权法保护，归服务提供方所有。')}
                </p>
                
                <h3 className="text-lg font-medium text-gray-800">5.2 {t('用户内容')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('您保留对上传内容的所有权，但授予我们处理、存储和生成广告图片所需的必要许可。')}
                </p>

                <h3 className="text-lg font-medium text-gray-800">5.3 {t('生成内容')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('基于您的素材生成的广告图片归您所有，但您需确保使用时遵守相关法律法规。')}
                </p>
              </div>
            </section>

            {/* 免责声明 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. {t('免责声明')}
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('本服务按"现状"提供，我们不对以下方面承担责任：')}
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>{t('服务的不间断或无错误运行')}</li>
                  <li>{t('生成内容的准确性或适用性')}</li>
                  <li>{t('因使用本服务造成的任何损失')}</li>
                  <li>{t('第三方平台对生成广告的审核结果')}</li>
                  <li>{t('用户因违反平台政策而产生的后果')}</li>
                </ul>
              </div>
            </section>

            {/* 服务变更和终止 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7. {t('服务变更和终止')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('我们保留随时修改、暂停或终止服务的权利。对于服务的变更，我们将尽力提前通知用户。用户也可随时停止使用本服务。')}
              </p>
            </section>

            {/* 争议解决 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8. {t('争议解决')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('因本协议产生的任何争议应首先通过友好协商解决。如协商不成，应提交有管辖权的法院处理。本协议适用中华人民共和国法律。')}
              </p>
            </section>

            {/* 联系方式 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                9. {t('联系方式')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('如果您对本协议有任何疑问，请通过以下方式联系我们：')}
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <p className="text-gray-700">
                  {t('邮箱')}: legal@adgenerator.com<br />
                  {t('在线反馈')}: {t('通过网站反馈表单提交')}
                </p>
              </div>
            </section>
          </div>

          {/* 返回按钮 */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              ← {t('返回首页')}
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <I18nProvider>
      <TermsPage />
    </I18nProvider>
  );
}
