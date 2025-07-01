'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserId, addUserIdToProps } from '../UserIdTracker';
import { submitFeedback } from '../../services/feedbackService';
import { FeedbackData } from '../../types/feedbackTypes';

// 为Plausible声明全局类型
declare global {
  interface Window {
    plausible: (eventName: string, options?: { callback?: VoidFunction; props?: Record<string, unknown> }) => void;
  }
}

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  imagesCount: number;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({ isOpen, onClose, imagesCount }) => {
  const { t, i18n } = useTranslation();
  const [feedbackValue, setFeedbackValue] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  // 初始化用户ID
  const userId = useUserId();

  // Don't render if not open
  if (!isOpen) return null;

  const handleFeedbackSubmit = async () => {
    if (!feedbackValue.trim()) return;
    
    // 准备反馈数据
    const feedbackData: FeedbackData = {
      id: Date.now().toString(),
      type: 'generator_feedback',
      text: feedbackValue,
      email: email, // 包含用户填写的邮箱（可能为空）
      timestamp: Date.now(),
      language: i18n.language,
      userAgent: navigator.userAgent,
      imagesCount: imagesCount
    };
    
    // 发送反馈到对应的服务（Google Sheets或LeanCloud）
    try {
      await submitFeedback(feedbackData);
      
      // If plausible is available, track the feedback event
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('feedback_submitted', { 
          props: addUserIdToProps({ 
            feedbackType: 'generator_feedback',
            feedbackText: feedbackValue,
            hasEmail: !!email,
            imagesCount
          })
        });
      }
      
      // 如果用户提供了邮箱，也触发订阅事件
      if (email && email.includes('@') && typeof window !== 'undefined' && window.plausible) {
        window.plausible('newsletter_subscribe', { 
          props: addUserIdToProps({ 
            source: 'thank_you_modal',
            email
          })
        });
      }
      
      // Mark feedback as submitted
      setFeedbackSubmitted(true);
      // Clear feedback after submission
      setTimeout(() => {
        setFeedbackValue('');
        setEmail('');
      }, 500);
    } catch (error) {
      console.error('提交反馈失败:', error);
      // 即使失败也标记为已提交，以提供良好的用户体验
      setFeedbackSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label={t('Close')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Thank you message */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t('成功生成广告图片！')}
          </h2>
          <p className="text-gray-600">
            {t('已成功生成 {{count}} 张广告图片', { count: imagesCount })}
          </p>
        </div>

        {/* Feedback section with email */}
        <div className="mb-6">
          {feedbackSubmitted ? (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-center">
              {t('感谢您的反馈！')}
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {t('如何改进这个工具？')}
              </h3>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                rows={3}
                value={feedbackValue}
                onChange={(e) => setFeedbackValue(e.target.value)}
                placeholder={t('请分享您的想法和建议...')}
              />
              
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {t('想获得更多广告设计技巧和工具更新？')}
              </h3>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                placeholder={t('您的电子邮箱（选填）')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <button
                onClick={handleFeedbackSubmit}
                disabled={!feedbackValue.trim()}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {t('提交反馈')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal; 