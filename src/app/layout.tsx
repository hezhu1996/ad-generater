import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./fonts.css"; // 导入字体CSS文件
import Script from "next/script"; // 导入Script组件

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 只保留描述，标题将由DynamicTitle组件动态设置
export const metadata: Metadata = {
  description: "上传您的产品图片，添加自定义文字和按钮样式，一键批量生成适合各大平台的专业广告和A/B测试图片",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="description" content="上传您的产品图片，添加自定义文字和按钮样式，一键批量生成适合各大平台的专业广告和A/B测试图片" />
        {/* Plausible Analytics - 自定义事件跟踪配置 */}
        <Script 
          defer 
          data-domain="rapidad.net" 
          src="https://plausible.io/js/script.outbound-links.js"
          data-api="https://plausible.io/api/event"
          strategy="afterInteractive"
        />
        {/* Plausible Analytics 自定义事件跟踪初始化 */}
        <Script id="plausible-custom-events" strategy="afterInteractive">
          {`
            window.plausible = window.plausible || function() { 
              (window.plausible.q = window.plausible.q || []).push(arguments);
            };
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
