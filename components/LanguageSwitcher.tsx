'use client'

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' }
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  // 从路径中提取当前语言
  const currentLocale = pathname.split('/')[1] || 'en';

  function onLanguageChange(locale: string) {
    // 替换路径中的语言部分
    const newPathname = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, `/${locale}`);
    router.push(newPathname);
  }

  return (
    <div className="language-switcher">
      <select 
        value={currentLocale}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.native} ({language.name})
          </option>
        ))}
      </select>
    </div>
  );
}