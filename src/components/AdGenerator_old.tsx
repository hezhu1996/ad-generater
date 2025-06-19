'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface AdText {
  id: string
  text: string
  color: string
  position: 'top' | 'bottom'
}

interface AdTextGroup {
  id: string
  name: string
  options: string[] // 多个文字选项
  color: string
  position: 'top' | 'bottom'
}

interface ButtonStyle {
  backgroundColor: string
  textColor: string
  borderRadius: string
  padding: string
  textOptions: string[] // 改为多个文字选项
}

export default function AdGenerator() {
  const [image, setImage] = useState<string | null>(null)
  const [adTextGroups, setAdTextGroups] = useState<AdTextGroup[]>([])
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>({
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 24px',
    textOptions: ['立即购买']
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      name: `文字组 ${adTextGroups.length + 1}`,
      options: [''],
      color: '#000000',
      position: 'top'
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
    texts.forEach((text, index) => {
      if (text.text.trim()) {
        ctx.font = `bold ${Math.max(width * 0.04, 20)}px Arial, sans-serif`
        ctx.fillStyle = text.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        
        const yPosition = 20 + (index * (Math.max(width * 0.05, 25)))
        
        // 添加文字描边效果
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.strokeText(text.text, width / 2, yPosition)
        ctx.fillText(text.text, width / 2, yPosition)
      }
    })
  }

  const drawBottomTexts = (ctx: CanvasRenderingContext2D, width: number, height: number, texts: AdText[], imageHeight: number, ctaButtonText: string, ctaButtonStyle: ButtonStyle) => {
    // 计算图片实际占用的高度
    const startY = imageHeight + 20 // 在图片下方留20px间距

    // 绘制普通底部文字
    let currentY = startY
    texts.forEach((text, index) => {
      if (text.text.trim()) {
        ctx.font = `bold ${Math.max(width * 0.04, 20)}px Arial, sans-serif`
        ctx.fillStyle = text.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        
        const yPosition = currentY
        currentY += Math.max(width * 0.05, 25)
        
        // 添加文字描边效果
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.strokeText(text.text, width / 2, yPosition)
        ctx.fillText(text.text, width / 2, yPosition)
      }
    })

    // 绘制CTA按钮（如果有文字） - 使用传入的文字参数
    if (ctaButtonText.trim()) {
      console.log('正在绘制CTA按钮:', ctaButtonText)
      
      // 设置按钮样式
      ctx.font = `bold ${Math.max(width * 0.035, 18)}px Arial, sans-serif`
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

    return new Promise<string>((resolve) => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      
      canvas.width = width
      canvas.height = height

      const img = new Image()
      img.onload = () => {
        // 绘制背景图片
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        
        // 计算图片位置，保持比例并居中
        const scale = Math.min(width / img.width, height / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        const x = (width - scaledWidth) / 2
        const y = (height - scaledHeight) / 2
        
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

        // 绘制文字
        const topTexts = textCombination.filter(text => text.position === 'top')
        const bottomTexts = textCombination.filter(text => text.position === 'bottom')

        drawTopTexts(ctx, width, topTexts)
        drawBottomTexts(ctx, width, height, bottomTexts, y + scaledHeight, ctaText, buttonStyle)

        resolve(canvas.toDataURL('image/png'))
      }
      img.src = image
    })
  }, [image, buttonStyle])

  // 生成所有文字组合
  const generateAllCombinations = () => {
    const combinations: Array<{texts: AdText[], ctaText: string}> = []
    
    // 从每个文字组中获取所有选项组合
    const textGroupOptions = adTextGroups.map(group => 
      group.options.filter(opt => opt.trim()).map(option => ({
        id: group.id + '_' + option,
        text: option,
        color: group.color,
        position: group.position
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
      const platforms = [
        { name: 'Facebook_Square', width: 1080, height: 1080 },
        { name: 'Facebook_Landscape', width: 1200, height: 630 },
        { name: 'Google_Ads_Square', width: 1200, height: 1200 },
        { name: 'Google_Ads_Landscape', width: 1200, height: 628 },
        { name: 'Instagram_Square', width: 1080, height: 1080 },
        { name: 'Instagram_Story', width: 1080, height: 1920 },
        { name: 'LinkedIn_Single', width: 1200, height: 627 },
        { name: 'Twitter_Post', width: 1200, height: 675 }
      ]

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
      if (image && canvasRef.current) {
        try {
          // 使用第一个组合进行预览
          const combinations = generateAllCombinations()
          if (combinations.length > 0) {
            const firstCombination = combinations[0]
            await generateAdImage(800, 600, 'png', firstCombination.texts, firstCombination.ctaText)
          }
        } catch (error) {
          console.error('预览更新失败:', error)
        }
      }
    }
    
    updatePreview()
  }, [image, adTextGroups, buttonStyle, generateAdImage])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧控制面板 */}
        <div className="space-y-6">
          {/* 图片上传 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">上传产品图片</h2>
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
              <h2 className="text-xl font-semibold">广告文字组</h2>
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
                      <input
                        type="text"
                        placeholder="文字组名称"
                        value={group.name}
                        onChange={(e) => updateAdTextGroup(group.id, { name: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <label htmlFor={`position-${group.id}`} className="text-sm font-medium">位置:</label>
                          <select
                            id={`position-${group.id}`}
                            value={group.position}
                            onChange={(e) => updateAdTextGroup(group.id, { position: e.target.value as 'top' | 'bottom' })}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="top">顶部</option>
                            <option value="bottom">底部</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">颜色:</span>
                          <button
                            type="button"
                            className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                            style={{ backgroundColor: group.color }}
                            onClick={() => setShowColorPicker(showColorPicker === group.id ? null : group.id)}
                            aria-label="选择文字颜色"
                          />
                        </div>
                      </div>
                      
                      {/* 文字选项列表 */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">文字选项:</label>
                          <button
                            onClick={() => addTextOption(group.id)}
                            className="text-blue-500 hover:text-blue-600 text-sm"
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
                              className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <h2 className="text-xl font-semibold mb-4">CTA 按钮样式</h2>
            <div className="space-y-4">
              {/* CTA 文字选项 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">按钮文字选项</label>
                  <button
                    onClick={addCtaOption}
                    className="text-blue-500 hover:text-blue-600 text-sm"
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
                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <span className="block text-sm font-medium mb-2">背景颜色</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
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
                <span className="block text-sm font-medium mb-2">文字颜色</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
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
                <label htmlFor="border-radius-select" className="block text-sm font-medium mb-2">圆角大小</label>
                <select
                  id="border-radius-select"
                  value={buttonStyle.borderRadius}
                  onChange={(e) => setButtonStyle({...buttonStyle, borderRadius: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="0px">无圆角</option>
                  <option value="4px">小圆角</option>
                  <option value="8px">中等圆角</option>
                  <option value="16px">大圆角</option>
                  <option value="50px">胶囊形</option>
                </select>
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
                return totalCombinations * 8 // 8个平台
              })()} (8
