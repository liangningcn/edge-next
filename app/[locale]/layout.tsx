import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';

export const metadata: Metadata = {
  title: 'TOP-Q Filler',
  description: 'Professional dermal filler solutions for aesthetic enhancement',
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // 验证语言支持
  if (!locales.includes(locale as string)) {
    notFound();
  }

  // 获取当前语言的消息
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

// export async function generateStaticParams() {
//  return locales.map((locale) => ({ locale }));
//}
