import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// 定义window.plausible类型
declare global {
  interface Window {
    plausible: (eventName: string, options?: { callback?: VoidFunction; props?: Record<string, any> }) => void;
  }
}

type PageViewProps = {
  pagePath?: string;
  pageTitle?: string;
};

/**
 * 使用Plausible追踪页面浏览的自定义钩子
 * @param pageProps 页面属性，可以包含pagePath和pageTitle
 */
export default function usePageTracking(pageProps?: PageViewProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // 确保plausible已加载
    if (typeof window !== 'undefined' && window.plausible) {
      const url = searchParams?.toString()
        ? `${pathname}?${searchParams?.toString()}`
        : pathname;
        
      // 自定义页面路径，如果未提供则使用当前路径
      const pagePath = pageProps?.pagePath || url;
      const referrer = document.referrer;
      const referrerDomain = referrer ? new URL(referrer).hostname : null;
      
      // 追踪页面浏览
      window.plausible('pageview', { 
        props: { 
          path: pagePath,
          title: pageProps?.pageTitle || document.title,
          referrer: referrer || 'direct',
          referrer_domain: referrerDomain || 'direct'
        } 
      });
    }
  }, [pathname, searchParams, pageProps]);
  
  // 提供一个函数用于手动触发页面浏览事件
  const trackPageView = (customProps?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('pageview', { 
        props: { 
          ...customProps,
          manual_trigger: true 
        } 
      });
    }
  };
  
  // 返回trackPageView函数，方便在组件中手动触发
  return { trackPageView };
} 