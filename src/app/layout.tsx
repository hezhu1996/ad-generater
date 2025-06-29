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

export const metadata: Metadata = {
  title: "批量广告图片生成器",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Nunito:wght@400;600;700&family=Raleway:wght@400;600;700&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&family=Work+Sans:wght@400;500;600&family=Oswald:wght@400;500;600&family=Bebas+Neue&family=Playfair+Display:wght@400;600;700&family=Merriweather:wght@400;700&family=Archivo+Black&family=Fjalla+One&family=Anton&family=Pacifico&family=Caveat:wght@400;600&family=Comfortaa:wght@400;600;700&display=swap" 
          rel="stylesheet"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+SC:wght@400;600;700&family=Noto+Serif+TC:wght@400;600;700&family=Zen+Old+Mincho:wght@400;500;700&family=Zen+Maru+Gothic:wght@400;500;700&display=swap" 
          rel="stylesheet"
        />
        {/* Plausible Analytics - 请替换 yourdomain.com 为您的实际域名 */}
        <Script 
          defer 
          data-domain="yourdomain.com" 
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
        {/* Plausible Analytics 自定义事件跟踪 */}
        <Script id="plausible-custom-events" strategy="afterInteractive">
          {`
            window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }
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
