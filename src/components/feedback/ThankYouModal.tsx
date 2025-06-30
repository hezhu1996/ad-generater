'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [feedbackValue, setFeedbackValue] = useState<string>('');
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // Don't render if not open
  if (!isOpen) return null;

  const handleFeedbackSubmit = () => {
    // If plausible is available, track the feedback event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('feedback_submitted', { 
        props: { 
          feedbackType: 'generator_feedback',
          feedbackText: feedbackValue,
          imagesCount
        } 
      });
    }
    // Mark feedback as submitted
    setFeedbackSubmitted(true);
    // Clear feedback after submission
    setTimeout(() => {
      setFeedbackValue('');
    }, 500);
  };

  const handleSubscribe = () => {
    // If plausible is available, track the subscription event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('newsletter_subscribe', { 
        props: { 
          source: 'thank_you_modal',
          email
        } 
      });
    }
    
    // Show subscription confirmation
    setIsSubscribing(true);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail('');
    }, 2000);
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

        {/* Feedback section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {t('如何改进这个工具？')}
          </h3>
          {feedbackSubmitted ? (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-center">
              {t('感谢您的反馈！')}
            </div>
          ) : (
            <>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={feedbackValue}
                onChange={(e) => setFeedbackValue(e.target.value)}
                placeholder={t('请分享您的想法和建议...')}
              />
              <button
                onClick={handleFeedbackSubmit}
                disabled={!feedbackValue.trim()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {t('提交反馈')}
              </button>
            </>
          )}
        </div>

        {/* Newsletter subscription */}
        <div className="border-t border-gray-200 pt-5">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {t('想获得更多广告设计技巧和工具更新？')}
          </h3>
          <div className="flex">
            <input
              type="email"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('您的电子邮箱')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleSubscribe}
              disabled={!email.includes('@') || isSubscribing}
              className="px-4 py-2 bg-green-500 text-white rounded-r-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubscribing ? t('已订阅!') : t('订阅')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal; 