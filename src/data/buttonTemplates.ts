import { ButtonStyle, AdText, CombinedTemplate } from '../types/adTypes';

// 20套现代风格的CTA按钮模板
export const buttonTemplates: ButtonStyle[] = [
  // 1. 现代简约蓝
  {
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 24px',
    textOptions: ['立即购买', '了解更多'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 2. 黑色极简
  {
    backgroundColor: '#000000',
    textColor: '#ffffff',
    borderRadius: '4px',
    padding: '12px 24px',
    textOptions: ['SHOP NOW', '立即选购'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 3. 珊瑚橙
  {
    backgroundColor: '#FF7F50',
    textColor: '#ffffff',
    borderRadius: '50px',
    padding: '12px 32px',
    textOptions: ['限时抢购', '立即抢购'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 4. 薄荷绿
  {
    backgroundColor: '#4ade80',
    textColor: '#1e3a8a',
    borderRadius: '8px',
    padding: '12px 24px',
    textOptions: ['查看详情', '了解更多'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 5. 深紫色
  {
    backgroundColor: '#7e22ce',
    textColor: '#ffffff',
    borderRadius: '12px',
    padding: '12px 28px',
    textOptions: ['立即体验', '开始体验'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 6. 透明边框
  {
    backgroundColor: '#0369a1',
    textColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 24px',
    textOptions: ['探索系列', '查看全部'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 7. 玫瑰金
  {
    backgroundColor: '#f9a8d4',
    textColor: '#831843',
    borderRadius: '16px',
    padding: '12px 24px',
    textOptions: ['立即选购', '查看详情'],
    font: "'Times New Roman', serif",
    size: 1
  },
  
  // 8. 哑光黑
  {
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    borderRadius: '0px',
    padding: '14px 28px',
    textOptions: ['SHOP NOW', 'EXPLORE'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 9. 亮红色
  {
    backgroundColor: '#ef4444',
    textColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 24px',
    textOptions: ['限时优惠', '立即抢购'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 10. 渐变蓝紫
  {
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 24px',
    textOptions: ['立即购买', '了解更多'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 11. 极简白底黑字
  {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderRadius: '4px',
    padding: '12px 24px',
    textOptions: ['查看详情', '了解更多'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 12. 琥珀金
  {
    backgroundColor: '#f59e0b',
    textColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 24px',
    textOptions: ['立即抢购', '限时特惠'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 13. 深海蓝
  {
    backgroundColor: '#0f172a',
    textColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 24px',
    textOptions: ['立即购买', '了解更多'],
    font: "'Microsoft YaHei', sans-serif",
    size: 1
  },
  
  // 14. 柔和粉
  {
    backgroundColor: '#fecdd3',
    textColor: '#9d174d',
    borderRadius: '50px',
    padding: '12px 32px',
    textOptions: ['查看详情', '立即选购'],
    font: "'Microsoft YaHei', sans-serif",
    size: 1
  },
  
  // 15. 科技感蓝
  {
    backgroundColor: '#0ea5e9',
    textColor: '#ffffff',
    borderRadius: '4px',
    padding: '12px 24px',
    textOptions: ['立即体验', '免费试用'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 16. 自然绿
  {
    backgroundColor: '#10b981',
    textColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 24px',
    textOptions: ['立即选购', '了解更多'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 17. 高端金
  {
    backgroundColor: '#fbbf24',
    textColor: '#000000',
    borderRadius: '0px',
    padding: '12px 24px',
    textOptions: ['立即购买', '查看系列'],
    font: 'Georgia, serif',
    size: 1
  },
  
  // 18. 极简透明
  {
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 24px',
    textOptions: ['了解更多', '查看详情'],
    font: 'Arial, sans-serif',
    size: 1
  },
  
  // 19. 时尚紫
  {
    backgroundColor: '#a855f7',
    textColor: '#ffffff',
    borderRadius: '12px',
    padding: '12px 28px',
    textOptions: ['立即购买', '查看详情'],
    font: 'Verdana, sans-serif',
    size: 1
  },
  
  // 20. 商务蓝灰
  {
    backgroundColor: '#475569',
    textColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 24px',
    textOptions: ['立即咨询', '了解更多'],
    font: 'Arial, sans-serif',
    size: 1
  }
];

// 文字模板
export const textTemplates: AdText[] = [
  // 1. 简约标题
  {
    id: 'template_simple_title',
    text: '精选好物',
    color: '#000000',
    position: 'top',
    font: 'Arial, sans-serif',
    size: 1.2
  },
  
  // 2. 促销标题
  {
    id: 'template_promo_title',
    text: '限时特惠',
    color: '#ef4444',
    position: 'top',
    font: "'Microsoft YaHei', sans-serif",
    size: 1.3
  },
  
  // 3. 优雅标题
  {
    id: 'template_elegant_title',
    text: '全新系列',
    color: '#1e293b',
    position: 'top',
    font: "'Times New Roman', serif",
    size: 1.2
  },
  
  // 4. 时尚标题
  {
    id: 'template_fashion_title',
    text: '2024新品',
    color: '#000000',
    position: 'top',
    font: 'Arial, sans-serif',
    size: 1.2
  },
  
  // 5. 简约副标题
  {
    id: 'template_simple_subtitle',
    text: '品质保证 · 限时优惠',
    color: '#64748b',
    position: 'bottom',
    font: 'Arial, sans-serif',
    size: 0.9
  },
  
  // 6. 促销副标题
  {
    id: 'template_promo_subtitle',
    text: '折扣高达50%',
    color: '#ef4444',
    position: 'bottom',
    font: 'Arial, sans-serif',
    size: 0.9
  },
  
  // 7. 高端副标题
  {
    id: 'template_premium_subtitle',
    text: '独家限量发售',
    color: '#1e293b',
    position: 'bottom',
    font: "'Times New Roman', serif",
    size: 0.9
  },
  
  // 8. 时尚副标题
  {
    id: 'template_fashion_subtitle',
    text: '全球同步发售',
    color: '#64748b',
    position: 'bottom',
    font: 'Arial, sans-serif',
    size: 0.9
  },
  
  // 9. 简约说明
  {
    id: 'template_simple_desc',
    text: '舒适体验 · 品质生活',
    color: '#64748b',
    position: 'custom',
    font: 'Arial, sans-serif',
    size: 0.8,
    x: 50,
    y: 40
  },
  
  // 10. 促销说明
  {
    id: 'template_promo_desc',
    text: '限时抢购 · 数量有限',
    color: '#ef4444',
    position: 'custom',
    font: 'Arial, sans-serif',
    size: 0.8,
    x: 50,
    y: 40
  },
  
  // 11. 高端说明
  {
    id: 'template_premium_desc',
    text: '匠心工艺 · 品质非凡',
    color: '#1e293b',
    position: 'custom',
    font: "'Times New Roman', serif",
    size: 0.8,
    x: 50,
    y: 40
  },
  
  // 12. 时尚说明
  {
    id: 'template_fashion_desc',
    text: '引领潮流 · 彰显个性',
    color: '#64748b',
    position: 'custom',
    font: 'Arial, sans-serif',
    size: 0.8,
    x: 50,
    y: 40
  },
  
  // 13. 简约标签
  {
    id: 'template_simple_tag',
    text: '新品',
    color: '#ffffff',
    position: 'custom',
    font: 'Arial, sans-serif',
    size: 0.7,
    x: 20,
    y: 20
  },
  
  // 14. 促销标签
  {
    id: 'template_promo_tag',
    text: '热卖',
    color: '#ffffff',
    position: 'custom',
    font: 'Arial, sans-serif',
    size: 0.7,
    x: 20,
    y: 20
  },
  
  // 15. 高端标签
  {
    id: 'template_premium_tag',
    text: '限量',
    color: '#ffffff',
    position: 'custom',
    font: "'Times New Roman', serif",
    size: 0.7,
    x: 20,
    y: 20
  },
  
  // 16. 时尚标签
  {
    id: 'template_fashion_tag',
    text: '爆款',
    color: '#ffffff',
    position: 'custom',
    font: 'Arial, sans-serif',
    size: 0.7,
    x: 20,
    y: 20
  },
  
  // 17. 简约价格
  {
    id: 'template_simple_price',
    text: '¥299',
    color: '#000000',
    position: 'custom',
    font: 'Arial, sans-serif',
    size: 1.2,
    x: 50,
    y: 60
  },
  
  // 18. 促销价格
  {
    id: 'template_promo_price',
    text: '¥199',
    color: '#ef4444',
    position: 'custom',
    font: 'Arial, sans-serif',
    size: 1.2,
    x: 50,
    y: 60
  },
  
  // 19. 高端价格
  {
    id: 'template_premium_price',
    text: '¥1,299',
    color: '#1e293b',
    position: 'custom',
    font: "'Times New Roman', serif",
    size: 1.2,
    x: 50,
    y: 60
  },
  
  // 20. 时尚价格
  {
    id: 'template_fashion_price',
    text: '¥599',
    color: '#64748b',
    position: 'custom',
    font: 'Arial, sans-serif',
    size: 1.2,
    x: 50,
    y: 60
  }
];

// 组合模板 - 每个模板包含标题、副标题和按钮样式
export const combinedTemplates: CombinedTemplate[] = [
  // 1. 简约风格
  {
    name: '简约风格',
    buttonStyle: buttonTemplates[0],
    textStyles: [
      {
        id: 'combined_simple_title',
        text: '精选好物',
        color: '#000000',
        position: 'top',
        font: 'Arial, sans-serif',
        size: 1.2
      },
      {
        id: 'combined_simple_subtitle',
        text: '品质保证 · 限时优惠',
        color: '#64748b',
        position: 'bottom',
        font: 'Arial, sans-serif',
        size: 0.9
      }
    ]
  },
  
  // 2. 黑色极简
  {
    name: '黑色极简',
    buttonStyle: buttonTemplates[1],
    textStyles: [
      {
        id: 'combined_minimal_title',
        text: 'NEW COLLECTION',
        color: '#000000',
        position: 'top',
        font: 'Arial, sans-serif',
        size: 1.2
      },
      {
        id: 'combined_minimal_subtitle',
        text: 'Premium Quality',
        color: '#64748b',
        position: 'bottom',
        font: 'Arial, sans-serif',
        size: 0.9
      }
    ]
  },
  
  // 3. 促销风格
  {
    name: '促销风格',
    buttonStyle: buttonTemplates[2],
    textStyles: [
      {
        id: 'combined_promo_title',
        text: '限时特惠',
        color: '#ef4444',
        position: 'top',
        font: "'Microsoft YaHei', sans-serif",
        size: 1.3
      },
      {
        id: 'combined_promo_subtitle',
        text: '折扣高达50%',
        color: '#ef4444',
        position: 'bottom',
        font: 'Arial, sans-serif',
        size: 0.9
      }
    ]
  },
  
  // 4. 清新风格
  {
    name: '清新风格',
    buttonStyle: buttonTemplates[3],
    textStyles: [
      {
        id: 'combined_fresh_title',
        text: '春季新品',
        color: '#10b981',
        position: 'top',
        font: 'Arial, sans-serif',
        size: 1.2
      },
      {
        id: 'combined_fresh_subtitle',
        text: '舒适自然 · 品质生活',
        color: '#64748b',
        position: 'bottom',
        font: 'Arial, sans-serif',
        size: 0.9
      }
    ]
  },
  
  // 5. 高端风格
  {
    name: '高端风格',
    buttonStyle: buttonTemplates[4],
    textStyles: [
      {
        id: 'combined_premium_title',
        text: '尊享系列',
        color: '#1e293b',
        position: 'top',
        font: "'Times New Roman', serif",
        size: 1.2
      },
      {
        id: 'combined_premium_subtitle',
        text: '匠心工艺 · 品质非凡',
        color: '#1e293b',
        position: 'bottom',
        font: "'Times New Roman', serif",
        size: 0.9
      }
    ]
  },
  
  // 6. 时尚风格
  {
    name: '时尚风格',
    buttonStyle: buttonTemplates[7],
    textStyles: [
      {
        id: 'combined_fashion_title',
        text: 'FASHION',
        color: '#000000',
        position: 'top',
        font: 'Arial, sans-serif',
        size: 1.4
      },
      {
        id: 'combined_fashion_subtitle',
        text: 'NEW COLLECTION 2024',
        color: '#64748b',
        position: 'bottom',
        font: 'Arial, sans-serif',
        size: 0.9
      }
    ]
  },
  
  // 7. 珠宝风格
  {
    name: '珠宝风格',
    buttonStyle: buttonTemplates[16],
    textStyles: [
      {
        id: 'combined_jewelry_title',
        text: '臻品珠宝',
        color: '#1e293b',
        position: 'top',
        font: 'Georgia, serif',
        size: 1.3
      },
      {
        id: 'combined_jewelry_subtitle',
        text: '独家限量发售',
        color: '#1e293b',
        position: 'bottom',
        font: 'Georgia, serif',
        size: 0.9
      }
    ]
  },
  
  // 8. 科技风格
  {
    name: '科技风格',
    buttonStyle: buttonTemplates[14],
    textStyles: [
      {
        id: 'combined_tech_title',
        text: '智能科技',
        color: '#0ea5e9',
        position: 'top',
        font: 'Arial, sans-serif',
        size: 1.2
      },
      {
        id: 'combined_tech_subtitle',
        text: '改变生活 · 引领未来',
        color: '#64748b',
        position: 'bottom',
        font: 'Arial, sans-serif',
        size: 0.9
      }
    ]
  },
  
  // 9. 美妆风格
  {
    name: '美妆风格',
    buttonStyle: buttonTemplates[13],
    textStyles: [
      {
        id: 'combined_beauty_title',
        text: '焕新美肌',
        color: '#9d174d',
        position: 'top',
        font: "'Microsoft YaHei', sans-serif",
        size: 1.2
      },
      {
        id: 'combined_beauty_subtitle',
        text: '自然呵护 · 绽放光彩',
        color: '#64748b',
        position: 'bottom',
        font: "'Microsoft YaHei', sans-serif",
        size: 0.9
      }
    ]
  },
  
  // 10. 家居风格
  {
    name: '家居风格',
    buttonStyle: buttonTemplates[15],
    textStyles: [
      {
        id: 'combined_home_title',
        text: '舒适家居',
        color: '#10b981',
        position: 'top',
        font: 'Arial, sans-serif',
        size: 1.2
      },
      {
        id: 'combined_home_subtitle',
        text: '品质生活 · 从家开始',
        color: '#64748b',
        position: 'bottom',
        font: 'Arial, sans-serif',
        size: 0.9
      }
    ]
  },
  
  // 11. 食品风格
  {
    name: '食品风格',
    buttonStyle: buttonTemplates[11],
    textStyles: [
      {
        id: 'combined_food_title',
        text: '美食臻选',
        color: '#000000',
        position: 'top',
        font: "'Microsoft YaHei', sans-serif",
        size: 1.2
      },
      {
        id: 'combined_food_subtitle',
        text: '新鲜食材 · 健康生活',
        color: '#64748b',
        position: 'bottom',
        font: 'Arial, sans-serif',
        size: 0.9
      }
    ]
  },
  
  // 12. 旅行风格
  {
    name: '旅行风格',
    buttonStyle: {
      backgroundColor: '#0369a1',
      textColor: '#ffffff',
      borderRadius: '8px',
      padding: '12px 24px',
      textOptions: ['探索世界', 'Explore', '开始旅程'],
      font: 'Arial, sans-serif',
      size: 1
    },
    textStyles: [
      {
        id: 'combined_travel_title',
        text: '探索世界',
        color: '#0369a1',
        position: 'top',
        font: 'Arial, sans-serif',
        size: 1.3
      },
      {
        id: 'combined_travel_subtitle',
        text: '开启旅程 · 发现未知',
        color: '#64748b',
        position: 'bottom',
        font: 'Arial, sans-serif',
        size: 0.9
      }
    ]
  },
  
  // 13. 运动风格
  {
    name: '运动风格',
    buttonStyle: buttonTemplates[8],
    textStyles: [
      {
        id: 'combined_sport_title',
        text: '专业运动',
        color: '#000000',
        position: 'top',
        font: 'Arial, sans-serif',
        size: 1.2
      },
      {
        id: 'combined_sport_subtitle',
        text: '突破极限 · 挑战自我',
        color: '#64748b',
        position: 'bottom',
        font: 'Arial, sans-serif',
        size: 0.9
      }
    ]
  },
  
  // 14. 电子产品风格
  {
    name: '电子产品风格',
    buttonStyle: buttonTemplates[12],
    textStyles: [
      {
        id: 'combined_electronic_title',
        text: '智能科技',
        color: '#0f172a',
        position: 'top',
        font: "'Microsoft YaHei', sans-serif",
        size: 1.2
      },
      {
        id: 'combined_electronic_subtitle',
        text: '创新体验 · 品质生活',
        color: '#64748b',
        position: 'bottom',
        font: "'Microsoft YaHei', sans-serif",
        size: 0.9
      }
    ]
  },
  
  // 15. 儿童产品风格
  {
    name: '儿童产品风格',
    buttonStyle: buttonTemplates[3],
    textStyles: [
      {
        id: 'combined_kids_title',
        text: '快乐童年',
        color: '#4ade80',
        position: 'top',
        font: 'Arial, sans-serif',
        size: 1.2
      },
      {
        id: 'combined_kids_subtitle',
        text: '安全呵护 · 健康成长',
        color: '#64748b',
        position: 'bottom',
        font: 'Arial, sans-serif',
        size: 0.9
      }
    ]
  },
  
  // 16. 书籍风格
  {
    name: '书籍风格',
    buttonStyle: buttonTemplates[19],
    textStyles: [
      {
        id: 'combined_book_title',
        text: '阅读之美',
        color: '#1e293b',
        position: 'top',
        font: 'Georgia, serif',
        size: 1.2
      },
      {
        id: 'combined_book_subtitle',
        text: '知识探索 · 心灵成长',
        color: '#64748b',
        position: 'bottom',
        font: 'Georgia, serif',
        size: 0.9
      }
    ]
  },
  
  // 17. 音乐风格
  {
    name: '音乐风格',
    buttonStyle: {
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      borderRadius: '8px',
      padding: '12px 24px',
      textOptions: ['立即体验', 'Listen Now', '音乐盛宴'],
      font: 'Arial, sans-serif',
      size: 1
    },
    textStyles: [
      {
        id: 'combined_music_title',
        text: '音乐盛宴',
        color: '#3b82f6',
        position: 'top',
        font: 'Arial, sans-serif',
        size: 1.2
      },
      {
        id: 'combined_music_subtitle',
        text: '沉浸体验 · 畅享音乐',
        color: '#64748b',
        position: 'bottom',
        font: 'Arial, sans-serif',
        size: 0.9
      }
    ]
  },
  
  // 18. 艺术风格
  {
    name: '艺术风格',
    buttonStyle: buttonTemplates[17],
    textStyles: [
      {
        id: 'combined_art_title',
        text: '艺术臻品',
        color: '#000000',
        position: 'top',
        font: 'Georgia, serif',
        size: 1.2
      },
      {
        id: 'combined_art_subtitle',
        text: '独特创意 · 艺术生活',
        color: '#1e293b',
        position: 'bottom',
        font: 'Georgia, serif',
        size: 0.9
      }
    ]
  },
  
  // 19. 健康风格
  {
    name: '健康风格',
    buttonStyle: buttonTemplates[15],
    textStyles: [
      {
        id: 'combined_health_title',
        text: '健康生活',
        color: '#10b981',
        position: 'top',
        font: 'Arial, sans-serif',
        size: 1.2
      },
      {
        id: 'combined_health_subtitle',
        text: '自然呵护 · 品质保障',
        color: '#64748b',
        position: 'bottom',
        font: 'Arial, sans-serif',
        size: 0.9
      }
    ]
  },
  
  // 20. 奢华风格
  {
    name: '奢华风格',
    buttonStyle: buttonTemplates[16],
    textStyles: [
      {
        id: 'combined_luxury_title',
        text: '奢华体验',
        color: '#000000',
        position: 'top',
        font: 'Georgia, serif',
        size: 1.3
      },
      {
        id: 'combined_luxury_subtitle',
        text: '尊贵品质 · 非凡体验',
        color: '#1e293b',
        position: 'bottom',
        font: 'Georgia, serif',
        size: 0.9
      }
    ]
  }
]; 