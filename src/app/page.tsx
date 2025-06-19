import AdGenerator from '@/components/AdGenerator'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI 广告图片生成器
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            上传您的产品图片，添加自定义文字和按钮样式，一键生成适合各大平台的专业广告图片
          </p>
        </div>
        <AdGenerator />
      </div>
    </div>
  );
}
