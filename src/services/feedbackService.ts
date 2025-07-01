'use client';

import { FeedbackData } from '../types/feedbackTypes';
// 使用动态导入解决LeanCloud在Next.js中的兼容性问题
// import AV from 'leancloud-storage';
let AV: any = null;

// LeanCloud 初始化配置
// 使用环境变量或默认值
const LEANCLOUD_APP_ID = process.env.NEXT_PUBLIC_LEANCLOUD_APP_ID || 'dCLPYQ3YZUlofxENtaa4E1nT-MdYXbMMI';
const LEANCLOUD_APP_KEY = process.env.NEXT_PUBLIC_LEANCLOUD_APP_KEY || 'dpnjhz9AcZxTAoBSsVDCmhWb';
const LEANCLOUD_SERVER_URL = process.env.NEXT_PUBLIC_LEANCLOUD_SERVER_URL || 'https://dclpyq3y.api.lncldglobal.com';

// Google Sheets Web App URL
const GOOGLE_SHEETS_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || 'https://script.google.com/macros/s/AKfycbzHJsVaHIojHprsT3nbE7Y_P8dnl4Fc6rCr-si7HEyPkOQVykvDww5z0VTtbQZ-YIt37A/exec';

// 初始化LeanCloud
const initLeanCloud = async () => {
  if (typeof window !== 'undefined') {
    try {
      // 动态导入，只在客户端执行
      if (!AV) {
        const AVModule = await import('leancloud-storage');
        AV = AVModule.default || AVModule;
      }
      
      if (!AV.applicationId) {
        AV.init({
          appId: LEANCLOUD_APP_ID,
          appKey: LEANCLOUD_APP_KEY,
          serverURL: LEANCLOUD_SERVER_URL
        });
        console.log('LeanCloud 初始化成功');
      }
      return true;
    } catch (error) {
      console.error('LeanCloud 初始化失败:', error);
      return false;
    }
  }
  return false;
};

// 检查是否可以访问Google服务
const canAccessGoogle = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors' // 使用no-cors模式避免CORS问题
    });
    
    clearTimeout(timeoutId);
    return true; // 如果没有抛出错误，则认为可以访问
  } catch (e) {
    console.log('Google服务不可访问，将使用国内服务');
    return false;
  }
};

// 保存到本地存储
const saveToLocalStorage = (data: FeedbackData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const existingFeedback: FeedbackData[] = JSON.parse(localStorage.getItem('userFeedback') || '[]');
    existingFeedback.push(data);
    localStorage.setItem('userFeedback', JSON.stringify(existingFeedback));
    console.log('反馈已保存到本地存储');
  } catch (error) {
    console.error('保存到本地存储失败:', error);
  }
};

// 发送到Google Sheets
const sendToGoogleSheets = async (data: FeedbackData): Promise<boolean> => {
  try {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    
    await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: params.toString()
    });
    
    console.log('反馈已发送到Google Sheets');
    return true;
  } catch (error) {
    console.error('发送到Google Sheets失败:', error);
    return false;
  }
};

// 发送到LeanCloud
const sendToLeanCloud = async (data: FeedbackData): Promise<boolean> => {
  try {
    // 确保LeanCloud已初始化
    const initialized = await initLeanCloud();
    if (!initialized || !AV) {
      console.error('LeanCloud未初始化，无法保存数据');
      return false;
    }
    
    // 创建反馈对象
    const Feedback = AV.Object.extend('Feedback');
    const feedback = new Feedback();
    
    // 设置属性
    Object.entries(data).forEach(([key, value]) => {
      feedback.set(key, value);
    });
    
    // 保存到云端
    await feedback.save();
    console.log('反馈已发送到LeanCloud');
    return true;
  } catch (error) {
    console.error('发送到LeanCloud失败:', error);
    return false;
  }
};

// 智能提交反馈
export const submitFeedback = async (data: FeedbackData): Promise<boolean> => {
  // 始终保存到本地存储作为备份
  saveToLocalStorage(data);
  
  try {
    // 检查是否可以访问Google服务
    const useGoogleService = await canAccessGoogle();
    
    if (useGoogleService) {
      // 国际用户优先使用Google Sheets
      return await sendToGoogleSheets(data);
    } else {
      // 中国用户使用LeanCloud
      return await sendToLeanCloud(data);
    }
  } catch (error) {
    console.error('提交反馈失败:', error);
    return false;
  }
}; 