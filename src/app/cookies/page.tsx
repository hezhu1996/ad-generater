'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import I18nProvider from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Footer from '@/components/Footer';
import usePageTracking from '@/components/usePageTracking';

function CookiesPage() {
  const { t } = useTranslation();
  
  usePageTracking({ 
    pageTitle: t('Cookie政策'),
    pagePath: '/cookies' 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <LanguageSwitcher />
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('Cookie政策')}
            </h1>
            <p className="text-gray-600">
              {t('最后更新日期')}: 2025年6月30日
            </p>
          </div>

          <div className="prose max-w-none space-y-6">
            {/* 什么是Cookie */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. {t('什么是Cookie')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('Cookie是当您访问网站时存储在您设备上的小型文本文件。它们被广泛用于让网站工作或更有效地工作，以及向网站所有者提供信息。我们使用Cookie来改善您的浏览体验并提供个性化服务。')}
              </p>
            </section>

            {/* 我们使用的Cookie类型 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. {t('我们使用的Cookie类型')}
              </h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">2.1 {t('必要Cookie')}</h3>
                  <p className="text-blue-700 mb-2">
                    {t('这些Cookie对网站功能至关重要，无法禁用。')}
                  </p>
                  <ul className="list-disc pl-6 text-blue-700 space-y-1">
                    <li>{t('会话管理：维护用户会话状态')}</li>
                    <li>{t('安全功能：防止跨站请求伪造（CSRF）')}</li>
                    <li>{t('负载均衡：确保服务可用性')}</li>
                    <li>{t('语言偏好：记住用户选择的语言')}</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-800 mb-2">2.2 {t('功能Cookie')}</h3>
                  <p className="text-green-700 mb-2">
                    {t('这些Cookie使网站能够提供增强的功能和个性化。')}
                  </p>
                  <ul className="list-disc pl-6 text-green-700 space-y-1">
                    <li>{t('用户偏好设置：主题、字体大小等')}</li>
                    <li>{t('表单数据：临时保存用户输入')}</li>
                    <li>{t('文件上传状态：跟踪上传进度')}</li>
                    <li>{t('界面状态：记住折叠/展开状态')}</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">2.3 {t('分析Cookie')}</h3>
                  <p className="text-yellow-700 mb-2">
                    {t('这些Cookie帮助我们了解访问者如何与网站互动。')}
                  </p>
                  <ul className="list-disc pl-6 text-yellow-700 space-y-1">
                    <li>{t('页面浏览统计：了解受欢迎的功能')}</li>
                    <li>{t('用户行为分析：优化用户体验')}</li>
                    <li>{t('性能监控：识别和修复问题')}</li>
                    <li>{t('A/B测试：测试不同的界面设计')}</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-purple-800 mb-2">2.4 {t('营销Cookie')}</h3>
                  <p className="text-purple-700 mb-2">
                    {t('这些Cookie用于跟踪访问者并显示相关广告。')}
                  </p>
                  <ul className="list-disc pl-6 text-purple-700 space-y-1">
                    <li>{t('广告跟踪：衡量广告效果')}</li>
                    <li>{t('重定向：向曾经访问过的用户显示广告')}</li>
                    <li>{t('社交媒体集成：分享功能')}</li>
                    <li>{t('个性化内容：根据兴趣显示内容')}</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 具体使用的Cookie */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. {t('具体使用的Cookie')}
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Cookie名称')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('类型')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('用途')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('有效期')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        session_id
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t('必要')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {t('维护用户会话')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t('会话结束')}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        lang_preference
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t('功能')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {t('记住语言选择')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        30 {t('天')}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        user_settings
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t('功能')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {t('保存用户偏好')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        90 {t('天')}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        _ga
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t('分析')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Google Analytics {t('跟踪')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        2 {t('年')}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        _gid
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t('分析')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Google Analytics {t('会话跟踪')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        24 {t('小时')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 第三方Cookie */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. {t('第三方Cookie')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('除了我们自己的Cookie，我们还可能使用各种第三方Cookie来报告网站使用统计信息和提供广告等。')}
              </p>
              
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Google Analytics</h3>
                  <p className="text-gray-700 text-sm">
                    {t('用于分析网站流量和用户行为，帮助我们改进服务质量。')}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">CDN 服务</h3>
                  <p className="text-gray-700 text-sm">
                    {t('用于加速内容传输和提高网站性能。')}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{t('社交媒体插件')}</h3>
                  <p className="text-gray-700 text-sm">
                    {t('如果您选择分享内容到社交媒体，相关平台可能会设置Cookie。')}
                  </p>
                </div>
              </div>
            </section>

            {/* 管理Cookie */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. {t('如何管理Cookie')}
              </h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">5.1 {t('浏览器设置')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('大多数浏览器允许您控制Cookie。您可以：')}
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>{t('查看已存储的Cookie')}</li>
                  <li>{t('删除特定或所有Cookie')}</li>
                  <li>{t('阻止第三方Cookie')}</li>
                  <li>{t('在关闭浏览器时删除Cookie')}</li>
                  <li>{t('完全禁用Cookie（可能影响网站功能）')}</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-800">5.2 {t('退出分析跟踪')}</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700">
                    {t('您可以通过以下方式退出Google Analytics跟踪：')}<br />
                    • {t('安装Google Analytics退出浏览器插件')}<br />
                    • {t('在浏览器中禁用JavaScript')}<br />
                    • {t('使用隐私浏览模式')}
                  </p>
                </div>

                <h3 className="text-lg font-medium text-gray-800">5.3 {t('移动设备')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('在移动设备上，您可以：')}
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>{t('在设备设置中限制广告跟踪')}</li>
                  <li>{t('重置广告标识符')}</li>
                  <li>{t('使用隐私浏览模式')}</li>
                </ul>
              </div>
            </section>

            {/* Cookie同意 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. {t('Cookie同意')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('当您首次访问我们的网站时，您会看到一个Cookie横幅，告知我们使用Cookie。通过继续使用网站或点击"接受"，您同意我们按照本政策使用Cookie。')}
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">{t('您的选择')}</h3>
                <ul className="list-disc pl-6 text-green-700 space-y-1">
                  <li>{t('接受所有Cookie：获得完整的网站体验')}</li>
                  <li>{t('只接受必要Cookie：基本功能可用，但体验可能受限')}</li>
                  <li>{t('自定义设置：选择您想要的Cookie类型')}</li>
                </ul>
              </div>
            </section>

            {/* 数据保护 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7. {t('数据保护和安全')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('我们采取适当的技术和组织措施来保护通过Cookie收集的信息：')}
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>{t('加密传输：所有Cookie数据通过HTTPS传输')}</li>
                <li>{t('访问控制：严格限制员工对Cookie数据的访问')}</li>
                <li>{t('定期审核：定期检查Cookie使用情况')}</li>
                <li>{t('数据最小化：只收集必要的信息')}</li>
                <li>{t('安全存储：使用安全的服务器和数据库')}</li>
              </ul>
            </section>

            {/* 更新和联系 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8. {t('政策更新和联系方式')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('我们可能会定期更新本Cookie政策以反映我们实践的变化或适用法律的变化。我们建议您定期查看本政策。')}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">{t('联系我们')}</h3>
                <p className="text-gray-700">
                  {t('如果您对我们的Cookie使用有任何疑问，请联系：')}<br />
                  {t('邮箱')}: cookies@adgenerator.com<br />
                  {t('隐私政策')}: <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">{t('查看隐私政策')}</a>
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
      <CookiesPage />
    </I18nProvider>
  );
}
