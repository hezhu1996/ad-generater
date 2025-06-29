'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 中文翻译
const zhResources = {
  translation: {
    // 页面标题和描述
    '批量广告图片生成器': '批量广告图片生成器',
    '上传您的产品图片，添加自定义文字和按钮样式，一键批量生成适合各大平台的专业广告和A/B测试图片': '上传您的产品图片，添加自定义文字和按钮样式，一键批量生成适合各大平台的专业广告和A/B测试图片',
    
    // 新增模板相关翻译
    'Button Templates': '按钮模板',
    '选择按钮模板': '选择按钮模板',
    '选择组合模板': '选择组合模板',
    '按钮模板': '按钮模板',
    
    // 页面标题
    'Upload Product Images': '上传产品图片',
    'Ad Text Groups': '广告文字组',
    'CTA Button Style': 'CTA 按钮样式',
    'Platform Selection': '广告平台选择',
    'Preview': '预览',
    'Generation Preview': '生成预览',
    'Scroll Following': '跟随滚动',

    // 按钮文本
    'Add Text Group': '添加文字组',
    'Generate All Ad Images': '生成所有组合的广告图片',
    'Generating...': '生成中...',
    'Add Option': '+ 添加选项',
    'Add More': '继续添加',
    'Replace All': '全部替换',
    'Reset': '重置',
    'Done': '完成',
    'Unselect All': '取消全选',

    // 上传区域
    'Click or Drag to Upload': '点击或拖拽上传图片',
    'Supports JPG, PNG (Max 5)': '支持 JPG, PNG 格式 (最多5张)',
    'Uploaded': '已上传',
    'Images': '张图片',
    'Previous image': '上一张图片',
    'Next image': '下一张图片',
    'Switch to image': '切换到图片',

    // 文字设置
    'Position': '位置',
    'Top': '顶部',
    'Bottom': '底部',
    'Custom': '自定义',
    'Color': '颜色',
    'Font': '字体',
    'X Position': 'X位置',
    'Y Position': 'Y位置',
    'Text Size': '文字大小',
    'Text Options': '文字选项',
    'Option': '选项',
    '位置:': '位置:',
    '颜色:': '颜色:',
    '字体:': '字体:',
    'X位置:': 'X位置:',
    'Y位置:': 'Y位置:',
    '文字大小:': '文字大小:',
    '选择文字颜色': '选择文字颜色',

    // CTA按钮
    'Button Text Options': '按钮文字选项',
    'Background Color': '背景颜色',
    'Text Color': '文字颜色',
    'Button Font': '按钮字体',
    'Border Radius': '圆角大小',
    'No Radius': '无圆角',
    'Small Radius': '小圆角',
    'Medium Radius': '中等圆角',
    'Large Radius': '大圆角',
    'Pill Shape': '胶囊形',
    'Button Position and Size': '按钮位置与大小',
    'Button Size': '按钮大小',
    'Drag in Preview': '也可在预览中直接拖动',
    'Select Button Background Color': '选择按钮背景颜色',
    'Select Button Text Color': '选择按钮文字颜色',
    'Buy Now': '立即购买',

    // 平台
    'Selected': '已选择',
    'Select All': '全选',
    'Deselect All': '取消全选',
    'Width': '宽',
    'Height': '高',
    'Custom Size': '自定义',
    'Default Preview': '默认预览',
    '预览平台:': '预览平台:',
    '文字选项:': '文字选项:',
    '默认预览': '默认预览',
    '方形': '方形',
    '横向': '横向',
    'Story': 'Story',
    '广告': '广告',
    '广告牌': '广告牌',
    '移动端': '移动端',
    '桌面端': '桌面端',
    '横幅': '横幅',
    '标准': '标准',
    '开屏': '开屏',
    '展示': '展示',
    'Feed': 'Feed',
    '卡片': '卡片',
    '商品主图': '商品主图',
    '店铺横幅': '店铺横幅',
    '促销图': '促销图',
    '自定义': '自定义',
    '宽:': '宽:',
    '高:': '高:',
    '完成': '完成',
    '编辑尺寸': '编辑尺寸',
    '重置为默认尺寸': '重置为默认尺寸',
    '已选择的平台:': '已选择的平台:',
    '请至少选择一个平台': '请至少选择一个平台',
    '预计生成': '预计生成',
    '张图片': '张图片',
    '个平台': '个平台',
    'Image': '图片',
    'No Image Uploaded': '未上传图片',
    'Button': '按钮',
    '已选择': '已选择',

    // 统计
    'Text Group Count': '文字组数量',
    'Text Combination Count': '文字组合数',
    'CTA Option Count': 'CTA 选项数',
    'Total Combination Count': '总组合数',
    'Total Image Count': '总图片数',
    'Platforms': '个平台',
    'Product Images': '张产品图片',

    // 图片比例设置
    'Image Scale Settings': '图片比例设置',
    'Scale Mode': '缩放模式',
    'Auto (Keep Original Ratio)': '自动（保持原始比例）',
    'Width Ratio': '宽度比例',
    'Height Ratio': '高度比例',
    'Controls how much of the canvas width the image occupies': '控制图片占画布宽度的比例',
    'Controls how much of the canvas height the image occupies': '控制图片占画布高度的比例',
    'Aspect Ratio': '宽高比',
    'Auto (Keep Original)': '自动（保持原始比例）',
    'Square (1:1)': '正方形 (1:1)',
    'Standard (4:3)': '标准 (4:3)',
    'Widescreen (16:9)': '宽屏 (16:9)',
    'Photo (3:2)': '照片 (3:2)',
    'Portrait (2:3)': '人像 (2:3)',
    'Custom aspect ratio will override auto-scaling': '自定义宽高比将覆盖自动缩放',
    'Reset to Default': '重置为默认值',
    'Click to upload images': '点击上传图片',
    'Supports JPG, PNG (Max 5 Images)': '支持 JPG, PNG 格式（最多5张）',

    // 其他
    'Language': '语言',
    'Chinese': '中文',
    'English': '英文',
  }
};

