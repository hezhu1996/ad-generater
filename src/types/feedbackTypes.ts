// 反馈类型定义
export type FeedbackType = 'suggestion' | 'bug' | 'feature' | 'other' | 'generator_feedback';

// 反馈数据结构
export interface FeedbackData {
  id: string;
  type: FeedbackType;
  text: string;
  email: string;
  timestamp: number;
  language: string;
  userAgent: string;
  [key: string]: string | number; // 添加索引签名允许任意属性
} 