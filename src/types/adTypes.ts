export interface AdText {
  id: string
  text: string
  color: string
  position: 'top' | 'bottom' | 'custom'
  font: string
  x?: number // 自定义位置的X坐标
  y?: number // 自定义位置的Y坐标
  size?: number // 文字大小比例，默认为1
}

export interface AdTextGroup {
  id: string
  options: string[] // 多个文字选项
  color: string
  position: 'top' | 'bottom' | 'custom'
  font: string
  x?: number // 自定义位置的X坐标
  y?: number // 自定义位置的Y坐标
  size?: number // 文字大小比例，默认为1
}

export interface ButtonStyle {
  backgroundColor: string
  textColor: string
  borderRadius: string
  padding: string
  textOptions: string[] // 多个文字选项
  font: string
  x?: number // 按钮X位置（百分比）
  y?: number // 按钮Y位置（百分比）
  size?: number // 按钮大小比例，默认为1
}

export interface ImageScaleSettings {
  mode: 'auto' | 'custom' // 自动或自定义模式
  widthRatio: number      // 宽度比例 (0-1)
  heightRatio: number     // 高度比例 (0-1)
  aspectRatio: string     // 宽高比 (例如 "4:3", "16:9")
  stretchMode: 'maintain' | 'stretch' // 拉伸模式：maintain保持比例，stretch完全拉伸
}

export interface CombinedTemplate {
  name: string
  buttonStyle: ButtonStyle
  textStyles: AdText[]
} 