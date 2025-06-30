'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 反馈类型定义
type FeedbackType = 'suggestion' | 'bug' | 'feature' | 'other';

// 反馈数据结构
interface FeedbackData {
  id: string;
  type: FeedbackType;
  text: string;
  email: string;
  timestamp: number;
  language: string;
  userAgent: string;
}

const FeedbackForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [feedbackText, setFeedbackText] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Sheets Web App URL - 替换为您部署的Apps Script URL
  const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxNt0lrSRLnvaHqISP0K2XI_OH2-Fjkg_EJ0-yUkfDdPan38Y-cIrSgfonDv25wIUtong/exec';

  // 发送反馈到Google Sheets
  const sendFeedbackToGoogleSheets = async (data: FeedbackData): Promise<boolean> => {
    try {
      // 创建URL编码的参数字符串，手动处理编码确保中文和特殊字符正确传输
      const params = new URLSearchParams();
      params.append('id', data.id);
      params.append('type', data.type);
      params.append('text', data.text); // URLSearchParams会自动进行URL编码
      params.append('email', data.email);
      params.append('timestamp', data.timestamp.toString());
      params.append('language', data.language);
      params.append('userAgent', data.userAgent);

      // 使用fetch API提交数据
      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors', // 绕过CORS限制
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', // 确保UTF-8编码
        },
        body: params.toString()
      });
      
      // 打印请求信息到控制台，便于调试
      console.log('提交的数据:', {
        url: GOOGLE_SHEETS_URL,
        parameters: Object.fromEntries(params.entries())
      });
      
      // 也保存到localStorage作为备份
      const existingFeedback: FeedbackData[] = JSON.parse(localStorage.getItem('userFeedback') || '[]');
      existingFeedback.push(data);
      localStorage.setItem('userFeedback', JSON.stringify(existingFeedback));

      return true;
    } catch (err) {
      console.error('发送反馈到Google Sheets失败:', err);
      
      // 失败时也保存到localStorage
      const existingFeedback: FeedbackData[] = JSON.parse(localStorage.getItem('userFeedback') || '[]');
      existingFeedback.push(data);
      localStorage.setItem('userFeedback', JSON.stringify(existingFeedback));
      
      setError(t('提交失败，但已保存在本地'));
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 创建反馈数据
      const feedbackData: FeedbackData = {
        id: Date.now().toString(),
        type: feedbackType,
        text: feedbackText,
        email: email,
        timestamp: Date.now(),
        language: i18n.language,
        userAgent: navigator.userAgent,
      };
      
      // 发送到Google Sheets
      await sendFeedbackToGoogleSheets(feedbackData);
      
      // 如果集成了Plausible，跟踪事件
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('feedback_submitted', { 
          props: { 
            feedbackType,
            hasEmail: !!email,
            language: i18n.language
          } 
        });
      }
      
      setSubmitted(true);
      // 5秒后关闭表单
      setTimeout(() => {
        setIsOpen(false);
        // 重置表单，以便下次使用
        setTimeout(() => {
          setSubmitted(false);
          setFeedbackText('');
          setEmail('');
          setFeedbackType('suggestion');
        }, 300);
      }, 5000);
    } catch (error) {
      console.error('提交反馈时出错:', error);
      setError(t('提交失败，请稍后再试'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 反馈按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-6 rounded-l-md shadow-lg hover:bg-blue-700 transition-colors"
        style={{ writingMode: 'vertical-lr' }}
      >
        {t('反馈')}
      </button>

      {/* 反馈表单弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative">
            {/* 关闭按钮 */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold mb-4 text-center">
                  {t('我们重视您的意见')}
                </h2>
                
                {error && (
                  <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    {t('反馈类型')}:
                  </label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="suggestion">{t('建议')}</option>
                    <option value="bug">{t('问题报告')}</option>
                    <option value="feature">{t('功能请求')}</option>
                    <option value="other">{t('其他')}</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    {t('详细描述')}:
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                    placeholder={t('请在此处描述您的想法、建议或问题...')}
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    {t('邮箱')} ({t('选填')}):
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('我们将通知您最新功能和模板')}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {t('留下邮箱获得更多模板和首发功能通知')}
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {isSubmitting ? t('提交中...') : t('提交反馈')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h2 className="text-2xl font-bold mb-2 text-gray-800">{t('谢谢您的反馈！')}</h2>
                <p className="text-gray-600">
                  {email 
                    ? t('我们已收到您的反馈，并会通过邮箱通知您后续进展。') 
                    : t('我们已收到您的反馈，感谢您的支持！')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackForm; 