// 英文翻译
const enResources = {
  translation: {
    // 页面标题和描述
    '批量广告图片生成器': 'Bulk Ad Image Generator',
    '上传您的产品图片，添加自定义文字和按钮样式，一键批量生成适合各大平台的专业广告和A/B测试图片': 'Upload your product images, add custom text and button styles, and generate professional ADs and A/B test images for multiple platforms with one click',
    
    // 新增模板相关翻译
    'Button Templates': 'Button Templates',
    '选择按钮模板': 'Select Button Template',
    '选择组合模板': 'Select Combined Template',
    '按钮模板': 'Button Template',
    
    // 页面标题
    'Upload Product Images': 'Upload Product Images',
    'Ad Text Groups': 'Ad Text Groups',
    'CTA Button Style': 'CTA Button Style',
    'Platform Selection': 'Platform Selection',
    'Preview': 'Preview',
    'Generation Preview': 'Generation Preview',
    'Scroll Following': 'Scroll Following',

    // 按钮文本
    'Add Text Group': 'Add Text Group',
    'Generate All Ad Images': 'Generate All Ad Images',
    'Generating...': 'Generating...',
    'Add Option': '+ Add Option',
    'Add More': 'Add More',
    'Replace All': 'Replace All',
    'Reset': 'Reset',
    'Done': 'Done',
    'Unselect All': 'Unselect All',

    // 上传区域
    'Click or Drag to Upload': 'Click or Drag to Upload Images',
    'Supports JPG, PNG (Max 5)': 'Supports JPG, PNG (Max 5)',
    'Uploaded': 'Uploaded',
    'Images': 'images',
    'Previous image': 'Previous image',
    'Next image': 'Next image',
    'Switch to image': 'Switch to image',

    // 文字设置
    'Position': 'Position',
    'Top': 'Top',
    'Bottom': 'Bottom',
    'Custom': 'Custom',
    'Color': 'Color',
    'Font': 'Font',
    'X Position': 'X Position',
    'Y Position': 'Y Position',
    'Text Size': 'Text Size',
    'Text Options': 'Text Options',
    'Option': 'Option',
    '位置:': 'Position:',
    '颜色:': 'Color:',
    '字体:': 'Font:',
    'X位置:': 'X Position:',
    'Y位置:': 'Y Position:',
    '文字大小:': 'Text Size:',
    '选择文字颜色': 'Select Text Color',

    // CTA按钮
    'Button Text Options': 'Button Text Options',
    'Background Color': 'Background Color',
    'Text Color': 'Text Color',
    'Button Font': 'Button Font',
    'Border Radius': 'Border Radius',
    'No Radius': 'No Radius',
    'Small Radius': 'Small Radius',
    'Medium Radius': 'Medium Radius',
    'Large Radius': 'Large Radius',
    'Pill Shape': 'Pill Shape',
    'Button Position and Size': 'Button Position and Size',
    'Button Size': 'Button Size',
    'Drag in Preview': 'Can also be dragged in preview',
    'Select Button Background Color': 'Select Button Background Color',
    'Select Button Text Color': 'Select Button Text Color',
    'Buy Now': 'Buy Now',

    // 平台
    'Selected': 'Selected',
    'Select All': 'Select All',
    'Deselect All': 'Deselect All',
    'Width': 'Width',
    'Height': 'Height',
    'Custom Size': 'Custom Size',
    'Default Preview': 'Default Preview',
    '预览平台:': 'Preview Platform:',
    '文字选项:': 'Text Options:',
    '默认预览': 'Default Preview',
    '方形': 'Square',
    '横向': 'Landscape',
    'Story': 'Story',
    '广告': 'Ad',
    '广告牌': 'Billboard',
    '移动端': 'Mobile',
    '桌面端': 'Desktop',
    '横幅': 'Banner',
    '标准': 'Standard',
    '开屏': 'Splash',
    '展示': 'Display',
    'Feed': 'Feed',
    '卡片': 'Card',
    '商品主图': 'Product Image',
    '店铺横幅': 'Shop Banner',
    '促销图': 'Promotional',
    '自定义': 'Custom',
    '宽:': 'Width:',
    '高:': 'Height:',
    '完成': 'Done',
    '编辑尺寸': 'Edit Size',
    '重置为默认尺寸': 'Reset to Default',
    '已选择的平台:': 'Selected Platforms:',
    '请至少选择一个平台': 'Please select at least one platform',
    '预计生成': 'Will generate',
    '张图片': 'images',
    '个平台': 'platforms',
    'Image': 'Image',
    'No Image Uploaded': 'No Image Uploaded',
    'Button': 'Button',
    '已选择': 'Selected',

    // 统计
    'Text Group Count': 'Text Group Count',
    'Text Combination Count': 'Text Combination Count',
    'CTA Option Count': 'CTA Option Count',
    'Total Combination Count': 'Total Combination Count',
    'Total Image Count': 'Total Image Count',
    'Platforms': 'platforms',
    'Product Images': 'product images',

    // 图片比例设置
    'Image Scale Settings': 'Image Scale Settings',
    'Scale Mode': 'Scale Mode',
    'Auto (Keep Original Ratio)': 'Auto (Keep Original Ratio)',
    'Width Ratio': 'Width Ratio',
    'Height Ratio': 'Height Ratio',
    'Controls how much of the canvas width the image occupies': 'Controls how much of the canvas width the image occupies',
    'Controls how much of the canvas height the image occupies': 'Controls how much of the canvas height the image occupies',
    'Aspect Ratio': 'Aspect Ratio',
    'Auto (Keep Original)': 'Auto (Keep Original)',
    'Square (1:1)': 'Square (1:1)',
    'Standard (4:3)': 'Standard (4:3)',
    'Widescreen (16:9)': 'Widescreen (16:9)',
    'Photo (3:2)': 'Photo (3:2)',
    'Portrait (2:3)': 'Portrait (2:3)',
    'Custom aspect ratio will override auto-scaling': 'Custom aspect ratio will override auto-scaling',
    'Reset to Default': 'Reset to Default',
    'Click to upload images': 'Click to upload images',
    'Supports JPG, PNG (Max 5 Images)': 'Supports JPG, PNG (Max 5 Images)',

    // 其他
    'Language': 'Language',
    'Chinese': 'Chinese',
    'English': 'English',
  }
};

// 获取存储在客户端的语言设置
const getStoredLanguage = () => {
  if (typeof window === 'undefined') return undefined; // 服务器端返回undefined
  
  try {
    return localStorage.getItem('i18nextLng') || undefined;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return undefined;
  }
};

// 初始化i18n实例
const i18nInstance = i18n.createInstance();

// 只在客户端添加语言检测
if (typeof window !== 'undefined') {
  i18nInstance.use(LanguageDetector);
}

// 添加语言检测回调，确保只使用支持的语言
const languageDetectorCallback = (detectedLng: string) => {
  // 如果检测到的语言以zh开头(如zh-CN, zh-TW等)，返回zh
  if (detectedLng && detectedLng.startsWith('zh')) {
    return 'zh';
  }
  // 其他所有语言默认返回英文
  return 'en';
};

i18nInstance
  .use(initReactI18next)
  .init({
    resources: {
      en: enResources,
      zh: zhResources
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    // 用户手动设置的语言优先
    lng: getStoredLanguage() || 'en', // 确保有默认值
    supportedLngs: ['en', 'zh'], // 支持的语言列表
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      // 添加检测回调，处理检测到的语言
      convertDetectedLanguage: languageDetectorCallback
    }
  });

export default i18nInstance; 