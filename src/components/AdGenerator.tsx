'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

// 添加防抖功能
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

interface AdText {
  id: string
  text: string
  color: string
  position: 'top' | 'bottom' | 'custom'
  font: string
  x?: number // 自定义位置的X坐标
  y?: number // 自定义位置的Y坐标
  size?: number // 文字大小比例，默认为1
}

interface AdTextGroup {
  id: string
  options: string[] // 多个文字选项
  color: string
  position: 'top' | 'bottom' | 'custom'
  font: string
  x?: number // 自定义位置的X坐标
  y?: number // 自定义位置的Y坐标
  size?: number // 文字大小比例，默认为1
}

interface ButtonStyle {
  backgroundColor: string
  textColor: string
  borderRadius: string
  padding: string
  textOptions: string[] // 改为多个文字选项
  font: string
  x?: number // 按钮X位置（百分比）
  y?: number // 按钮Y位置（百分比）
  size?: number // 按钮大小比例，默认为1
}

export default function AdGenerator() {
  const [image, setImage] = useState<string | null>(null)
  const [adTextGroups, setAdTextGroups] = useState<AdTextGroup[]>([])
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>({
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 24px',
    textOptions: ['立即购买'],
    font: 'Arial, sans-serif',
    x: 50, // 默认居中
    y: 75, // 默认在画布下部
    size: 1 // 默认大小比例
  })
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
  
  // 添加平台选择状态
  const [selectedPlatforms, setSelectedPlatforms] = useState<{[key: string]: boolean}>({
    'Facebook_Square': true,
    'Facebook_Landscape': true,
    'Google_Ads_Square': true,
    'Google_Ads_Landscape': true,
    'Instagram_Square': true,
    'Instagram_Story': true,
    'LinkedIn_Single': true,
    'Twitter_Post': true
  })
  
  // 添加自定义尺寸状态
  const [customSizes, setCustomSizes] = useState<{[key: string]: {width: number, height: number}}>({
    'Facebook_Square': { width: 1080, height: 1080 },
    'Facebook_Landscape': { width: 1200, height: 630 },
    'Google_Ads_Square': { width: 1200, height: 1200 },
    'Google_Ads_Landscape': { width: 1200, height: 628 },
    'Instagram_Square': { width: 1080, height: 1080 },
    'Instagram_Story': { width: 1080, height: 1920 },
    'LinkedIn_Single': { width: 1200, height: 627 },
    'Twitter_Post': { width: 1200, height: 675 }
  })
  
  // 平台配置
  const allPlatforms = [
    { key: 'Facebook_Square', name: 'Facebook 方形', defaultWidth: 1080, defaultHeight: 1080, category: 'Facebook', icon: '📘' },
    { key: 'Facebook_Landscape', name: 'Facebook 横向', defaultWidth: 1200, defaultHeight: 630, category: 'Facebook', icon: '📘' },
    { key: 'Google_Ads_Square', name: 'Google Ads 方形', defaultWidth: 1200, defaultHeight: 1200, category: 'Google Ads', icon: '🔍' },
    { key: 'Google_Ads_Landscape', name: 'Google Ads 横向', defaultWidth: 1200, defaultHeight: 628, category: 'Google Ads', icon: '🔍' },
    { key: 'Instagram_Square', name: 'Instagram 方形', defaultWidth: 1080, defaultHeight: 1080, category: 'Instagram', icon: '📷' },
    { key: 'Instagram_Story', name: 'Instagram Story', defaultWidth: 1080, defaultHeight: 1920, category: 'Instagram', icon: '📷' },
    { key: 'LinkedIn_Single', name: 'LinkedIn 广告', defaultWidth: 1200, defaultHeight: 627, category: 'LinkedIn', icon: '💼' },
    { key: 'Twitter_Post', name: 'Twitter 广告', defaultWidth: 1200, defaultHeight: 675, category: 'Twitter', icon: '🐦' }
  ]
  
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
    }, {} as {[key: string]: boolean})
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
      // 默认预览使用第一个选中的平台，或者使用固定尺寸
      const selectedPlatforms = getSelectedPlatforms()
      if (selectedPlatforms.length > 0) {
        return {
          name: selectedPlatforms[0].name,
          width: 800,
          height: 600,
          isDefault: true
        }
      }
      return {
        name: '默认预览',
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
      name: '默认预览',
      width: 800,
      height: 600,
      isDefault: true
    }
  }
  
  // 使用防抖更新位置
  const debouncedUpdatePosition = useCallback(
    debounce((id: string, x: number, y: number) => {
      console.log("更新位置:", id, x, y);
      setAdTextGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === id ? { ...group, x, y } : group
        )
      );
    }, 50),  // 降低防抖时间以提高响应性
    []
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
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

  const drawBottomTexts = (ctx: CanvasRenderingContext2D, width: number, height: number, texts: AdText[], imageHeight: number, ctaButtonText: string, ctaButtonStyle: ButtonStyle) => {
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

    // 绘制CTA按钮（如果有文字） - 使用传入的文字参数
    if (ctaButtonText.trim()) {
      console.log('正在绘制CTA按钮:', ctaButtonText)
      
      // 设置按钮样式
      ctx.font = `bold ${Math.max(width * 0.035, 18)}px ${ctaButtonStyle.font}`
      const textMetrics = ctx.measureText(ctaButtonText)
      const textWidth = textMetrics.width
      const textHeight = Math.max(width * 0.035, 18)
      
      const buttonPadding = 12
      const buttonWidth = textWidth + (buttonPadding * 2)
      const buttonHeight = textHeight + (buttonPadding * 1.5)
      
      // 按钮位置：在所有文字下方，距离底部至少50px
      const buttonX = (width - buttonWidth) / 2
      const buttonY = Math.min(currentY + 20, height - buttonHeight - 50)
      
      console.log('按钮绘制位置:', { buttonX, buttonY, buttonWidth, buttonHeight, canvasHeight: height })
      
      // 绘制按钮背景（圆角矩形）
      const radiusValue = ctaButtonStyle.borderRadius.replace('px', '') // 移除 px 单位
      const radius = parseInt(radiusValue) || 8
      ctx.fillStyle = ctaButtonStyle.backgroundColor
      drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, radius)
      ctx.fill()
      
      console.log('圆角半径:', radius, '原始值:', ctaButtonStyle.borderRadius, '背景色:', ctaButtonStyle.backgroundColor)
      
      // 绘制按钮文字
      ctx.fillStyle = ctaButtonStyle.textColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(ctaButtonText, width / 2, buttonY + buttonHeight / 2)
      
      console.log('CTA按钮绘制完成')
    } else {
      console.log('CTA按钮文字为空，不绘制按钮')
    }
  }

  const generateAdImage = useCallback(async (width: number, height: number, format: string, textCombination: AdText[], ctaText: string) => {
    if (!image || !canvasRef.current) return null

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
        
        // 计算图片位置，保持比例并居中
        // 使用更精确的缩放计算，确保图片不会变形
        const imgAspectRatio = img.width / img.height
        const canvasAspectRatio = width / height
        
        let scaledWidth, scaledHeight, x, y
        
        if (imgAspectRatio > canvasAspectRatio) {
          // 图片更宽，以宽度为准
          scaledWidth = width * 0.8 // 留出一些边距
          scaledHeight = scaledWidth / imgAspectRatio
          x = (width - scaledWidth) / 2
          y = (height - scaledHeight) / 2
        } else {
          // 图片更高，以高度为准
          scaledHeight = height * 0.6 // 为文字和按钮留出空间
          scaledWidth = scaledHeight * imgAspectRatio
          x = (width - scaledWidth) / 2
          y = (height - scaledHeight) / 2
        }
        
        // 确保图片不会超出画布边界
        if (scaledWidth > width) {
          scaledWidth = width * 0.8
          scaledHeight = scaledWidth / imgAspectRatio
          x = (width - scaledWidth) / 2
          y = (height - scaledHeight) / 2
        }
        
        if (scaledHeight > height * 0.7) { // 为文字和按钮保留30%的空间
          scaledHeight = height * 0.6
          scaledWidth = scaledHeight * imgAspectRatio
          x = (width - scaledWidth) / 2
          y = (height - scaledHeight) / 2
        }
        
        console.log("图片绘制参数:", {
          originalSize: { width: img.width, height: img.height },
          scaledSize: { width: scaledWidth, height: scaledHeight },
          position: { x, y },
          canvasSize: { width, height }
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
          drawBottomTexts(ctx, width, height, bottomTexts, y + scaledHeight, ctaText, buttonStyle);
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
              if (draggedText === text.id.split('_')[0]) {
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
      img.src = image
    })
  }, [image, buttonStyle, draggedText, draggedButton])

  // 分离CTA按钮绘制函数
  const drawCTAButton = (ctx: CanvasRenderingContext2D, width: number, height: number, imageHeight: number, ctaButtonText: string, ctaButtonStyle: ButtonStyle) => {
    if (!ctaButtonText.trim()) return;
    
    // 应用大小比例
    const sizeMultiplier = ctaButtonStyle.size || 1;
    
    // 设置按钮样式
    const fontSize = Math.max(width * 0.035, 18) * sizeMultiplier;
    ctx.font = `bold ${fontSize}px ${ctaButtonStyle.font}`;
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
    
    return combinations
  }

  const handleGenerateAds = async () => {
    const combinations = generateAllCombinations()
    
    if (!image || combinations.length === 0) {
      alert('请上传图片并添加至少一个广告文字或CTA按钮文字选项')
      return
    }

    setIsGenerating(true)

    try {
      const zip = new JSZip()
      
      // 生成不同平台的广告图片
      const platforms = getSelectedPlatforms()

      let imageCounter = 1
      
      for (const platform of platforms) {
        for (const combination of combinations) {
          const imageData = await generateAdImage(
            platform.width, 
            platform.height, 
            'png',
            combination.texts,
            combination.ctaText
          )
          
          if (imageData) {
            const base64Data = imageData.split(',')[1]
            const fileName = `${platform.name}_${imageCounter.toString().padStart(3, '0')}.png`
            zip.file(fileName, base64Data, { base64: true })
          }
          imageCounter++
        }
        imageCounter = 1 // 重置计数器为下一个平台
      }

      const content = await zip.generateAsync({ type: 'blob' })
      const totalImages = platforms.length * combinations.length
      saveAs(content, `advertisement_images_${totalImages}_variants.zip`)
      
      console.log(`生成了 ${totalImages} 张图片 (${platforms.length} 个平台 × ${combinations.length} 个文字组合)`)
    } catch (error) {
      console.error('生成广告图片时出错:', error)
      alert('生成图片时出现错误，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 实时预览功能
  useEffect(() => {
    const updatePreview = async () => {
      if (!image || !canvasRef.current) return;
      
      try {
        const currentPlatform = getCurrentPreviewPlatform();
        await generateAdImage(currentPlatform.width, currentPlatform.height, 'png', previewTexts, previewCtaText);
      } catch (error) {
        console.error('预览更新失败:', error);
      }
    };
    
    // 如果不是拖动中就更新预览
    if (!draggedText && !draggedButton) {
      updatePreview();
    }
  }, [image, adTextGroups, buttonStyle, generateAdImage, draggedText, draggedButton, previewPlatform, customSizes, previewCtaIndex, previewTextIndexes]);

  // 确保在拖动结束后正确更新一次
  useEffect(() => {
    if (draggedText === null && debounceUpdate !== null) {
      // 重置位置状态
      setDebounceUpdate(null);
      
      // 延迟更新以确保状态已完全更新
      setTimeout(() => {
        if (image && canvasRef.current) {
          const combinations = generateAllCombinations();
          if (combinations.length > 0) {
            const firstCombination = combinations[0];
            const currentPlatform = getCurrentPreviewPlatform()
            generateAdImage(currentPlatform.width, currentPlatform.height, 'png', firstCombination.texts, previewCtaText)
              .catch(err => console.error('拖动后预览更新失败:', err));
          }
        }
      }, 50);
    }
  }, [draggedText, debounceUpdate, generateAdImage, generateAllCombinations, image, previewPlatform, customSizes, previewCtaIndex, previewTextIndexes]);

  // 更新handleCanvasMouseDown以支持按钮拖拽
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !canvasContainerRef.current || !image) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // 转为百分比
    const y = ((e.clientY - rect.top) / rect.height) * 100; // 转为百分比
    
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
          img.src = image;
          
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
    if (customTexts.length > 0) {
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
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    
    // 处理按钮拖拽
    if (draggedButton) {
      console.log(`拖动CTA按钮: 位置=(${x}, ${y})`);
      
      // 更新按钮位置
      setButtonStyle(prev => ({
        ...prev,
        x: x,
        y: y
      }));
      
      // 阻止事件冒泡和默认行为
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    
    // 处理文字拖拽
    if (draggedText) {
      // 显示拖动信息
      console.log(`拖动中: ID=${draggedText}, 位置=(${x}, ${y})`);
      
      // 立即更新状态以便UI反馈
      setDebounceUpdate({x, y});
      
      // 使用防抖方法
      debouncedUpdatePosition(draggedText, x, y);
      
      // 阻止事件冒泡和默认行为
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 处理按钮拖拽完成
    if (draggedButton) {
      console.log(`CTA按钮拖动结束`);
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
        
        // 立即应用最终位置，不使用防抖
        setAdTextGroups(prevGroups => 
          prevGroups.map(group => 
            group.id === draggedText ? { ...group, x, y } : group
          )
        );
        
        console.log(`最终位置已更新: ID=${draggedText}, 位置=(${x}, ${y})`);
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

  // 手动刷新预览功能
  const refreshPreview = useCallback(() => {
    if (!image || !canvasRef.current) return;
      
    try {
      const combinations = generateAllCombinations();
      if (combinations.length > 0) {
        const firstCombination = combinations[0];
        const currentPlatform = getCurrentPreviewPlatform()
        console.log("手动刷新预览...");
        generateAdImage(currentPlatform.width, currentPlatform.height, 'png', firstCombination.texts, previewCtaText)
          .catch(err => console.error('预览刷新失败:', err));
      }
    } catch (error) {
      console.error('手动刷新预览失败:', error);
    }
  }, [image, canvasRef, generateAllCombinations, generateAdImage, previewPlatform, customSizes, previewCtaIndex, previewTextIndexes]);

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* 左侧控制面板 */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* 图片上传 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">上传产品图片</h2>
            <button
              type="button"
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? (
                <div className="space-y-2">
                  <img src={image} alt="Uploaded" className="max-h-32 mx-auto rounded" />
                  <p className="text-sm text-gray-600">点击更换图片</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl text-gray-400">📷</div>
                  <p className="text-gray-600">点击或拖拽上传图片</p>
                  <p className="text-sm text-gray-400">支持 JPG, PNG 格式</p>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* 广告文字设置 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">广告文字组</h2>
              <button
                onClick={addAdTextGroup}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                添加文字组
              </button>
            </div>
            
            <div className="space-y-6">
              {adTextGroups.map((group) => (
                <div key={group.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <label htmlFor={`position-${group.id}`} className="text-sm font-medium text-gray-700">位置:</label>
                          <select
                            id={`position-${group.id}`}
                            value={group.position}
                            onChange={(e) => updateAdTextGroup(group.id, { position: e.target.value as 'top' | 'bottom' | 'custom' })}
                            className="border rounded px-2 py-1 text-sm text-gray-800"
                          >
                            <option value="top">顶部</option>
                            <option value="bottom">底部</option>
                            <option value="custom">自定义</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">颜色:</span>
                          <button
                            type="button"
                            className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer shadow-sm"
                            style={{ backgroundColor: group.color }}
                            onClick={() => setShowColorPicker(showColorPicker === group.id ? null : group.id)}
                            aria-label="选择文字颜色"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label htmlFor={`font-${group.id}`} className="text-sm font-medium text-gray-700">字体:</label>
                          <select
                            id={`font-${group.id}`}
                            value={group.font}
                            onChange={(e) => updateAdTextGroup(group.id, { font: e.target.value })}
                            className="border rounded px-2 py-1 text-sm text-gray-800"
                          >
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="'Times New Roman', serif">Times New Roman</option>
                            <option value="'Courier New', monospace">Courier New</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                            <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
                            <option value="'SimSun', serif">宋体</option>
                          </select>
                        </div>
                      </div>
                      
                      {group.position === 'custom' && (
                        <div className="flex items-center space-x-4 mt-3 bg-blue-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <label htmlFor={`x-${group.id}`} className="block text-sm font-medium text-gray-700 mb-1">X位置: {group.x || 50}%</label>
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
                            <label htmlFor={`y-${group.id}`} className="block text-sm font-medium text-gray-700 mb-1">Y位置: {group.y || 50}%</label>
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
                          文字大小: {Math.round(((group.size === undefined ? 1 : group.size) * 100))}%
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
                            重置
                          </button>
                        </div>
                      </div>
                      
                      {/* 文字选项列表 */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-gray-700">文字选项:</label>
                          <button
                            onClick={() => addTextOption(group.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            + 添加选项
                          </button>
                        </div>
                        
                        {group.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder={`选项 ${index + 1}`}
                              value={option}
                              onChange={(e) => updateTextOption(group.id, index, e.target.value)}
                              className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-800 caret-blue-500"
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
                              完成
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
            <h2 className="text-xl font-bold mb-4 text-gray-800">CTA 按钮样式</h2>
            <div className="space-y-4">
              {/* CTA 文字选项 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">按钮文字选项</label>
                  <button
                    onClick={addCtaOption}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    + 添加选项
                  </button>
                </div>
                
                <div className="space-y-2">
                  {buttonStyle.textOptions.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={`CTA 选项 ${index + 1}`}
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
                </div>
              </div>
              
              <div>
                <span className="block text-sm font-medium mb-2 text-gray-700">背景颜色</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer shadow-sm"
                    style={{ backgroundColor: buttonStyle.backgroundColor }}
                    onClick={() => setShowColorPicker(showColorPicker === 'button-bg' ? null : 'button-bg')}
                    aria-label="选择按钮背景颜色"
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
                      完成
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <span className="block text-sm font-medium mb-2 text-gray-700">文字颜色</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer shadow-sm"
                    style={{ backgroundColor: buttonStyle.textColor }}
                    onClick={() => setShowColorPicker(showColorPicker === 'button-text' ? null : 'button-text')}
                    aria-label="选择按钮文字颜色"
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
                      完成
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="button-font-select" className="block text-sm font-medium mb-2 text-gray-700">按钮字体</label>
                <select
                  id="button-font-select"
                  value={buttonStyle.font}
                  onChange={(e) => setButtonStyle({...buttonStyle, font: e.target.value})}
                  className="w-full border rounded px-3 py-2 text-gray-800"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                  <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
                  <option value="'SimSun', serif">宋体</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="border-radius-select" className="block text-sm font-medium mb-2 text-gray-700">圆角大小</label>
                <select
                  id="border-radius-select"
                  value={buttonStyle.borderRadius}
                  onChange={(e) => setButtonStyle({...buttonStyle, borderRadius: e.target.value})}
                  className="w-full border rounded px-3 py-2 text-gray-800"
                >
                  <option value="0px">无圆角</option>
                  <option value="4px">小圆角</option>
                  <option value="8px">中等圆角</option>
                  <option value="16px">大圆角</option>
                  <option value="50px">胶囊形</option>
                </select>
              </div>

              {/* 添加按钮位置控制 */}
              <div className="bg-amber-50 p-3 rounded-lg">
                <h3 className="text-md font-medium mb-3 text-gray-800">按钮位置与大小 <span className="text-amber-600 text-sm">(也可在预览中直接拖动)</span></h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label htmlFor="button-x" className="block text-sm font-medium mb-1 text-gray-700">
                      X位置: {buttonStyle.x !== undefined ? buttonStyle.x : 50}%
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
                      Y位置: {buttonStyle.y !== undefined ? buttonStyle.y : 75}%
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
                    按钮大小: {Math.round(((buttonStyle.size === undefined ? 1 : buttonStyle.size) * 100))}%
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
                      重置
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 平台选择设置 - 美观紧凑版 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">平台选择</h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">已选择 {getSelectedPlatformCount()}/8</span>
                <button
                  onClick={handleSelectAll}
                  className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                >
                  {Object.values(selectedPlatforms).every(v => v) ? '取消全选' : '全选'}
                </button>
              </div>
            </div>
            
            {/* 美观的平台选择卡片 */}
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(getPlatformsByCategory()).map(([category, platforms]) => (
                <div key={category} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                      {platforms[0].icon} {category}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {platforms.filter(p => selectedPlatforms[p.key]).length}/{platforms.length}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {platforms.map(platform => {
                      const isSelected = selectedPlatforms[platform.key]
                      const currentSize = customSizes[platform.key]
                      const isCustomSize = currentSize.width !== platform.defaultWidth || currentSize.height !== platform.defaultHeight
                      
                      return (
                        <div key={platform.key} className={`
                          border rounded-lg p-2 transition-all duration-200
                          ${isSelected 
                            ? 'border-blue-300 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                          }
                        `}>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handlePlatformToggle(platform.key)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                            </label>
                            
                            <div className="flex items-center space-x-2">
                              {/* 尺寸显示/编辑 */}
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">
                                  {currentSize.width}×{currentSize.height}
                                </span>
                                {isCustomSize && (
                                  <span className="text-xs text-orange-600 bg-orange-100 px-1 rounded ml-1 text-xs">自定义</span>
                                )}
                              </div>
                              
                              {/* 尺寸编辑按钮 */}
                              <button
                                onClick={() => setEditingSize(editingSize === platform.key ? null : platform.key)}
                                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                                title="编辑尺寸"
                              >
                                ✏️
                              </button>
                              
                              {/* 重置尺寸按钮 */}
                              {isCustomSize && (
                                <button
                                  onClick={() => handleResetSize(platform.key)}
                                  className="text-xs text-gray-500 hover:text-gray-700 px-1 py-1 rounded hover:bg-gray-100 transition-colors"
                                  title="重置为默认尺寸"
                                >
                                  ↺
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* 尺寸编辑区域 */}
                          {editingSize === platform.key && (
                            <div className="mt-2 pt-2 border-t border-gray-200 bg-gray-50 rounded p-2">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <label className="text-xs text-gray-600">宽:</label>
                                  <input
                                    type="number"
                                    value={currentSize.width}
                                    onChange={(e) => handleCustomSizeChange(platform.key, 'width', parseInt(e.target.value) || 100)}
                                    className="w-16 text-xs border rounded px-1 py-1"
                                    min="100"
                                    max="3000"
                                  />
                                </div>
                                <span className="text-xs text-gray-400">×</span>
                                <div className="flex items-center space-x-1">
                                  <label className="text-xs text-gray-600">高:</label>
                                  <input
                                    type="number"
                                    value={currentSize.height}
                                    onChange={(e) => handleCustomSizeChange(platform.key, 'height', parseInt(e.target.value) || 100)}
                                    className="w-16 text-xs border rounded px-1 py-1"
                                    min="100"
                                    max="3000"
                                  />
                                </div>
                                <button
                                  onClick={() => setEditingSize(null)}
                                  className="text-xs text-green-600 hover:text-green-800 px-2 py-1 border border-green-200 rounded hover:bg-green-50"
                                >
                                  完成
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
            
            {/* 选择统计 */}
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-700">
                  已选择 <span className="font-semibold">{getSelectedPlatformCount()}</span> 个平台
                </p>
                <div className="text-xs text-blue-600">
                  {getSelectedPlatformCount() > 0 && (
                    <span>
                      预计生成 {(() => {
                        const textCombinations = adTextGroups.reduce((total, group) => total * Math.max(1, group.options.filter(opt => opt.trim()).length), 1)
                        const ctaCombinations = Math.max(1, buttonStyle.textOptions.filter(opt => opt.trim()).length)
                        return textCombinations * ctaCombinations * getSelectedPlatformCount()
                      })()} 张图片
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 组合信息显示 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">生成预览</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>📝 文字组数量: {adTextGroups.length}</p>
              <p>🔄 文字组合数: {adTextGroups.reduce((total, group) => total * Math.max(1, group.options.filter(opt => opt.trim()).length), 1)}</p>
              <p>🎯 CTA 选项数: {buttonStyle.textOptions.filter(opt => opt.trim()).length}</p>
              <p>📊 总组合数: {(() => {
                const textCombinations = adTextGroups.reduce((total, group) => total * Math.max(1, group.options.filter(opt => opt.trim()).length), 1)
                const ctaCombinations = Math.max(1, buttonStyle.textOptions.filter(opt => opt.trim()).length)
                return textCombinations * ctaCombinations
              })()}</p>
              <p>🖼️ 总图片数: {(() => {
                const textCombinations = adTextGroups.reduce((total, group) => total * Math.max(1, group.options.filter(opt => opt.trim()).length), 1)
                const ctaCombinations = Math.max(1, buttonStyle.textOptions.filter(opt => opt.trim()).length)
                const totalCombinations = textCombinations * ctaCombinations
                return totalCombinations * getSelectedPlatformCount() // 每个平台生成一张图片
              })()} (共 {getSelectedPlatformCount()} 个平台)</p>
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerateAds}
            disabled={!image || (adTextGroups.length === 0 && buttonStyle.textOptions.every(opt => !opt.trim())) || isGenerating || getSelectedPlatformCount() === 0}
            className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? '生成中...' : '生成所有组合的广告图片'}
          </button>
        </div>

        {/* 右侧预览 */}
        <div className="bg-white rounded-lg shadow-md p-4 sticky top-4 h-fit max-h-[calc(100vh-1rem)] overflow-y-auto preview-scrollbar">
          <h2 className="text-xl font-bold mb-4 text-gray-800 sticky top-0 bg-white pb-2 z-10 border-b border-gray-200 flex items-center justify-between">
            <span>预览</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center">
              📌 跟随滚动
            </span>
          </h2>
          <div className="space-y-3">
            {/* 预览平台选择器 */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">预览平台:</span>
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
                  默认预览
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
              {/* 新增：CTA文案选择器，仅在有多个文案时显示 */}
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
                      {cta || `按钮${idx+1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {image && (
              <>
              <div 
                ref={canvasContainerRef}
                  className="border rounded-lg overflow-hidden relative bg-gray-50"
                  style={{
                    aspectRatio: `${getCurrentPreviewPlatform().width} / ${getCurrentPreviewPlatform().height}`,
                    maxHeight: '700px'
                  }}
              >
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
                {/* 预览尺寸提示，移到预览图外部 */}
                <div className="w-full flex justify-center mt-2">
                  <span className="bg-black text-white text-base rounded-xl px-4 py-1 font-medium shadow">
                    {getCurrentPreviewPlatform().name} ({getCurrentPreviewPlatform().width}×{getCurrentPreviewPlatform().height})
                      </span>
                  </div>
              </>
            )}
            
            <div className="text-sm text-gray-600">
              {getSelectedPlatformCount() > 0 ? (
                <div>
                  <p className="font-medium mb-1">✅ 已选择的平台:</p>
                  {getSelectedPlatforms().map(platform => {
                    const currentSize = customSizes[platform.key]
                    const isCustomSize = currentSize.width !== platform.defaultWidth || currentSize.height !== platform.defaultHeight
                    return (
                      <div key={platform.key} className="ml-2 text-xs mb-0.5">
                        <span className="flex items-center">
                          <span>• {platform.name}</span>
                          <span className="text-gray-500 ml-1">({currentSize.width}×{currentSize.height})</span>
                          {isCustomSize && (
                            <span className="text-orange-600 bg-orange-100 px-1 rounded ml-1 text-xs">自定义</span>
                          )}
                        </span>
                </div>
                    )
                  })}
              </div>
              ) : (
                <p className="text-red-500">⚠️ 请至少选择一个平台</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
