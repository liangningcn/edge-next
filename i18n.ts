import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// 支持的语言列表
export const locales = ["en", "de", "ja", "fr", "th", "es", "ru", "pt", "it", "nl", "pl", "ko", "id"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// 验证语言是否支持
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// 获取请求配置
export default getRequestConfig(async ({ locale }) => {
  // 验证语言支持
  if (!isValidLocale(locale)) {
    notFound();
  }

  try {
    const messages = (await import(`./locales/${locale}.json`)).default;
    return { messages };
  } catch (error) {
    // 如果找不到对应语言文件，回退到英语
    const messages = (await import(`./locales/en.json`)).default;
    return { messages };
  }
});