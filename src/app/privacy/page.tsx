'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import I18nProvider from '@/components/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Footer from '@/components/Footer';
import usePageTracking from '@/components/usePageTracking';

function PrivacyPage() {
  const { t } = useTranslation();
  
  usePageTracking({ 
    pageTitle: t('隐私政策'),
    pagePath: '/privacy' 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <LanguageSwitcher />
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('隐私政策')}
            </h1>
            <p className="text-gray-600">
              {t('最后更新日期')}: 2025年6月30日
            </p>
          </div>

          <div className="prose max-w-none space-y-6">
            {/* 前言 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. {t('前言')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('我们非常重视用户的隐私保护。本隐私政策详细说明了我们如何收集、使用、存储和保护您的个人信息。使用我们的服务即表示您同意本隐私政策的条款。')}
              </p>
            </section>

            {/* 信息收集 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. {t('信息收集')}
              </h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">2.1 {t('自动收集的信息')}</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>{t('设备信息：设备型号、操作系统、浏览器类型和版本')}</li>
                  <li>{t('使用信息：访问时间、页面浏览记录、功能使用情况')}</li>
                  <li>{t('网络信息：IP地址、网络连接类型')}</li>
                  <li>{t('性能数据：加载时间、错误日志')}</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-800">2.2 {t('用户主动提供的信息')}</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>{t('上传的图片文件及其元数据')}</li>
                  <li>{t('输入的文字内容和广告设置')}</li>
                  <li>{t('反馈表单中的意见和建议')}</li>
                  <li>{t('联系我们时提供的信息')}</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-800">2.3 {t('Cookie和追踪技术')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('我们使用Cookie和类似技术来：')}
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>{t('记住用户偏好设置')}</li>
                  <li>{t('分析网站使用情况')}</li>
                  <li>{t('改善用户体验')}</li>
                  <li>{t('提供个性化内容')}</li>
                </ul>
              </div>
            </section>

            {/* 信息使用 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. {t('信息使用')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {t('我们收集的信息仅用于以下目的：')}
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('提供和改善广告生成服务')}</li>
                <li>{t('处理用户上传的图片和生成广告')}</li>
                <li>{t('响应用户咨询和技术支持')}</li>
                <li>{t('分析服务使用情况以优化功能')}</li>
                <li>{t('确保服务安全和防止滥用')}</li>
                <li>{t('遵守法律法规要求')}</li>
              </ul>
            </section>

            {/* 信息共享 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. {t('信息共享')}
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-medium">
                  {t('我们承诺不会出售、租赁或以其他方式商业化您的个人信息。')}
                </p>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-3">
                {t('在以下有限情况下，我们可能会共享您的信息：')}
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('获得您的明确同意')}</li>
                <li>{t('遵守法律法规或法院命令')}</li>
                <li>{t('保护我们或他人的合法权益')}</li>
                <li>{t('与可信的服务提供商（仅限于提供服务所需）')}</li>
                <li>{t('企业合并、收购或资产转让的情况下')}</li>
              </ul>
            </section>

            {/* 数据存储与安全 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. {t('数据存储与安全')}
              </h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">5.1 {t('数据存储')}</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>{t('用户上传的图片在处理完成后24小时内自动删除')}</li>
                  <li>{t('生成的广告图片临时存储7天后自动清理')}</li>
                  <li>{t('使用日志保留30天用于故障排查')}</li>
                  <li>{t('统计数据经匿名化处理后可能长期保存')}</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-800">5.2 {t('安全措施')}</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>{t('使用HTTPS加密传输所有数据')}</li>
                  <li>{t('采用先进的数据加密存储技术')}</li>
                  <li>{t('定期进行安全审计和漏洞扫描')}</li>
                  <li>{t('严格限制员工对用户数据的访问权限')}</li>
                  <li>{t('建立完善的数据备份和恢复机制')}</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-800">5.3 {t('数据位置')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('您的数据主要存储在符合数据保护法规的安全数据中心。我们确保所有数据处理活动符合适用的数据保护法律。')}
                </p>
              </div>
            </section>

            {/* 用户权利 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. {t('用户权利')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {t('根据适用的数据保护法律，您享有以下权利：')}
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('知情权：了解我们如何处理您的个人信息')}</li>
                <li>{t('访问权：请求获取我们持有的您的个人信息副本')}</li>
                <li>{t('更正权：要求更正不准确或不完整的个人信息')}</li>
                <li>{t('删除权：要求删除您的个人信息（在特定情况下）')}</li>
                <li>{t('限制处理权：要求限制对您个人信息的处理')}</li>
                <li>{t('数据携带权：要求以结构化格式获取您的数据')}</li>
                <li>{t('反对权：反对我们处理您的个人信息')}</li>
              </ul>
              
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-gray-700">
                  {t('如需行使上述权利，请通过以下方式联系我们：')}<br />
                  {t('邮箱')}: privacy@adgenerator.com
                </p>
              </div>
            </section>

            {/* 儿童隐私保护 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7. {t('儿童隐私保护')}
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {t('我们的服务不面向13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。如果我们发现收集了此类信息，将立即删除。如果您发现儿童向我们提供了个人信息，请立即联系我们。')}
                </p>
              </div>
            </section>

            {/* 国际数据传输 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8. {t('国际数据传输')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('您的信息可能会被传输到您所在国家/地区以外的地方进行处理。我们采取适当的保护措施确保您的个人信息在传输过程中得到充分保护，包括签署标准合同条款或确认接收方具有充分的数据保护水平。')}
              </p>
            </section>

            {/* 第三方服务 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                9. {t('第三方服务')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {t('我们的服务可能包含第三方服务的链接或集成，包括：')}
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('云存储服务提供商')}</li>
                <li>{t('AI模型服务提供商')}</li>
                <li>{t('分析工具提供商')}</li>
                <li>{t('支付处理服务商')}</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                {t('这些第三方服务有自己的隐私政策，我们建议您仔细阅读。我们不对第三方隐私政策或实践负责。')}
              </p>
            </section>

            {/* 政策更新 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                10. {t('政策更新')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('我们可能会不时更新本隐私政策。重大变更将在我们的网站上显著位置通知您，或通过其他适当方式通知您。建议您定期查看本政策以了解我们如何保护您的信息。')}
              </p>
            </section>

            {/* 联系方式 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                11. {t('联系方式')}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                {t('如果您对本隐私政策有任何疑问、意见或投诉，请通过以下方式联系我们：')}
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-gray-700">
                  <p><strong>{t('数据保护官邮箱')}:</strong> privacy@adgenerator.com</p>
                  <p><strong>{t('客服邮箱')}:</strong> support@adgenerator.com</p>
                  <p><strong>{t('在线反馈')}:</strong> {t('通过网站反馈表单提交')}</p>
                  <p><strong>{t('响应时间')}:</strong> {t('我们将在收到您的咨询后7个工作日内回复')}</p>
                </div>
              </div>
            </section>

            {/* 数据保护权威机构 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                12. {t('数据保护权威机构')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('如果您对我们的数据处理实践有投诉，您有权向相关数据保护权威机构投诉。我们建议您首先通过上述联系方式联系我们，以便我们有机会解决您的关切。')}
              </p>
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
      <PrivacyPage />
    </I18nProvider>
  );
}
