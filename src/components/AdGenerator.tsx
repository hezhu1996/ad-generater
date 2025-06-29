'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { HexColorPicker } from 'react-colorful'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { ButtonStyle, AdText, AdTextGroup, ImageScaleSettings } from '../types/adTypes'
import { buttonTemplates, combinedTemplates } from '../data/buttonTemplates'

// 添加Plausible跟踪函数
const trackEvent = (eventName: string, props?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props });
  }
};

// 声明window.plausible类型
declare global {
  interface Window {
    plausible: (eventName: string, options?: { callback?: VoidFunction; props?: Record<string, any> }) => void;
  }
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

export default function AdGenerator() {
  const { t, i18n } = useTranslation();
  
  // 实用函数：检测文字是否包含中文
  const containsChinese = (text: string) => /[\u4e00-\u9fa5]/.test(text);
  // 实用函数：检测文字是否包含英文
  const containsEnglish = (text: string) => /[a-zA-Z]/.test(text);
  
  // 检测字体是否支持中文
  const isSupportChinese = (font: string): boolean => {
    const chineseSupportedFonts = [
      'Microsoft YaHei', 'SimSun', 'Noto Sans SC', 'Noto Sans TC', 
      'Noto Serif SC', 'Noto Serif TC', 'Zen Old Mincho', 'Zen Maru Gothic'
    ];
    
    return chineseSupportedFonts.some(supportedFont => font.includes(supportedFont));
  };
  
  // 获取模板的英文名称
  const getEnglishTemplateName = (chineseName: string): string => {
    const templateNameMap: {[key: string]: string} = {
      '简约风格': 'Minimalist Style',
      '黑色极简': 'Black Minimal',
      '促销风格': 'Promotional Style',
      '清新风格': 'Fresh Style',
      '高端风格': 'Premium Style',
      '时尚风格': 'Fashion Style',
      '珠宝风格': 'Jewelry Style',
      '科技风格': 'Tech Style',
      '美妆风格': 'Beauty Style',
      '家居风格': 'Home Style',
      '食品风格': 'Food Style',
      '旅行风格': 'Travel Style',
      '运动风格': 'Sports Style',
      '电子产品风格': 'Electronics Style',
      '儿童产品风格': 'Kids Style',
      '书籍风格': 'Book Style',
      '音乐风格': 'Music Style',
      '艺术风格': 'Art Style',
      '健康风格': 'Health Style',
      '奢华风格': 'Luxury Style'
    };
    
    return templateNameMap[chineseName] || chineseName;
  };
  
  // 实用函数：根据当前语言过滤文字选项
  const filterTextOptionsByLanguage = useCallback((options: string[]): string[] => {
    const isEnglish = i18n.language === 'en';
    const filtered = options.filter(option => {
      if (isEnglish) {
        // 英文模式：保留英文文字选项
        return containsEnglish(option) && !containsChinese(option);
      } else {
        // 中文模式：保留中文文字选项
        return containsChinese(option);
      }
    });
    
    // 如果过滤后没有选项，则添加默认文本
    if (filtered.length === 0) {
      filtered.push(isEnglish ? 'Buy Now' : '立即购买');
    }
    
    return filtered;
  }, [i18n.language]);
  
  const [images, setImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)
  const [adTextGroups, setAdTextGroups] = useState<AdTextGroup[]>([])
  // 添加图片比例设置状态
  const [imageScaleSettings, setImageScaleSettings] = useState<ImageScaleSettings>({
    mode: 'auto',
    widthRatio: 0.9,  // 默认图片宽度占画布的90%
    heightRatio: 0.7, // 默认图片高度占画布的70%
    aspectRatio: 'auto', // 自动保持原始比例
    stretchMode: 'maintain' // 默认保持图片比例
  });
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>({
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 24px',
    textOptions: [i18n.language === 'en' ? 'Buy Now' : '立即购买'],
    font: 'Arial, sans-serif',
    x: 50, // 默认居中
    y: 75, // 默认在画布下部
    size: 1 // 默认大小比例
  })
  
  // 当语言变化时更新按钮文字
  useEffect(() => {
    // 应用语言过滤到当前按钮文字选项
    const currentOptions = buttonStyle.textOptions;
    
    // 如果当前只有一个选项且是默认值，则更新为当前语言的默认值
    if (currentOptions.length === 1 && 
        (currentOptions[0] === '立即购买' || currentOptions[0] === 'Buy Now')) {
      setButtonStyle(prev => ({
        ...prev,
        textOptions: [i18n.language === 'en' ? 'Buy Now' : '立即购买']
      }));
    }
    // 否则，应用语言过滤逻辑
    else {
      const filteredOptions = filterTextOptionsByLanguage(currentOptions);
      
      // 如果过滤后的选项与当前选项不同，则更新
      if (JSON.stringify(filteredOptions) !== JSON.stringify(currentOptions)) {
        setButtonStyle(prev => ({
          ...prev,
          textOptions: filteredOptions
        }));
      }
    }
  }, [i18n.language, filterTextOptionsByLanguage]);
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  const [draggedText, setDraggedText] = useState<string | null>(null)
  const [draggedButton, setDraggedButton] = useState<boolean>(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [debounceUpdate, setDebounceUpdate] = useState<{x: number, y: number} | null>(null)
    // 新增：预览用的CTA按钮文案索引
    const [previewCtaIndex, setPreviewCtaIndex] = useState(0);
    // 新增：每个广告文字组的预览选项索引
    const [previewTextIndexes, setPreviewTextIndexes] = useState<number[]>([]);

    // 预览渲染逻辑，使用当前CTA文案
    const previewCtaText = buttonStyle.textOptions.filter(opt => opt.trim())[previewCtaIndex] || '';
    // 预览渲染逻辑，使用每组 previewTextIndexes 对应的选项
    const previewTexts = adTextGroups.map((group, groupIdx) => {
      const options = group.options.filter(opt => opt.trim());
      const idx = Math.max(0, Math.min(previewTextIndexes[groupIdx] ?? 0, options.length - 1));
      return {
        ...group,
        text: options[idx] || '',
      };
    });
  // 添加尺寸编辑状态
  const [editingSize, setEditingSize] = useState<string | null>(null)
  
  // 添加预览平台选择状态
  const [previewPlatform, setPreviewPlatform] = useState<string>('default')
  
  // 平台配置 - 使用useMemo避免重复创建
  const allPlatforms = useMemo(() => [
    // Facebook
    { key: 'Facebook_Square', name: `Facebook ${t('方形')}`, defaultWidth: 1080, defaultHeight: 1080, category: 'Facebook', icon: '📘' },
    { key: 'Facebook_Landscape', name: `Facebook ${t('横向')}`, defaultWidth: 1200, defaultHeight: 630, category: 'Facebook', icon: '📘' },
    
    // Google Ads
    { key: 'Google_Ads_Square', name: `Google Ads ${t('方形')}`, defaultWidth: 1200, defaultHeight: 1200, category: 'Google Ads', icon: '🔍' },
    { key: 'Google_Ads_Landscape', name: `Google Ads ${t('横向')}`, defaultWidth: 1200, defaultHeight: 628, category: 'Google Ads', icon: '🔍' },
    
    // Instagram
    { key: 'Instagram_Square', name: `Instagram ${t('方形')}`, defaultWidth: 1080, defaultHeight: 1080, category: 'Instagram', icon: '📷' },
    { key: 'Instagram_Story', name: `Instagram ${t('Story')}`, defaultWidth: 1080, defaultHeight: 1920, category: 'Instagram', icon: '📷' },
    
    // LinkedIn
    { key: 'LinkedIn_Single', name: `LinkedIn ${t('广告')}`, defaultWidth: 1200, defaultHeight: 627, category: 'LinkedIn', icon: '💼' },
    
    // Twitter/X
    { key: 'Twitter_Post', name: `Twitter ${t('广告')}`, defaultWidth: 1200, defaultHeight: 675, category: 'Twitter', icon: '🐦' },
    
    // Amazon (新增)
    { key: 'Amazon_Mobile', name: `Amazon ${t('移动端')}`, defaultWidth: 600, defaultHeight: 500, category: 'Amazon', icon: '🛒' },
    { key: 'Amazon_Desktop', name: `Amazon ${t('桌面端')}`, defaultWidth: 1000, defaultHeight: 500, category: 'Amazon', icon: '🛒' },
    { key: 'Amazon_Banner', name: `Amazon ${t('横幅')}`, defaultWidth: 1500, defaultHeight: 300, category: 'Amazon', icon: '🛒' },
    
    // eBay (新增)
    { key: 'eBay_Standard', name: `eBay ${t('标准')}`, defaultWidth: 900, defaultHeight: 900, category: 'eBay', icon: '🏷️' },
    { key: 'eBay_Billboard', name: `eBay ${t('广告牌')}`, defaultWidth: 1200, defaultHeight: 270, category: 'eBay', icon: '🏷️' },
    { key: 'eBay_Mobile', name: `eBay ${t('移动端')}`, defaultWidth: 660, defaultHeight: 440, category: 'eBay', icon: '🏷️' },
    
    // TikTok (新增)
    { key: 'TikTok_Feed', name: `TikTok ${t('Feed')}`, defaultWidth: 1080, defaultHeight: 1920, category: 'TikTok', icon: '📱' },
    { key: 'TikTok_Splash', name: `TikTok ${t('开屏')}`, defaultWidth: 1080, defaultHeight: 1920, category: 'TikTok', icon: '📱' },
    { key: 'TikTok_Display', name: `TikTok ${t('展示')}`, defaultWidth: 1200, defaultHeight: 628, category: 'TikTok', icon: '📱' },
    
    // Reddit (新增)
    { key: 'Reddit_Feed', name: `Reddit ${t('Feed')}`, defaultWidth: 1200, defaultHeight: 628, category: 'Reddit', icon: '🔶' },
    { key: 'Reddit_Card', name: `Reddit ${t('卡片')}`, defaultWidth: 400, defaultHeight: 300, category: 'Reddit', icon: '🔶' },
    { key: 'Reddit_Mobile', name: `Reddit ${t('移动端')}`, defaultWidth: 640, defaultHeight: 640, category: 'Reddit', icon: '🔶' },
    
    
    // Etsy (新增)
    { key: 'Etsy_Square', name: `Etsy ${t('商品主图')}`, defaultWidth: 1000, defaultHeight: 1000, category: 'Etsy', icon: '🛍️' },
    { key: 'Etsy_Banner', name: `Etsy ${t('店铺横幅')}`, defaultWidth: 1200, defaultHeight: 300, category: 'Etsy', icon: '🛍️' },
    { key: 'Etsy_Promo', name: `Etsy ${t('促销图')}`, defaultWidth: 1200, defaultHeight: 628, category: 'Etsy', icon: '🛍️' }
  ], [t]);
  
  // 添加平台选择状态 - 默认全选
  const [selectedPlatforms, setSelectedPlatforms] = useState<{[key: string]: boolean}>(() => {
    // 创建包含所有平台的初始状态，全部设为true
    const initialState: Record<string, boolean> = {};
    // 使用硬编码平台列表来避免依赖allPlatforms
    const platformKeys = [
      'Facebook_Square', 'Facebook_Landscape', 
      'Google_Ads_Square', 'Google_Ads_Landscape', 
      'Instagram_Square', 'Instagram_Story', 
      'LinkedIn_Single', 'Twitter_Post',
      'Amazon_Mobile', 'Amazon_Desktop', 'Amazon_Banner',
      'eBay_Standard', 'eBay_Billboard', 'eBay_Mobile',
      'TikTok_Feed', 'TikTok_Splash', 'TikTok_Display',
      'Reddit_Feed', 'Reddit_Card', 'Reddit_Mobile',
      'Etsy_Square', 'Etsy_Banner', 'Etsy_Promo'
    ];
    platformKeys.forEach(key => {
      initialState[key] = true;
    });
    return initialState;
  });
  
  // 添加自定义尺寸状态
  const [customSizes, setCustomSizes] = useState<{[key: string]: {width: number, height: number}}>({
    // 基础平台
    'Facebook_Square': { width: 1080, height: 1080 },
    'Facebook_Landscape': { width: 1200, height: 630 },
    'Google_Ads_Square': { width: 1200, height: 1200 },
    'Google_Ads_Landscape': { width: 1200, height: 628 },
    'Instagram_Square': { width: 1080, height: 1080 },
    'Instagram_Story': { width: 1080, height: 1920 },
    'LinkedIn_Single': { width: 1200, height: 627 },
    'Twitter_Post': { width: 1200, height: 675 },
    
    // Amazon
    'Amazon_Mobile': { width: 600, height: 500 },
    'Amazon_Desktop': { width: 1000, height: 500 },
    'Amazon_Banner': { width: 1500, height: 300 },
    
    // eBay
    'eBay_Standard': { width: 900, height: 900 },
    'eBay_Billboard': { width: 1200, height: 270 },
    'eBay_Mobile': { width: 660, height: 440 },
    
    // TikTok
    'TikTok_Feed': { width: 1080, height: 1920 },
    'TikTok_Splash': { width: 1080, height: 1920 },
    'TikTok_Display': { width: 1200, height: 628 },
    
    // Reddit
    'Reddit_Feed': { width: 1200, height: 628 },
    'Reddit_Card': { width: 400, height: 300 },
    'Reddit_Mobile': { width: 640, height: 640 },
    
    // Etsy
    'Etsy_Square': { width: 1000, height: 1000 },
    'Etsy_Banner': { width: 1200, height: 300 },
    'Etsy_Promo': { width: 1200, height: 628 }
  })
  
  // 平台选择处理函数
  const handlePlatformToggle = (platformKey: string) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platformKey]: !prev[platformKey]
    }))
  }
  
  // 自定义尺寸处理函数
  const handleCustomSizeChange = (platformKey: string, dimension: 'width' | 'height', value: number) => {
    setCustomSizes(prev => ({
      ...prev,
      [platformKey]: {
        ...prev[platformKey],
        [dimension]: Math.max(100, Math.min(3000, value)) // 限制在100-3000之间
      }
    }))
  }
  
  // 重置尺寸到默认值
  const handleResetSize = (platformKey: string) => {
    const platform = allPlatforms.find(p => p.key === platformKey)
    if (platform) {
      setCustomSizes(prev => ({
        ...prev,
        [platformKey]: { width: platform.defaultWidth, height: platform.defaultHeight }
      }))
    }
  }
  
  // 全选/取消全选
  const handleSelectAll = () => {
    const allSelected = Object.values(selectedPlatforms).every(v => v)
    const newSelection = allPlatforms.reduce((acc, platform) => {
      acc[platform.key] = !allSelected
      return acc
    }, {} as Record<string, boolean>)
    setSelectedPlatforms(newSelection)
  }
  
  // 获取选中的平台
  const getSelectedPlatforms = () => {
    return allPlatforms.filter(platform => selectedPlatforms[platform.key]).map(platform => ({
      ...platform,
      width: customSizes[platform.key]?.width || platform.defaultWidth,
      height: customSizes[platform.key]?.height || platform.defaultHeight
    }))
  }
  
  // 获取选中的平台数量
  const getSelectedPlatformCount = () => {
    return Object.values(selectedPlatforms).filter(v => v).length
  }
  
  // 按平台分组
  const getPlatformsByCategory = () => {
    const grouped = allPlatforms.reduce((acc, platform) => {
      if (!acc[platform.category]) {
        acc[platform.category] = []
      }
      acc[platform.category].push(platform)
      return acc
    }, {} as {[key: string]: typeof allPlatforms})
    return grouped
  }
  
  // 获取当前预览平台信息
  const getCurrentPreviewPlatform = () => {
    if (previewPlatform === 'default') {
      // 默认预览使用固定尺寸和名称
      return {
        name: t('默认预览'),
        width: 800,
        height: 600,
        isDefault: true
      }
    }
    
    const platform = allPlatforms.find(p => p.key === previewPlatform)
    if (platform) {
      const currentSize = customSizes[platform.key]
      return {
        name: platform.name,
        width: currentSize.width,
        height: currentSize.height,
        isDefault: false
      }
    }
    
    return {
      name: t('默认预览'),
      width: 800,
      height: 600,
      isDefault: true
    }
  }
  
  // 使用防抖更新位置 - 恢复原功能但优化性能
  const debouncedUpdatePosition = useCallback(
    debounce((id: string, x: number, y: number) => {
      console.log("更新位置:", id, x, y);
      setAdTextGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === id ? { ...group, x, y } : group
        )
      );
    }, 20), // 降低防抖时间以提高响应性
    []
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, appendMode: boolean = false) => {
    const files = event.target.files
    if (files && files.length > 0) {
      // 限制最多上传5张图片（考虑已有图片数量）
      const remainingSlots = 5 - (appendMode ? images.length : 0)
      const filesToProcess = Array.from(files).slice(0, remainingSlots)
      
      // 追踪事件 - 上传图片
      trackEvent('upload_images', { 
        count: filesToProcess.length,
        mode: appendMode ? 'append' : 'replace',
        total_after_upload: Math.min(appendMode ? images.length + filesToProcess.length : filesToProcess.length, 5)
      });
      
      // 清除当前选择的图片（仅在非追加模式下）
      if (!appendMode && event.target.value) {
        // 如果用户选择了新图片且不是追加模式，重置图片数组
        setImages([])
        setCurrentImageIndex(0)
      }
      
      filesToProcess.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImages(prevImages => {
            // 限制最多5张图片
            const newImages = [...prevImages, e.target?.result as string].slice(0, 5)
            return newImages
          })
        }
        reader.readAsDataURL(file)
      })
      
      // 清除input的value，确保用户可以再次选择相同的文件
      if (event.target) {
        event.target.value = ''
      }
    }
  }
  
  // 切换到上一张图片
  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))
  }
  
  // 切换到下一张图片
  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const addAdTextGroup = () => {
    const newGroup: AdTextGroup = {
      id: Date.now().toString(),
      options: [''],
      color: '#000000',
      position: 'custom',
      font: 'Arial, sans-serif',
      x: 50, // 默认X位置(百分比)
      y: 30, // 默认Y位置(百分比)，设置为靠上以便更容易看到
      size: 1 // 默认大小比例
    }
    setAdTextGroups([...adTextGroups, newGroup])
  }

  const updateAdTextGroup = (id: string, updates: Partial<AdTextGroup>) => {
    setAdTextGroups(adTextGroups.map(group => 
      group.id === id ? { ...group, ...updates } : group
    ))
  }

  const removeAdTextGroup = (id: string) => {
    setAdTextGroups(adTextGroups.filter(group => group.id !== id))
  }

  const addTextOption = (groupId: string) => {
    updateAdTextGroup(groupId, {
      options: [...(adTextGroups.find(g => g.id === groupId)?.options || []), '']
    })
  }

  const updateTextOption = (groupId: string, optionIndex: number, value: string) => {
    const group = adTextGroups.find(g => g.id === groupId)
    if (group) {
      const newOptions = [...group.options]
      newOptions[optionIndex] = value
      updateAdTextGroup(groupId, { options: newOptions })
    }
  }

  const removeTextOption = (groupId: string, optionIndex: number) => {
    const group = adTextGroups.find(g => g.id === groupId)
    if (group && group.options.length > 1) {
      const newOptions = group.options.filter((_, index) => index !== optionIndex)
      updateAdTextGroup(groupId, { options: newOptions })
    }
  }

  const addCtaOption = () => {
    setButtonStyle({
      ...buttonStyle,
      textOptions: [...buttonStyle.textOptions, '']
    })
  }

  const updateCtaOption = (index: number, value: string) => {
    const newOptions = [...buttonStyle.textOptions]
    newOptions[index] = value
    setButtonStyle({ ...buttonStyle, textOptions: newOptions })
  }

  const removeCtaOption = (index: number) => {
    if (buttonStyle.textOptions.length > 1) {
      const newOptions = buttonStyle.textOptions.filter((_, i) => i !== index)
      setButtonStyle({ ...buttonStyle, textOptions: newOptions })
    }
  }

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    // 确保圆角半径不超过宽度或高度的一半
    const maxRadius = Math.min(width / 2, height / 2)
    const actualRadius = Math.min(radius, maxRadius)
    
    if (actualRadius <= 0) {
      // 如果圆角为0，绘制普通矩形
      ctx.rect(x, y, width, height)
      return
    }
    
    ctx.beginPath()
    ctx.moveTo(x + actualRadius, y)
    ctx.lineTo(x + width - actualRadius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + actualRadius)
    ctx.lineTo(x + width, y + height - actualRadius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - actualRadius, y + height)
    ctx.lineTo(x + actualRadius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - actualRadius)
    ctx.lineTo(x, y + actualRadius)
    ctx.quadraticCurveTo(x, y, x + actualRadius, y)
    ctx.closePath()
  }

  const drawTopTexts = (ctx: CanvasRenderingContext2D, width: number, texts: AdText[]) => {
    // 改为绘制所有非底部文字（包括顶部和自定义位置）
    texts.forEach((text, index) => {
      if (text.text.trim()) {
        // 应用大小比例
        const fontSize = Math.max(width * 0.04, 20) * (text.size || 1);
        ctx.font = `bold ${fontSize}px ${text.font || 'Arial, sans-serif'}`
        ctx.fillStyle = text.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        
        let xPosition = width / 2;
        let yPosition = 20 + (index * (Math.max(width * 0.05, 25)));
        
        if (text.position === 'custom' && text.x !== undefined && text.y !== undefined) {
          // 使用自定义位置
          xPosition = (text.x / 100) * width;
          yPosition = (text.y / 100) * ctx.canvas.height;
        }
        
        // 添加文字描边效果
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.strokeText(text.text, xPosition, yPosition)
        ctx.fillText(text.text, xPosition, yPosition)
      }
    })
  }

  const drawBottomTexts = (ctx: CanvasRenderingContext2D, width: number, height: number, texts: AdText[], imageHeight: number) => {
    // 计算图片实际占用的高度
    const startY = imageHeight + 20 // 在图片下方留20px间距

    // 绘制普通底部文字
    let currentY = startY
    texts.forEach((text) => {
      if (text.text.trim()) {
        // 应用大小比例
        const fontSize = Math.max(width * 0.04, 20) * (text.size || 1);
        ctx.font = `bold ${fontSize}px ${text.font || 'Arial, sans-serif'}`
        ctx.fillStyle = text.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        
        let xPosition = width / 2;
        let yPosition = currentY;
        
        if (text.position === 'custom' && text.x !== undefined && text.y !== undefined) {
          // 使用自定义位置
          xPosition = (text.x / 100) * width;
          yPosition = (text.y / 100) * ctx.canvas.height;
        } else {
          currentY += Math.max(width * 0.05, 25);
        }
        
        // 添加文字描边效果
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.strokeText(text.text, xPosition, yPosition)
        ctx.fillText(text.text, xPosition, yPosition)
      }
    })
  }

  const generateAdImage = useCallback(async (width: number, height: number, format: string, textCombination: AdText[], ctaText: string, imageIndex?: number) => {
    // 使用传入的imageIndex参数，如果未提供则使用currentImageIndex
    const imgIndex = imageIndex !== undefined ? imageIndex : currentImageIndex;
    const currentImage = images[imgIndex];
    
    if (!currentImage || !canvasRef.current || images.length === 0) return null

    // 调试输出
    console.log("绘制文字组合:", textCombination.map(t => ({
      text: t.text, 
      position: t.position,
      size: t.size || 1
    })));
    console.log("CTA按钮:", {
      text: ctaText,
      size: buttonStyle.size || 1
    });
    console.log("画布尺寸:", { width, height });
    console.log("使用图片索引:", imgIndex, "总图片数:", images.length);

    return new Promise<string>((resolve) => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      
      // 设置canvas的实际尺寸
      canvas.width = width
      canvas.height = height
      
      // 设置canvas的CSS尺寸，确保显示正确
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      
      console.log("Canvas实际尺寸:", { width: canvas.width, height: canvas.height });
      console.log("Canvas CSS尺寸:", { width: canvas.style.width, height: canvas.style.height });

      const img = new Image()
      img.onload = () => {
        // 绘制背景图片
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        
        // 计算图片位置和大小
        const imgAspectRatio = img.width / img.height
        const canvasAspectRatio = width / height
        
        let scaledWidth, scaledHeight, x, y
        
        // 完全拉伸模式 - 忽略原始比例，直接使用设定的宽高比例
        if (imageScaleSettings.mode === 'custom' && imageScaleSettings.stretchMode === 'stretch') {
          // 直接使用设定的宽度和高度比例，不保持原始比例
          scaledWidth = width * imageScaleSettings.widthRatio;
          scaledHeight = height * imageScaleSettings.heightRatio;
        }
        // 自定义宽高比模式
        else if (imageScaleSettings.mode === 'custom' && imageScaleSettings.aspectRatio !== 'auto') {
          // 使用自定义宽高比
          const [widthPart, heightPart] = imageScaleSettings.aspectRatio.split(':').map(Number);
          const customAspectRatio = widthPart / heightPart;
          
          // 根据自定义宽高比和设定的宽度/高度比例计算尺寸
          scaledWidth = width * imageScaleSettings.widthRatio;
          scaledHeight = scaledWidth / customAspectRatio;
          
          // 如果高度超出了设定的高度比例，则按高度比例重新计算
          if (scaledHeight > height * imageScaleSettings.heightRatio) {
            scaledHeight = height * imageScaleSettings.heightRatio;
            scaledWidth = scaledHeight * customAspectRatio;
          }
        } 
        // 自动模式或保持原始比例
        else {
          const maxScaledWidth = width * imageScaleSettings.widthRatio;
          const maxScaledHeight = height * imageScaleSettings.heightRatio;
          
          // 保持原始宽高比的同时，确保不超过最大宽度和高度
          if (imgAspectRatio > 1) {
            // 图片更宽
            scaledWidth = maxScaledWidth;
            scaledHeight = scaledWidth / imgAspectRatio;
            
            // 如果高度超出最大高度，则按高度重新计算
            if (scaledHeight > maxScaledHeight) {
              scaledHeight = maxScaledHeight;
              scaledWidth = scaledHeight * imgAspectRatio;
            }
          } else {
            // 图片更高或正方形
            scaledHeight = maxScaledHeight;
            scaledWidth = scaledHeight * imgAspectRatio;
            
            // 如果宽度超出最大宽度，则按宽度重新计算
            if (scaledWidth > maxScaledWidth) {
              scaledWidth = maxScaledWidth;
              scaledHeight = scaledWidth / imgAspectRatio;
            }
          }
        }
        
        // 计算居中位置
        x = (width - scaledWidth) / 2
        y = (height - scaledHeight) / 2
        
        console.log("图片绘制参数:", {
          originalSize: { width: img.width, height: img.height },
          scaledSize: { width: scaledWidth, height: scaledHeight },
          position: { x, y },
          canvasSize: { width, height },
          scaleSettings: imageScaleSettings
        });
        
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

        // 绘制文字
        // 先绘制顶部和底部文字
        const topTexts = textCombination.filter(text => text.position === 'top');
        const bottomTexts = textCombination.filter(text => text.position === 'bottom');
        
        if (topTexts.length > 0) {
          drawTopTexts(ctx, width, topTexts);
        }
        
        if (bottomTexts.length > 0) {
          // 修改调用方式，不再传递CTA按钮相关参数
          drawBottomTexts(ctx, width, height, bottomTexts, y + scaledHeight);
        }
        
        // 最后单独绘制自定义位置文字，确保它们总是显示在最上层
        const customTexts = textCombination.filter(text => text.position === 'custom');
        if (customTexts.length > 0) {
          customTexts.forEach(text => {
            if (text.text && text.text.trim()) {
              // 应用大小比例，确保正确使用size属性
              const fontSize = Math.max(width * 0.04, 20) * (text.size || 1);
              ctx.font = `bold ${fontSize}px ${text.font || 'Arial, sans-serif'}`
              ctx.fillStyle = text.color
              ctx.textAlign = 'center'
              ctx.textBaseline = 'top'
              
              // 明确计算位置
              const xPosition = (text.x !== undefined) ? (text.x / 100) * width : width / 2;
              const yPosition = (text.y !== undefined) ? (text.y / 100) * height : height / 4;
              
              // 添加文字描边效果
              ctx.strokeStyle = '#ffffff'
              ctx.lineWidth = 3
              ctx.strokeText(text.text, xPosition, yPosition)
              ctx.fillText(text.text, xPosition, yPosition)
              
              // 在预览状态下，为拖动中的文字添加视觉指示
              if (text.id && draggedText === text.id.split('_')[0]) {
                ctx.beginPath();
                ctx.arc(xPosition, yPosition + 10, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#3b82f6';
                ctx.fill();
                
                // 添加选中框
                const metrics = ctx.measureText(text.text);
                const textHeight = fontSize; // 使用正确的字体大小
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 3]);
                ctx.strokeRect(
                  xPosition - metrics.width / 2 - 10, 
                  yPosition - 5, 
                  metrics.width + 20, 
                  textHeight + 10
                );
                ctx.setLineDash([]);
              }
            }
          });
        }
        
        // 最后处理CTA按钮
        if (ctaText.trim()) {
          drawCTAButton(ctx, width, height, y + scaledHeight, ctaText, buttonStyle);
        }

        resolve(canvas.toDataURL('image/png'))
      }
      img.src = currentImage
      console.log("使用图片索引:", imgIndex)
    })
  }, [images, buttonStyle, draggedText, draggedButton, imageScaleSettings])

  // 分离CTA按钮绘制函数
  const drawCTAButton = (ctx: CanvasRenderingContext2D, width: number, height: number, imageHeight: number, ctaButtonText: string, ctaButtonStyle: ButtonStyle) => {
    if (!ctaButtonText.trim()) return;
    
    // 应用大小比例
    const sizeMultiplier = ctaButtonStyle.size || 1;
    
    // 设置按钮样式
    const fontSize = Math.max(width * 0.035, 18) * sizeMultiplier;
    ctx.font = `bold ${fontSize}px ${ctaButtonStyle.font}`;
    // 设置字体平滑渲染 - 通过字体设置优化渲染效果
    if (ctx instanceof CanvasRenderingContext2D) {
      // @ts-ignore - Canvas非标准属性
      ctx.fontKerning = 'normal';
      // @ts-ignore - Canvas非标准属性
      ctx.textRendering = 'optimizeLegibility';
    }
    const textMetrics = ctx.measureText(ctaButtonText);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;
    
    const buttonPadding = 12 * sizeMultiplier;
    const buttonWidth = textWidth + (buttonPadding * 2);
    const buttonHeight = textHeight + (buttonPadding * 1.5);
    
    // 计算按钮位置 - 使用自定义位置或默认位置
    let buttonX, buttonY;
    if (ctaButtonStyle.x !== undefined && ctaButtonStyle.y !== undefined) {
      // 使用自定义位置（百分比转为像素）
      buttonX = (ctaButtonStyle.x / 100) * width - (buttonWidth / 2);
      buttonY = (ctaButtonStyle.y / 100) * height - (buttonHeight / 2);
    } else {
      // 使用默认位置
      buttonX = (width - buttonWidth) / 2;
      buttonY = Math.min(imageHeight + 50, height - buttonHeight - 50);
    }
    
    // 确保按钮不会超出画布边界
    buttonX = Math.max(5, Math.min(width - buttonWidth - 5, buttonX));
    buttonY = Math.max(5, Math.min(height - buttonHeight - 5, buttonY));
    
    // 绘制按钮背景（圆角矩形）
    const radiusValue = ctaButtonStyle.borderRadius.replace('px', ''); // 移除 px 单位
    const radius = parseInt(radiusValue) || 8;
    ctx.fillStyle = ctaButtonStyle.backgroundColor;
    drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, radius * sizeMultiplier);
    ctx.fill();
    
    // 绘制按钮文字
    ctx.fillStyle = ctaButtonStyle.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ctaButtonText, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
    
    // 添加拖拽指示（如果正在拖拽）
    if (draggedButton) {
      ctx.strokeStyle = '#f59e0b'; // 使用琥珀色作为CTA按钮的选中指示
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(buttonX - 3, buttonY - 3, buttonWidth + 6, buttonHeight + 6);
      ctx.setLineDash([]);
      
      // 添加拖拽手柄
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(buttonX + buttonWidth / 2, buttonY + buttonHeight + 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 保存按钮的边界信息，用于点击检测
    return { 
      x: buttonX, 
      y: buttonY, 
      width: buttonWidth, 
      height: buttonHeight,
      centerX: buttonX + buttonWidth / 2,
      centerY: buttonY + buttonHeight / 2
    };
  };

  // 生成所有文字组合
  const generateAllCombinations = () => {
    const combinations: Array<{texts: AdText[], ctaText: string}> = []
    
    // 从每个文字组中获取所有选项组合
    const textGroupOptions = adTextGroups.map(group => 
      group.options.filter(opt => opt.trim()).map(option => ({
        id: group.id + '_' + option,
        text: option,
        color: group.color,
        position: group.position,
        font: group.font,
        x: group.x,
        y: group.y,
        size: group.size
      }))
    )
    
    // 获取有效的 CTA 选项
    const ctaOptions = buttonStyle.textOptions.filter(opt => opt.trim())
    
    // 生成笛卡尔积组合
    function cartesianProduct<T>(arrays: T[][]): T[][] {
      if (arrays.length === 0) return [[]]
      if (arrays.length === 1) return arrays[0].map(item => [item])
      
      const result: T[][] = []
      const [first, ...rest] = arrays
      const restProduct = cartesianProduct(rest)
      
      for (const item of first) {
        for (const restCombination of restProduct) {
          result.push([item, ...restCombination])
        }
      }
      return result
    }
    
    // 如果有文字组，生成文字组合
    const textCombinations = textGroupOptions.length > 0 
      ? cartesianProduct(textGroupOptions)
      : [[]] // 空文字组合
    
    // 与 CTA 选项组合
    for (const textCombination of textCombinations) {
      for (const ctaText of ctaOptions) {
        combinations.push({
          texts: textCombination,
          ctaText: ctaText
        })
      }
    }
    
    // 如果没有 CTA 选项但有文字组合，也要生成
    if (ctaOptions.length === 0 && textCombinations.length > 0) {
      for (const textCombination of textCombinations) {
        combinations.push({
          texts: textCombination,
          ctaText: ''
        })
      }
    }
    
    // 新增：如果既没有CTA按钮也没有文字组合，创建一个空的组合
    // 这样用户可以下载只有图片比例设置的广告图片
    if (ctaOptions.length === 0 && textGroupOptions.length === 0) {
      combinations.push({
        texts: [],
        ctaText: ''
      });
    }
    
    return combinations
  }

  const handleGenerateAds = async () => {
    const combinations = generateAllCombinations()
    
    // 修改条件：只在没有上传图片时提示错误
    if (images.length === 0) {
      alert(i18n.language === 'en' 
        ? 'Please upload images' 
        : '请上传图片')
      return
    }

    // 追踪事件 - 生成广告图
    trackEvent('generate_ads', { 
      combinations_count: combinations.length, 
      images_count: images.length,
      platforms_count: getSelectedPlatformCount()
    });

    setIsGenerating(true)

    try {
      const zip = new JSZip()
      
      // 生成不同平台的广告图片
      const platforms = getSelectedPlatforms()

      // 保存当前图片索引，以便生成完成后恢复
      const originalImageIndex = currentImageIndex;
      
      // 为每张上传的图片生成广告
      for (let imgIndex = 0; imgIndex < images.length; imgIndex++) {
        // 不再需要临时切换当前图片索引，直接传递imgIndex参数给generateAdImage
        console.log(`开始处理图片 ${imgIndex + 1}/${images.length}`);
        
        let imageCounter = 1;
        
        for (const platform of platforms) {
          for (const combination of combinations) {
            // 等待一小段时间确保状态更新
            await new Promise(resolve => setTimeout(resolve, 10));
            
            console.log(`生成图片: 产品图索引=${imgIndex}, 平台=${platform.name}, 组合=${imageCounter}`);
            const imageData = await generateAdImage(
              platform.width, 
              platform.height, 
              'png',
              combination.texts,
              combination.ctaText,
              imgIndex
            )
            
            if (imageData) {
              const base64Data = imageData.split(',')[1]
              
              // 提取文字选项和CTA内容，生成更有意义的文件名
              const textOptions = combination.texts.map(t => t.text.trim()).filter(Boolean);
              const textPart = textOptions.length > 0 
                ? textOptions.join('_').substring(0, 30).replace(/[\\/:*?"<>|]/g, '') 
                : i18n.language === 'en' ? "No Text" : "无文字";
                
              const ctaPart = combination.ctaText
                ? combination.ctaText.substring(0, 20).replace(/[\\/:*?"<>|]/g, '')
                : i18n.language === 'en' ? "No CTA" : "无CTA";
                
              const imagePrefix = i18n.language === 'en' ? `Image${imgIndex+1}` : `图片${imgIndex+1}`;
              const fileName = `${imagePrefix}_${platform.name}_${textPart}_${ctaPart}_${imageCounter.toString().padStart(3, '0')}.png`
              zip.file(fileName, base64Data, { base64: true })
            }
            imageCounter++
          }
          imageCounter = 1 // 重置计数器为下一个平台
        }
      }
      
      // 恢复原来的图片索引
      setCurrentImageIndex(Math.min(originalImageIndex, images.length - 1));

      const content = await zip.generateAsync({ type: 'blob' })
      const totalImages = platforms.length * combinations.length * images.length
      const zipFileName = i18n.language === 'en' 
        ? `advertisement_images_${totalImages}_variants.zip`
        : `广告图片_${totalImages}_变体.zip`;
      saveAs(content, zipFileName)
      
      // 追踪事件 - 导出ZIP
      trackEvent('export_zip', { 
        total_images: totalImages,
        platforms_count: platforms.length,
        combinations_count: combinations.length
      });
      
      console.log(i18n.language === 'en' 
        ? `Generated ${totalImages} images (${platforms.length} platforms × ${combinations.length} text combinations × ${images.length} product images)`
        : `生成了 ${totalImages} 张图片 (${platforms.length} 个平台 × ${combinations.length} 个文字组合 × ${images.length} 张产品图片)`)
    } catch (error) {
      console.error(i18n.language === 'en' ? 'Error generating ad images:' : '生成广告图片时出错:', error)
      alert(i18n.language === 'en' ? 'An error occurred while generating images, please try again' : '生成图片时出现错误，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 实时预览功能 - 简化更新逻辑，恢复更稳定的渲染
  useEffect(() => {
    // 如果不是拖动中就更新预览
    if (!draggedText && !draggedButton && images.length > 0 && canvasRef.current) {
      const currentPlatform = getCurrentPreviewPlatform();
      generateAdImage(currentPlatform.width, currentPlatform.height, 'png', previewTexts, previewCtaText, currentImageIndex)
        .catch(err => console.error('预览更新失败:', err));
    }
  }, [images, currentImageIndex, adTextGroups, buttonStyle, generateAdImage, draggedText, draggedButton, previewPlatform, customSizes, previewCtaIndex, previewTextIndexes, previewTexts]);

  // 确保在拖动结束后正确更新一次，保持当前选择的文字选项
  useEffect(() => {
    if ((draggedText === null && debounceUpdate !== null) || 
        (draggedButton === false && debounceUpdate !== null)) {
      // 重置位置状态
      setDebounceUpdate(null);
      
      // 延迟更新以确保状态已完全更新
      setTimeout(() => {
        if (images.length > 0 && canvasRef.current) {
          // 刷新预览 - 直接调用预览逻辑
          const currentPlatform = getCurrentPreviewPlatform();
          generateAdImage(currentPlatform.width, currentPlatform.height, 'png', previewTexts, previewCtaText, currentImageIndex)
            .catch(err => console.error('拖动后预览更新失败:', err));
        }
      }, 50);
    }
  }, [draggedText, draggedButton, debounceUpdate, images, currentImageIndex, generateAdImage, getCurrentPreviewPlatform, previewTexts, previewCtaText]);

  // 更新handleCanvasMouseDown以支持按钮拖拽
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !canvasContainerRef.current || images.length === 0) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100); // 转为百分比
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100); // 转为百分比
    
    console.log("鼠标按下:", x, y);
    
    // 首先检查是否点击了CTA按钮
    const combinations = generateAllCombinations();
    if (combinations.length > 0) {
      const firstCombination = combinations[0];
      const ctaText = firstCombination.ctaText;
      
      if (ctaText && ctaText.trim()) {
        // 创建临时canvas计算按钮位置
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 800;
        tempCanvas.height = 600;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          const img = new Image();
          img.src = images[currentImageIndex];
          
          // 计算图片位置（简化版，只计算高度）
          const imageHeight = img.height > 0 ? 300 : 0; // 估计值
          
          // 获取按钮边界
          const buttonBounds = drawCTAButton(
            tempCtx, 
            tempCanvas.width, 
            tempCanvas.height, 
            imageHeight, 
            ctaText, 
            buttonStyle
          );
          
          // 检查点击是否在按钮范围内
          if (buttonBounds) {
            const clickX = (x / 100) * tempCanvas.width;
            const clickY = (y / 100) * tempCanvas.height;
            
            if (
              clickX >= buttonBounds.x && 
              clickX <= buttonBounds.x + buttonBounds.width &&
              clickY >= buttonBounds.y && 
              clickY <= buttonBounds.y + buttonBounds.height
            ) {
              console.log("开始拖动CTA按钮");
              setDraggedButton(true);
              
              // 防止进一步处理（不要同时拖动文字）
              e.stopPropagation();
              e.preventDefault();
              return;
            }
          }
        }
      }
    }
    
    // 如果没点击按钮，检查是否点击了自定义位置文字
    console.log("当前自定义文字组:", adTextGroups.filter(g => g.position === 'custom'));
    
    const customTexts = adTextGroups.filter(group => group.position === 'custom');
    if (customTexts.length > 0 && images.length > 0) {
      let closestId: string | null = null;
      let minDist = 15; // 最大选择距离（百分比单位）
      
      for (const group of customTexts) {
        const tx = group.x || 50;
        const ty = group.y || 50;
        const dist = Math.sqrt(Math.pow(x - tx, 2) + Math.pow(y - ty, 2));
        console.log(`检查文字组 ${group.id}: 距离=${dist}, 位置=(${tx}, ${ty})`);
        
        if (dist < minDist) {
          minDist = dist;
          closestId = group.id;
          console.log(`找到最近的文字组: ${closestId}, 距离=${minDist}`);
        }
      }
      
      if (closestId) {
        console.log(`开始拖动文字组: ${closestId}`);
        setDraggedText(closestId);
        // 添加拖动样式
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'grabbing';
        }
        
        // 阻止事件冒泡和默认行为
        e.stopPropagation();
        e.preventDefault();
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !canvasContainerRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
    
    // 处理按钮拖拽
    if (draggedButton) {
      console.log(`拖动CTA按钮: 位置=(${x}, ${y})`);
      
      // 立即更新按钮位置
      setButtonStyle(prev => ({
        ...prev,
        x: x,
        y: y
      }));
      
      // 记录当前位置用于拖动结束时使用
      setDebounceUpdate({x, y});
      
      // 阻止事件冒泡和默认行为
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    
    // 处理文字拖拽 - 改为直接更新状态，与按钮拖拽保持一致
    if (draggedText) {
      // 显示拖动信息
      console.log(`拖动中: ID=${draggedText}, 位置=(${x}, ${y})`);
      
      // 记录当前位置
      setDebounceUpdate({x, y});
      
      // 直接更新文字位置 - 不使用防抖，提高流畅度
      setAdTextGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === draggedText ? { ...group, x, y } : group
        )
      );
      
      // 阻止事件冒泡和默认行为
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 处理按钮拖拽完成
    if (draggedButton) {
      console.log(`CTA按钮拖动结束`);
      
      // 获取最终位置并更新按钮样式 - 其实在移动中已经更新，这里可以确保最终位置正确
      if (canvasRef.current && debounceUpdate) {
        const {x, y} = debounceUpdate;
        console.log(`CTA按钮最终位置已更新: 位置=(${x}, ${y})`);
      }
      
      setDraggedButton(false);
      
      // 阻止事件冒泡和默认行为
      e.stopPropagation();
      e.preventDefault();
    }
    
    // 处理文字拖拽完成
    if (draggedText) {
      console.log(`拖动结束: ${draggedText}`);
      
      // 获取最终位置
      if (canvasRef.current && debounceUpdate) {
        const {x, y} = debounceUpdate;
        
        // 立即应用最终位置
        setAdTextGroups(prevGroups => 
          prevGroups.map(group => 
            group.id === draggedText ? { ...group, x, y } : group
          )
        );
        
        console.log(`文字最终位置已更新: ID=${draggedText}, 位置=(${x}, ${y})`);
      }
      
      // 重置拖动状态
      setDraggedText(null);
      
      // 阻止事件冒泡和默认行为
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'move';
    }
  };

  const handleCanvasMouseOver = () => {
    if (canvasRef.current && adTextGroups.some(group => group.position === 'custom')) {
      canvasRef.current.style.cursor = 'move';
    }
  };

  // 手动刷新预览功能 - 使用当前选中的文字选项
  const refreshPreview = useCallback(() => {
    if (images.length === 0 || !canvasRef.current) return;
      
    try {
      const currentPlatform = getCurrentPreviewPlatform();
      console.log("手动刷新预览...");
      // 使用当前预览文字，确保选项保持一致
      generateAdImage(currentPlatform.width, currentPlatform.height, 'png', previewTexts, previewCtaText)
        .catch(err => console.error('预览刷新失败:', err));
    } catch (error) {
      console.error('手动刷新预览失败:', error);
    }
  }, [images, currentImageIndex, canvasRef, generateAdImage, getCurrentPreviewPlatform, previewPlatform, customSizes, previewCtaIndex, previewTextIndexes, previewTexts, previewCtaText]);

  // 1. 在adTextGroups变化时自动同步previewTextIndexes长度，并确保每组索引不超过当前选项数-1
  useEffect(() => {
    setPreviewTextIndexes(prev =>
      adTextGroups.map((group, idx) => {
        const options = group.options.filter(opt => opt.trim());
        const maxIdx = options.length - 1;
        const safeIdx = Math.max(0, Math.min((prev && prev[idx]) ?? 0, maxIdx));
        return safeIdx;
      })
    );
  }, [adTextGroups]);

  // 处理图片比例模式变更
  const handleImageScaleModeChange = (mode: 'auto' | 'custom') => {
    setImageScaleSettings(prev => ({
      ...prev,
      mode
    }));
  };

  // 处理宽度比例变更
  const handleWidthRatioChange = (value: number) => {
    setImageScaleSettings(prev => ({
      ...prev,
      widthRatio: Math.max(0.2, Math.min(1, value))
    }));
  };

  // 处理高度比例变更
  const handleHeightRatioChange = (value: number) => {
    setImageScaleSettings(prev => ({
      ...prev,
      heightRatio: Math.max(0.2, Math.min(1, value))
    }));
  };

  // 处理宽高比变更
  const handleAspectRatioChange = (value: string) => {
    setImageScaleSettings(prev => ({
      ...prev,
      aspectRatio: value
    }));
  };
  
  // 重置图片比例设置
  const handleResetImageScale = () => {
    setImageScaleSettings({
      mode: 'auto',
      widthRatio: 0.9,
      heightRatio: 0.7,
      aspectRatio: 'auto',
      stretchMode: 'maintain'
    });
  };

  // 进入页面时记录页面浏览
  useEffect(() => {
    // 追踪页面浏览 - 生成器页
    trackEvent('pageview');
    
    // 记录会话开始时间
    const sessionStartTime = Date.now();
    
    // 组件卸载时计算会话时长
    return () => {
      const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
      trackEvent('session_duration', { seconds: sessionDuration });
    };
  }, []);

  // 修改使用模板函数添加事件跟踪
  const applyButtonTemplate = (template: ButtonStyle) => {
    setButtonStyle({
      ...template,
      x: buttonStyle.x,
      y: buttonStyle.y
    });
    
    // 追踪事件 - 使用模板
    trackEvent('use_template', { 
      // 不使用不存在的name属性，而是使用文字选项作为模板标识
      template_id: template.textOptions[0] || 'custom_template'
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* 左侧控制面板 */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* 图片上传 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{t('Upload Product Images')}</h2>
            <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-transparent">
              {images.length > 0 ? (
                <div className="space-y-2">
                  <div className="relative mx-auto max-w-sm">
                    {/* 左右箭头导航按钮 */}
                    {images.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevImage();
                          }}
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center z-10 hover:bg-opacity-70 transition-opacity"
                          aria-label={t('Previous image')}
                        >
                          <span className="text-xl">&lsaquo;</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextImage();
                          }}
                          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center z-10 hover:bg-opacity-70 transition-opacity"
                          aria-label={t('Next image')}
                        >
                          <span className="text-xl">&rsaquo;</span>
                        </button>
                      </>
                    )}
                    
                    <img 
                      src={images[currentImageIndex]} 
                      alt={t('Uploaded')} 
                      className="max-h-32 mx-auto rounded cursor-pointer" 
                      onClick={() => fileInputRef.current?.click()}
                    />
                    
                    <span className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-tl rounded-br">
                      {currentImageIndex + 1}/{images.length}
                    </span>
                  </div>
                  
                  {/* 底部指示器 */}
                  {images.length > 1 && (
                    <div className="flex justify-center gap-1 mt-2">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(idx);
                          }}
                          className={`w-2 h-2 rounded-full ${
                            currentImageIndex === idx ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                          aria-label={t('Switch to image') + ` ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{t('Uploaded')} {images.length}/5 {t('Images')}</span>
                    <div className="flex space-x-2">
                      {/* 添加继续上传按钮 */}
                      {images.length < 5 && (
                        <button 
                          className="text-blue-500 hover:text-blue-700 underline"
                          onClick={() => {
                            if (fileInputRef.current) {
                              // 设置为追加模式
                              fileInputRef.current.onchange = (e) => {
                                // 修复类型转换错误
                                if (e && e.target) {
                                  handleImageUpload(e as unknown as React.ChangeEvent<HTMLInputElement>, true);
                                }
                              };
                              fileInputRef.current.click();
                            }
                          }}
                        >
                          {t('Add More')}
                        </button>
                      )}
                      <button 
                        className="text-blue-500 hover:text-blue-700 underline"
                        onClick={() => {
                          if (fileInputRef.current) {
                            // 设置为替换模式
                            fileInputRef.current.onchange = (e) => {
                              // 修复类型转换错误
                              if (e && e.target) {
                                handleImageUpload(e as unknown as React.ChangeEvent<HTMLInputElement>, false);
                              }
                            };
                            fileInputRef.current.click();
                          }
                        }}
                      >
                        {t('Replace All')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-blue-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium">{t('Click to upload images')}</p>
                  <p className="text-gray-500 text-sm mt-1">{t('Supports JPG, PNG (Max 5 Images)')}</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e, false)}
              />
            </div>
          </div>
          
          {/* 广告文字设置 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('Ad Text Groups')}</h2>
              <button
                onClick={addAdTextGroup}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t('Add Text Group')}
              </button>
            </div>
            
            <div className="space-y-6">
              {adTextGroups.map((group) => (
                <div key={group.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <label htmlFor={`position-${group.id}`} className="text-sm font-medium text-gray-700">{t('位置:')}</label>
                          <select
                            id={`position-${group.id}`}
                            value={group.position}
                            onChange={(e) => updateAdTextGroup(group.id, { position: e.target.value as 'top' | 'bottom' | 'custom' })}
                            className="border rounded px-2 py-1 text-sm text-gray-800"
                          >
                            <option value="top">{t('Top')}</option>
                            <option value="bottom">{t('Bottom')}</option>
                            <option value="custom">{t('Custom')}</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">{t('颜色:')}</span>
                          <button
                            type="button"
                            className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer shadow-sm"
                            style={{ backgroundColor: group.color }}
                            onClick={() => setShowColorPicker(showColorPicker === group.id ? null : group.id)}
                            aria-label={t('选择文字颜色')}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label htmlFor={`font-${group.id}`} className="text-sm font-medium text-gray-700">{t('字体:')}</label>
                          <select
                            id={`font-${group.id}`}
                            value={group.font}
                            onChange={(e) => updateAdTextGroup(group.id, { font: e.target.value })}
                            className="border rounded px-2 py-1 text-sm text-gray-800"
                          >
                            {/* 基础字体 */}
                            <optgroup label={t('基础字体')}>
                              <option value="Arial, sans-serif">Arial</option>
                              <option value="'Times New Roman', serif">Times New Roman</option>
                              <option value="'Courier New', monospace">Courier New</option>
                              <option value="Georgia, serif">Georgia</option>
                              <option value="Verdana, sans-serif">Verdana</option>
                              <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
                              <option value="'SimSun', serif">宋体</option>
                            </optgroup>
                            
                            {/* 现代无衬线字体 */}
                            <optgroup label={t('现代无衬线字体')}>
                              <option value="'Montserrat', sans-serif">Montserrat</option>
                              <option value="'Poppins', sans-serif">Poppins</option>
                              <option value="'Roboto', sans-serif">Roboto</option>
                              <option value="'Open Sans', sans-serif">Open Sans</option>
                              <option value="'Lato', sans-serif">Lato</option>
                              <option value="'Nunito', sans-serif">Nunito</option>
                              <option value="'Raleway', sans-serif">Raleway</option>
                              <option value="'Inter', sans-serif">Inter</option>
                              <option value="'DM Sans', sans-serif">DM Sans</option>
                              <option value="'Work Sans', sans-serif">Work Sans</option>
                            </optgroup>
                            
                            {/* 品牌风格字体 */}
                            <optgroup label={t('品牌风格字体')}>
                              <option value="'Oswald', sans-serif">Oswald</option>
                              <option value="'Bebas Neue', sans-serif">Bebas Neue</option>
                              <option value="'Playfair Display', serif">Playfair Display</option>
                              <option value="'Merriweather', serif">Merriweather</option>
                              <option value="'Archivo Black', sans-serif">Archivo Black</option>
                              <option value="'Fjalla One', sans-serif">Fjalla One</option>
                              <option value="'Anton', sans-serif">Anton</option>
                            </optgroup>
                            
                            {/* 创意字体 */}
                            <optgroup label={t('创意字体')}>
                              <option value="'Pacifico', cursive">Pacifico</option>
                              <option value="'Caveat', cursive">Caveat</option>
                              <option value="'Comfortaa', cursive">Comfortaa</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>
                      
                      {group.position === 'custom' && (
                        <div className="flex items-center space-x-4 mt-3 bg-blue-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <label htmlFor={`x-${group.id}`} className="block text-sm font-medium text-gray-700 mb-1">X {t('Position')}: {Math.round(group.x || 50)}%</label>
                            <input
                              id={`x-${group.id}`}
                              type="range"
                              min="0"
                              max="100"
                              value={group.x || 50}
                              onChange={(e) => updateAdTextGroup(group.id, { x: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <label htmlFor={`y-${group.id}`} className="block text-sm font-medium text-gray-700 mb-1">Y {t('Position')}: {Math.round(group.y || 50)}%</label>
                            <input
                              id={`y-${group.id}`}
                              type="range"
                              min="0"
                              max="100"
                              value={group.y || 50}
                              onChange={(e) => updateAdTextGroup(group.id, { y: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* 添加文字大小控制 - 不限于自定义位置 */}
                      <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                        <label htmlFor={`size-${group.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          {t('文字大小:')} {Math.round(((group.size === undefined ? 1 : group.size) * 100))}%
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            id={`size-${group.id}`}
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={group.size === undefined ? 1 : group.size}
                            onChange={(e) => {
                              const newSize = parseFloat(e.target.value);
                              console.log(`设置文字组 ${group.id} 大小为: ${newSize}`);
                              updateAdTextGroup(group.id, { size: newSize });
                            }}
                            className="flex-1"
                          />
                          <button
                            onClick={() => {
                              updateAdTextGroup(group.id, { size: 1 });
                              console.log(`重置文字组 ${group.id} 大小为默认值`);
                            }}
                            className="bg-gray-200 hover:bg-gray-300 text-xs px-2 py-1 rounded"
                          >
                            {t('Reset')}
                          </button>
                        </div>
                      </div>
                      
                      {/* 文字选项列表 */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-gray-700">{t('Text Options')}:</label>
                          <button
                            onClick={() => addTextOption(group.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            {t('Add Option')}
                          </button>
                        </div>
                        
                        {group.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder={`${t('Option')} ${index + 1}`}
                              value={option}
                              onChange={(e) => updateTextOption(group.id, index, e.target.value)}
                              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-800 caret-blue-500"
                            />
                            {group.options.length > 1 && (
                              <button
                                onClick={() => removeTextOption(group.id, index)}
                                className="text-red-500 hover:text-red-700 text-sm px-2"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {/* 添加中文字体支持提示 */}
                        {group.options.some(option => containsChinese(option)) && !isSupportChinese(group.font || '') && (
                          <div className="mt-2 text-amber-600 text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {t('当前字体可能不支持中文显示，建议选择带"✓"标记的字体')}
                          </div>
                        )}
                      </div>
                      
                      {showColorPicker === group.id && (
                        <div className="relative">
                          <div className="absolute z-10 bg-white border rounded-lg shadow-lg p-4">
                            <HexColorPicker
                              color={group.color}
                              onChange={(color) => updateAdTextGroup(group.id, { color })}
                            />
                            <button
                              onClick={() => setShowColorPicker(null)}
                              className="mt-2 w-full bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
                            >
                              {t('Done')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => removeAdTextGroup(group.id)}
                      className="ml-2 text-red-500 hover:text-red-700 font-bold text-lg"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 按钮样式设置 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{t('CTA Button Style')}</h2>
            
            {/* 添加模板选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">{t('Button Templates')}</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value=""
                  onChange={(e) => {
                    const templateIndex = parseInt(e.target.value);
                    if (!isNaN(templateIndex) && buttonTemplates[templateIndex]) {
                      // 获取按钮模板副本
                      const buttonTemplateCopy = { ...buttonTemplates[templateIndex] };
                      
                      // 使用工具函数过滤文本选项
                      const filteredTextOptions = filterTextOptionsByLanguage(buttonTemplateCopy.textOptions);
                      
                      setButtonStyle({
                        ...buttonTemplateCopy,
                        textOptions: filteredTextOptions,
                        x: buttonStyle.x,
                        y: buttonStyle.y
                      });
                    }
                    e.target.value = ""; // 重置选择
                  }}
                  className="border rounded px-3 py-2 text-gray-800 mb-2"
                >
                  <option value="" disabled>{i18n.language === 'en' ? 'Select Button Template' : '选择按钮模板'}</option>
                  {buttonTemplates.map((template, index) => (
                    <option key={index} value={index}>
                      {i18n.language === 'en' ? `Button Template ${index + 1}` : `按钮模板 ${index + 1}`}
                    </option>
                  ))}
                </select>
                
                <select
                  value=""
                  onChange={(e) => {
                    const templateIndex = parseInt(e.target.value);
                    if (!isNaN(templateIndex) && combinedTemplates[templateIndex]) {
                      // 应用组合模板
                      const template = combinedTemplates[templateIndex];
                      
                      // 获取按钮样式并根据当前语言过滤文本选项
                      const buttonStyleCopy = { ...template.buttonStyle };
                      
                      // 使用工具函数过滤文本选项
                      const filteredTextOptions = filterTextOptionsByLanguage(buttonStyleCopy.textOptions);
                      
                      // 确保至少有一个文本选项
                      if (filteredTextOptions.length === 0) {
                        filteredTextOptions.push(i18n.language === 'en' ? 'Explore' : '立即探索');
                      }
                      
                      // 应用按钮样式
                      setButtonStyle({
                        ...buttonStyleCopy,
                        textOptions: filteredTextOptions,
                        x: buttonStyle.x,
                        y: buttonStyle.y
                      });
                      
                      // 应用文字样式 - 创建新的文字组
                      const newGroups = template.textStyles.map((textStyle, idx) => {
                        // 根据当前语言环境过滤文字
                        let text = textStyle.text;
                        const isEnglish = i18n.language === 'en';
                        
                        // 如果是英文环境但文字是中文，或是中文环境但文字是英文，则转换
                        if (isEnglish && containsChinese(text) && !containsEnglish(text)) {
                          // 为中文文本提供英文替代文本
                          const englishAlternatives: {[key: string]: string} = {
                            '精选好物': 'Selected Products',
                            '限时特惠': 'Limited Time Offer',
                            '全新系列': 'New Collection',
                            '春季新品': 'Spring New Arrivals',
                            '尊享系列': 'Premium Collection',
                            '智能科技': 'Smart Technology',
                            '焕新美肌': 'Renewed Skin',
                            '舒适家居': 'Comfortable Home',
                            '美食臻选': 'Gourmet Selection',
                            '探索世界': 'Explore the World',
                            '专业运动': 'Professional Sports',
                            '快乐童年': 'Happy Childhood',
                            '阅读之美': 'Beauty of Reading',
                            '音乐盛宴': 'Music Feast',
                            '艺术臻品': 'Art Collection',
                            '健康生活': 'Healthy Living',
                            '奢华体验': 'Luxury Experience',
                            '品质保证 · 限时优惠': 'Quality Guaranteed · Limited Offer',
                            '折扣高达50%': 'Up to 50% Off',
                            '舒适自然 · 品质生活': 'Comfort & Quality',
                            '匠心工艺 · 品质非凡': 'Exquisite Craftsmanship',
                            '改变生活 · 引领未来': 'Change Life · Lead Future',
                            '自然呵护 · 绽放光彩': 'Natural Care · Shine Bright',
                            '品质生活 · 从家开始': 'Quality Life · Starts at Home',
                            '新鲜食材 · 健康生活': 'Fresh Food · Healthy Life',
                            '开启旅程 · 发现未知': 'Start Journey · Discover Unknown',
                            '突破极限 · 挑战自我': 'Break Limits · Challenge Yourself',
                            '创新体验 · 品质生活': 'Innovative Experience',
                            '安全呵护 · 健康成长': 'Safe Care · Healthy Growth',
                            '知识探索 · 心灵成长': 'Knowledge · Mind Growth',
                            '沉浸体验 · 畅享音乐': 'Immersive Experience',
                            '独特创意 · 艺术生活': 'Creative Art Life',
                            '自然呵护 · 品质保障': 'Natural Care · Quality',
                            '尊贵品质 · 非凡体验': 'Premium Quality'
                          };
                          text = englishAlternatives[text] || text;
                        } else if (!isEnglish && containsEnglish(text) && !containsChinese(text)) {
                          // 为英文文本提供中文替代文本
                          const chineseAlternatives: {[key: string]: string} = {
                            'NEW COLLECTION': '新品系列',
                            'Premium Quality': '优质保证',
                            'FASHION': '时尚潮流',
                            'NEW COLLECTION 2024': '2024新品系列'
                          };
                          text = chineseAlternatives[text] || text;
                        }
                        
                        // 将所有文字组都设置为自定义位置，以便可以拖动
                        let position: 'top' | 'bottom' | 'custom' = 'custom';
                        let x = textStyle.x;
                        let y = textStyle.y;
                        
                        // 如果原来是top或bottom位置，提供默认的x,y坐标
                        if (textStyle.position === 'top') {
                          x = x || 50; // 居中
                          y = y || 25; // 顶部位置
                        } else if (textStyle.position === 'bottom') {
                          x = x || 50; // 居中
                          y = y || 90; // 底部位置
                        } else {
                          x = x || 50; // 默认居中
                          y = y || 50; // 默认居中
                        }
                        
                        return {
                          id: `template_${templateIndex}_${idx}_${Date.now()}`,
                          options: [text],
                          color: textStyle.color,
                          position: position, // 设为自定义位置以支持拖动
                          font: textStyle.font,
                          x: x,
                          y: y,
                          size: textStyle.size
                        };
                      });
                      
                      // 添加新的文字组
                      setAdTextGroups(newGroups);
                      
                      // 重置预览索引
                      setPreviewCtaIndex(0);
                      setPreviewTextIndexes([]);
                    }
                    e.target.value = ""; // 重置选择
                  }}
                  className="border rounded px-3 py-2 text-gray-800 mb-2"
                >
                  <option value="" disabled>{i18n.language === 'en' ? 'Select Template Style' : '选择组合模板'}</option>
                  {combinedTemplates.map((template, index) => (
                    <option key={index} value={index}>
                      {i18n.language === 'en' ? getEnglishTemplateName(template.name) : template.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* 显示当前模板预览 */}
              <div className="flex items-center justify-center p-3 border rounded-lg bg-gray-50 mb-2">
                <div 
                  className="px-4 py-2 text-center"
                  style={{
                    backgroundColor: buttonStyle.backgroundColor, 
                    color: buttonStyle.textColor,
                    borderRadius: buttonStyle.borderRadius,
                    fontFamily: buttonStyle.font,
                    fontSize: '16px',
                    fontWeight: 'bold',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale'
                  }}
                >
                  {buttonStyle.textOptions[0] || t('Button Text')}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* CTA 文字选项 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">{t('Button Text Options')}</label>
                  <button
                    onClick={addCtaOption}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    {t('Add Option')}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {buttonStyle.textOptions.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={`${t('Option')} ${index + 1}`}
                        value={option}
                        onChange={(e) => updateCtaOption(index, e.target.value)}
                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-800 caret-blue-500"
                      />
                      {buttonStyle.textOptions.length > 1 && (
                        <button
                          onClick={() => removeCtaOption(index)}
                          className="text-red-500 hover:text-red-700 text-sm px-2"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* 添加中文字体支持提示 */}
                  {buttonStyle.textOptions.some(option => containsChinese(option)) && !isSupportChinese(buttonStyle.font || '') && (
                    <div className="mt-2 text-amber-600 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {t('当前字体可能不支持中文显示，建议选择带"✓"标记的字体')}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <span className="block text-sm font-medium mb-2 text-gray-700">{t('Background Color')}</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer shadow-sm"
                    style={{ backgroundColor: buttonStyle.backgroundColor }}
                    onClick={() => setShowColorPicker(showColorPicker === 'button-bg' ? null : 'button-bg')}
                    aria-label={t('Select Button Background Color')}
                  />
                  <input
                    type="text"
                    value={buttonStyle.backgroundColor}
                    onChange={(e) => setButtonStyle({...buttonStyle, backgroundColor: e.target.value})}
                    className="flex-1 border rounded px-3 py-2 text-sm"
                  />
                </div>
                
                {showColorPicker === 'button-bg' && (
                  <div className="mt-2 bg-white border rounded-lg shadow-lg p-4 inline-block">
                    <HexColorPicker
                      color={buttonStyle.backgroundColor}
                      onChange={(color) => setButtonStyle({...buttonStyle, backgroundColor: color})}
                    />
                    <button
                      onClick={() => setShowColorPicker(null)}
                      className="mt-2 w-full bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
                    >
                      {t('Done')}
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <span className="block text-sm font-medium mb-2 text-gray-700">{t('Text Color')}</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer shadow-sm"
                    style={{ backgroundColor: buttonStyle.textColor }}
                    onClick={() => setShowColorPicker(showColorPicker === 'button-text' ? null : 'button-text')}
                    aria-label={t('Select Button Text Color')}
                  />
                  <input
                    type="text"
                    value={buttonStyle.textColor}
                    onChange={(e) => setButtonStyle({...buttonStyle, textColor: e.target.value})}
                    className="flex-1 border rounded px-3 py-2 text-sm"
                  />
                </div>
                
                {showColorPicker === 'button-text' && (
                  <div className="mt-2 bg-white border rounded-lg shadow-lg p-4 inline-block">
                    <HexColorPicker
                      color={buttonStyle.textColor}
                      onChange={(color) => setButtonStyle({...buttonStyle, textColor: color})}
                    />
                    <button
                      onClick={() => setShowColorPicker(null)}
                      className="mt-2 w-full bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
                    >
                      {t('Done')}
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="button-font-select" className="block text-sm font-medium mb-2 text-gray-700">{t('Button Font')}</label>
                <select
                  id="button-font-select"
                  value={buttonStyle.font}
                  onChange={(e) => setButtonStyle({...buttonStyle, font: e.target.value})}
                  className="w-full border rounded px-3 py-2 text-gray-800"
                >
                  {/* 基础字体 */}
                  <optgroup label={t('基础字体') + ' (支持中文)'}>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Courier New', monospace">Courier New</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                    <option value="'Microsoft YaHei', sans-serif">微软雅黑 ✓</option>
                    <option value="'SimSun', serif">宋体 ✓</option>
                    <option value="'Noto Sans SC', sans-serif">Noto Sans SC ✓</option>
                    <option value="'Noto Sans TC', sans-serif">Noto Sans TC ✓</option>
                    <option value="'Noto Serif SC', serif">Noto Serif SC ✓</option>
                    <option value="'Noto Serif TC', serif">Noto Serif TC ✓</option>
                  </optgroup>
                  
                  {/* 现代无衬线字体 */}
                  <optgroup label={t('现代无衬线字体')}>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                    <option value="'Poppins', sans-serif">Poppins</option>
                    <option value="'Roboto', sans-serif">Roboto</option>
                    <option value="'Open Sans', sans-serif">Open Sans</option>
                    <option value="'Lato', sans-serif">Lato</option>
                    <option value="'Nunito', sans-serif">Nunito</option>
                    <option value="'Raleway', sans-serif">Raleway</option>
                    <option value="'Inter', sans-serif">Inter</option>
                    <option value="'DM Sans', sans-serif">DM Sans</option>
                    <option value="'Work Sans', sans-serif">Work Sans</option>
                    <option value="'Noto Sans SC', 'Montserrat', sans-serif">Noto Sans SC + Montserrat ✓</option>
                  </optgroup>
                  
                  {/* 品牌风格字体 */}
                  <optgroup label={t('品牌风格字体')}>
                    <option value="'Oswald', sans-serif">Oswald</option>
                    <option value="'Bebas Neue', sans-serif">Bebas Neue</option>
                    <option value="'Playfair Display', serif">Playfair Display</option>
                    <option value="'Merriweather', serif">Merriweather</option>
                    <option value="'Archivo Black', sans-serif">Archivo Black</option>
                    <option value="'Fjalla One', sans-serif">Fjalla One</option>
                    <option value="'Anton', sans-serif">Anton</option>
                    <option value="'Zen Old Mincho', serif">Zen Old Mincho ✓</option>
                    <option value="'Zen Maru Gothic', sans-serif">Zen Maru Gothic ✓</option>
                  </optgroup>
                  
                  {/* 创意字体 */}
                  <optgroup label={t('创意字体')}>
                    <option value="'Pacifico', cursive">Pacifico</option>
                    <option value="'Caveat', cursive">Caveat</option>
                    <option value="'Comfortaa', cursive">Comfortaa</option>
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label htmlFor="border-radius-select" className="block text-sm font-medium mb-2 text-gray-700">{t('Border Radius')}</label>
                <select
                  id="border-radius-select"
                  value={buttonStyle.borderRadius}
                  onChange={(e) => setButtonStyle({...buttonStyle, borderRadius: e.target.value})}
                  className="w-full border rounded px-3 py-2 text-gray-800"
                >
                  <option value="0px">{t('No Radius')}</option>
                  <option value="4px">{t('Small Radius')}</option>
                  <option value="8px">{t('Medium Radius')}</option>
                  <option value="16px">{t('Large Radius')}</option>
                  <option value="50px">{t('Pill Shape')}</option>
                </select>
              </div>

              {/* 添加按钮位置控制 */}
              <div className="bg-amber-50 p-3 rounded-lg">
                <h3 className="text-md font-medium mb-3 text-gray-800">{t('Button Position and Size')} <span className="text-amber-600 text-sm">({t('Drag in Preview')})</span></h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label htmlFor="button-x" className="block text-sm font-medium mb-1 text-gray-700">
                      {t('X Position')}: {Math.round(buttonStyle.x !== undefined ? buttonStyle.x : 50)}%
                    </label>
                    <input
                      id="button-x"
                      type="range"
                      min="0"
                      max="100"
                      value={buttonStyle.x !== undefined ? buttonStyle.x : 50}
                      onChange={(e) => setButtonStyle({...buttonStyle, x: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="button-y" className="block text-sm font-medium mb-1 text-gray-700">
                      {t('Y Position')}: {Math.round(buttonStyle.y !== undefined ? buttonStyle.y : 75)}%
                    </label>
                    <input
                      id="button-y"
                      type="range"
                      min="0"
                      max="100"
                      value={buttonStyle.y !== undefined ? buttonStyle.y : 75}
                      onChange={(e) => setButtonStyle({...buttonStyle, y: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="button-size" className="block text-sm font-medium mb-1 text-gray-700">
                    {t('Button Size')}: {Math.round(((buttonStyle.size === undefined ? 1 : buttonStyle.size) * 100))}%
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="button-size"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={buttonStyle.size === undefined ? 1 : buttonStyle.size}
                      onChange={(e) => {
                        const newSize = parseFloat(e.target.value);
                        console.log(`设置按钮大小为: ${newSize}`);
                        setButtonStyle({...buttonStyle, size: newSize});
                      }}
                      className="flex-1"
                    />
                    <button
                      onClick={() => {
                        setButtonStyle({...buttonStyle, size: 1});
                        console.log(`重置按钮大小为默认值`);
                      }}
                      className="bg-amber-200 hover:bg-amber-300 text-xs px-2 py-1 rounded"
                    >
                      {t('Reset')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 图片比例设置模块 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{t('Image Scale Settings')}</h2>
            
            {/* 模式选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('Scale Mode')}</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-blue-600"
                    checked={imageScaleSettings.mode === 'auto'}
                    onChange={() => handleImageScaleModeChange('auto')}
                  />
                  <span className="ml-2 text-gray-700">{t('Auto (Keep Original Ratio)')}</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-blue-600"
                    checked={imageScaleSettings.mode === 'custom'}
                    onChange={() => handleImageScaleModeChange('custom')}
                  />
                  <span className="ml-2 text-gray-700">{t('Custom')}</span>
                </label>
              </div>
            </div>
            
            {/* 宽度比例滑块 */}
            <div className="mb-4">
              <label htmlFor="width-ratio" className="block text-sm font-medium text-gray-700 mb-1">
                {t('Width Ratio')}: {Math.round(imageScaleSettings.widthRatio * 100)}%
              </label>
              <input
                id="width-ratio"
                type="range"
                min="20"
                max="100"
                value={imageScaleSettings.widthRatio * 100}
                onChange={(e) => handleWidthRatioChange(parseInt(e.target.value) / 100)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">{t('Controls how much of the canvas width the image occupies')}</p>
            </div>
            
            {/* 高度比例滑块 */}
            <div className="mb-4">
              <label htmlFor="height-ratio" className="block text-sm font-medium text-gray-700 mb-1">
                {t('Height Ratio')}: {Math.round(imageScaleSettings.heightRatio * 100)}%
              </label>
              <input
                id="height-ratio"
                type="range"
                min="20"
                max="100"
                value={imageScaleSettings.heightRatio * 100}
                onChange={(e) => handleHeightRatioChange(parseInt(e.target.value) / 100)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">{t('Controls how much of the canvas height the image occupies')}</p>
            </div>
            
            {/* 自定义宽高比选择（仅在自定义模式下显示） */}
            {imageScaleSettings.mode === 'custom' && (
              <>
                <div className="mb-4">
                  <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-700 mb-1">{t('Aspect Ratio')}</label>
                  <select
                    id="aspect-ratio"
                    value={imageScaleSettings.aspectRatio}
                    onChange={(e) => handleAspectRatioChange(e.target.value)}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="auto">{t('Auto (Keep Original)')}</option>
                    <option value="1:1">{t('Square (1:1)')}</option>
                    <option value="4:3">{t('Standard (4:3)')}</option>
                    <option value="16:9">{t('Widescreen (16:9)')}</option>
                    <option value="3:2">{t('Photo (3:2)')}</option>
                    <option value="2:3">{t('Portrait (2:3)')}</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">{t('Custom aspect ratio will override auto-scaling')}</p>
                </div>
                
                {/* 拉伸模式选择 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('Stretch Mode')}</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={imageScaleSettings.stretchMode === 'maintain'}
                        onChange={() => setImageScaleSettings(prev => ({ ...prev, stretchMode: 'maintain' }))}
                      />
                      <span className="ml-2 text-gray-700">{t('Maintain Aspect Ratio')}</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={imageScaleSettings.stretchMode === 'stretch'}
                        onChange={() => setImageScaleSettings(prev => ({ ...prev, stretchMode: 'stretch' }))}
                      />
                      <span className="ml-2 text-gray-700">{t('Stretch to Fill')}</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('Stretch to Fill may distort the image but ensures it covers the entire area')}</p>
                </div>
              </>
            )}
            
            {/* 重置按钮 */}
            <div className="flex justify-end">
              <button
                onClick={handleResetImageScale}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                {t('Reset to Default')}
              </button>
            </div>
          </div>

          {/* 平台选择设置 - 美观紧凑版 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('Platform Selection')}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{t('Selected')} {getSelectedPlatformCount()}/{allPlatforms.length}</span>
                <button
                  onClick={handleSelectAll}
                  className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                >
                  {Object.values(selectedPlatforms).every(v => v) ? t('Unselect All') : t('Select All')}
                </button>
              </div>
            </div>
            
            {/* 更紧凑版平台选择 */}
            <div className="space-y-2">
              {Object.entries(getPlatformsByCategory()).map(([category, platforms]) => (
                <div key={category} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                      {platforms[0].icon} {category}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {platforms.filter(p => selectedPlatforms[p.key]).length}/{platforms.length}
                    </span>
                  </div>
                  
                  {/* 使用更多列的网格布局 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                    {platforms.map(platform => {
                      const isSelected = selectedPlatforms[platform.key]
                      const currentSize = customSizes[platform.key]
                      const isCustomSize = currentSize.width !== platform.defaultWidth || currentSize.height !== platform.defaultHeight
                      
                      return (
                        <div key={platform.key} className={`
                          border rounded-lg p-1.5 transition-all duration-200 text-xs
                          ${isSelected 
                            ? 'border-blue-300 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                          }
                        `}>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-1 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handlePlatformToggle(platform.key)}
                                className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-700 leading-tight">{platform.name}</span>
                                <span className="text-gray-500 text-xs leading-tight">
                                  {currentSize.width}×{currentSize.height}
                                  {isCustomSize && <span className="text-orange-600 ml-0.5">*</span>}
                                </span>
                              </div>
                            </label>
                            
                            {/* 更紧凑的操作按钮 */}
                            <div className="flex">
                              <button
                                onClick={() => setEditingSize(editingSize === platform.key ? null : platform.key)}
                                className="text-blue-600 hover:text-blue-800 px-1 rounded hover:bg-blue-50 transition-colors"
                                title={t('编辑尺寸')}
                              >
                                ✏️
                              </button>
                              {isCustomSize && (
                                <button
                                  onClick={() => handleResetSize(platform.key)}
                                  className="text-gray-500 hover:text-gray-700 px-1 rounded hover:bg-gray-100 transition-colors"
                                  title={t('重置为默认尺寸')}
                                >
                                  ↺
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* 尺寸编辑区域 - 极简版 */}
                          {editingSize === platform.key && (
                            <div className="mt-1 pt-1 border-t border-gray-200 bg-gray-50 rounded-sm p-1">
                              <div className="flex items-center space-x-1 text-xs">
                                <input
                                  type="number"
                                  value={currentSize.width}
                                  onChange={(e) => handleCustomSizeChange(platform.key, 'width', parseInt(e.target.value) || 100)}
                                  className="w-12 border rounded px-1 py-0.5 text-xs"
                                  min="100"
                                  max="3000"
                                />
                                <span className="text-gray-400">×</span>
                                <input
                                  type="number"
                                  value={currentSize.height}
                                  onChange={(e) => handleCustomSizeChange(platform.key, 'height', parseInt(e.target.value) || 100)}
                                  className="w-12 border rounded px-1 py-0.5 text-xs"
                                  min="100"
                                  max="3000"
                                />
                                <button
                                  onClick={() => setEditingSize(null)}
                                  className="ml-0.5 text-green-600 hover:text-green-800 px-1 py-0 border border-green-200 rounded hover:bg-green-50"
                                >
                                  ✓
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 选择统计 - 极简版 */}
            <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-700">
                  {t('已选择')} <span className="font-semibold">{getSelectedPlatformCount()}</span> {t('个平台')}
                </p>
                <div className="text-xs text-blue-600">
                  {getSelectedPlatformCount() > 0 && (
                    <span>
                      {t('预计生成')} {(() => {
                        const textCombinations = adTextGroups.reduce((total, group) => total * Math.max(1, group.options.filter(opt => opt.trim()).length), 1)
                        const ctaCombinations = Math.max(1, buttonStyle.textOptions.filter(opt => opt.trim()).length)
                        return textCombinations * ctaCombinations * getSelectedPlatformCount()
                      })()} {t('张图片')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 组合信息显示 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">{t('Generation Preview')}</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>📝 {t('Text Group Count')}: {adTextGroups.length}</p>
              <p>🔄 {t('Text Combination Count')}: {adTextGroups.reduce((total, group) => total * Math.max(1, group.options.filter(opt => opt.trim()).length), 1)}</p>
              <p>🎯 {t('CTA Option Count')}: {buttonStyle.textOptions.filter(opt => opt.trim()).length}</p>
              <p>📊 {t('Total Combination Count')}: {(() => {
                const textCombinations = adTextGroups.reduce((total, group) => total * Math.max(1, group.options.filter(opt => opt.trim()).length), 1)
                const ctaCombinations = Math.max(1, buttonStyle.textOptions.filter(opt => opt.trim()).length)
                return textCombinations * ctaCombinations
              })()}</p>
              <p>🖼️ {t('Total Image Count')}: {(() => {
                const textCombinations = adTextGroups.reduce((total, group) => total * Math.max(1, group.options.filter(opt => opt.trim()).length), 1)
                const ctaCombinations = Math.max(1, buttonStyle.textOptions.filter(opt => opt.trim()).length)
                const totalCombinations = textCombinations * ctaCombinations
                // 修复：使用 images.length 而不是硬编码值
                return totalCombinations * getSelectedPlatformCount() * images.length 
              })()} ({t('Platforms')}: {getSelectedPlatformCount()}, {t('Product Images')}: {images.length})</p>
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerateAds}
            disabled={images.length === 0 || (adTextGroups.length === 0 && buttonStyle.textOptions.every(opt => !opt.trim())) || isGenerating || getSelectedPlatformCount() === 0}
            className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? t('Generating...') : t('Generate All Ad Images')}
          </button>
        </div>

        {/* 右侧预览 */}
        <div className="bg-white rounded-lg shadow-md p-4 sticky top-4 h-fit max-h-[calc(100vh-1rem)] overflow-y-auto preview-scrollbar">
          <h2 className="text-xl font-bold mb-4 text-gray-800 sticky top-0 bg-white pb-2 z-10 border-b border-gray-200 flex items-center justify-between">
            <span>{t('Preview')}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center">
              📌 {t('Scroll Following')}
            </span>
          </h2>
          <div className="space-y-3">
            {/* 预览平台选择器 */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{t('预览平台:')}</span>
                <span className="text-xs text-gray-500">
                  {getCurrentPreviewPlatform().width} × {getCurrentPreviewPlatform().height}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                <button
                  onClick={() => setPreviewPlatform('default')}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    previewPlatform === 'default'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t('默认预览')}
                </button>
                {getSelectedPlatforms().map(platform => (
                  <button
                    key={platform.key}
                    onClick={() => setPreviewPlatform(platform.key)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      previewPlatform === platform.key
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {platform.name}
                  </button>
                ))}
              </div>
              {/* 新增：文字组选择器，为每个有多个选项的文字组显示选择器 */}
              {adTextGroups.map((group, groupIdx) => {
                const validOptions = group.options.filter(opt => opt.trim());
                if (validOptions.length <= 1) return null;
                
                return (
                  <div key={group.id} className="flex flex-wrap gap-1 mt-1">
                    <span className="text-xs text-gray-700 mr-1">{t('文字选项:')}</span>
                    {validOptions.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => {
                          const newIndexes = [...previewTextIndexes];
                          newIndexes[groupIdx] = optIdx;
                          setPreviewTextIndexes(newIndexes);
                        }}
                        className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                          (previewTextIndexes[groupIdx] || 0) === optIdx
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50'
                        }`}
                      >
                        {option.length > 15 ? option.substring(0, 15) + '...' : option}
                      </button>
                    ))}
                  </div>
                );
              })}
              
              {/* CTA文案选择器，仅在有多个文案时显示 */}
              {buttonStyle.textOptions.filter(opt => opt.trim()).length > 1 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-xs text-gray-700 mr-1">CTA:</span>
                  {buttonStyle.textOptions.filter(opt => opt.trim()).map((cta, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewCtaIndex(idx)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        previewCtaIndex === idx
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-amber-50'
                      }`}
                    >
                      {cta || `${t('Button')}${idx+1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {images.length > 0 && (
              <>
              <div 
                ref={canvasContainerRef}
                  className="border rounded-lg overflow-hidden relative bg-gray-50"
                  style={{
                    aspectRatio: `${getCurrentPreviewPlatform().width} / ${getCurrentPreviewPlatform().height}`,
                    maxHeight: '700px'
                  }}
              >
                {/* 左右箭头导航按钮 */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center z-10 hover:bg-opacity-70 transition-opacity"
                      aria-label={t('Previous image')}
                    >
                      <span className="text-xl">&lsaquo;</span>
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center z-10 hover:bg-opacity-70 transition-opacity"
                      aria-label={t('Next image')}
                    >
                      <span className="text-xl">&rsaquo;</span>
                    </button>
                  </>
                )}
                <canvas
                  ref={canvasRef}
                    className="w-full h-full cursor-move"
                    style={{ 
                      display: 'block',
                      objectFit: 'contain'
                    }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onMouseOver={handleCanvasMouseOver}
                />
                </div>
                
                {/* 添加到图片框外部的分页指示器 */}
                {images.length > 1 && (
                  <div className="flex justify-center gap-1 mt-2 mb-1">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full ${
                          currentImageIndex === idx ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        aria-label={t('Switch to image') + ` ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
                
                {/* 预览尺寸提示，移到预览图外部 */}
                <div className="w-full flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">
                    {images.length > 0 ? `${t('Image')} ${currentImageIndex + 1}/${images.length}` : t('No Image Uploaded')}
                  </span>
                  <span className="bg-black text-white text-base rounded-xl px-4 py-1 font-medium shadow">
                    {getCurrentPreviewPlatform().name} ({getCurrentPreviewPlatform().width}×{getCurrentPreviewPlatform().height})
                  </span>
                  <span className="text-sm text-gray-600 invisible">占位</span>
                </div>
              </>
            )}
            
            <div className="text-sm text-gray-600">
              {getSelectedPlatformCount() > 0 ? (
                <div>
                  <p className="font-medium mb-1">{t('已选择的平台:')} ✅</p>
                  {getSelectedPlatforms().map(platform => {
                    const currentSize = customSizes[platform.key]
                    const isCustomSize = currentSize.width !== platform.defaultWidth || currentSize.height !== platform.defaultHeight
                    return (
                      <div key={platform.key} className="ml-2 text-xs mb-0.5">
                        <span className="flex items-center">
                          <span>• {platform.name}</span>
                          <span className="text-gray-500 ml-1">({currentSize.width}×{currentSize.height})</span>
                          {isCustomSize && (
                            <span className="text-orange-600 bg-orange-100 px-1 rounded ml-1 text-xs">{t('自定义')}</span>
                          )}
                        </span>
                </div>
                    )
                  })}
              </div>
              ) : (
                <p className="text-red-500">⚠️ {t('请至少选择一个平台')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
