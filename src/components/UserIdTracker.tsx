'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// 用户ID跟踪器 - 在localStorage中存储用户的唯一标识符
export const useUserId = () => {
  const [userId, setUserId] = useState<string>('');
  
  useEffect(() => {
    // 尝试从localStorage获取现有userId
    let existingId = '';
    try {
      existingId = localStorage.getItem('rapidad_user_id') || '';
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    
    // 如果不存在userId，生成一个新的并保存
    if (!existingId) {
      existingId = uuidv4();
      try {
        localStorage.setItem('rapidad_user_id', existingId);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
    
    // 设置userId状态
    setUserId(existingId);
    
    // 如果Plausible可用，将userId作为自定义属性添加到所有事件中
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('user_identified', { 
        props: { 
          user_id: existingId 
        } 
      });
    }
  }, []);
  
  return userId;
};

// 用于给任何事件添加用户ID的辅助函数
export const addUserIdToProps = (props: Record<string, unknown> = {}): Record<string, unknown> => {
  try {
    const userId = localStorage.getItem('rapidad_user_id');
    if (userId) {
      return { ...props, user_id: userId };
    }
  } catch (error) {
    console.error('Error accessing localStorage:', error);
  }
  return props;
}; 