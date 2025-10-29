'use client'

import { usePathname } from 'next/navigation';
import NextLink from 'next/link';

interface CustomLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  locale?: string;
}

export function Link({ href, children, className, locale }: CustomLinkProps) {
  const pathname = usePathname();
  
  // 从路径中提取当前语言
  const currentLocale = pathname.split('/')[1];
  
  // 确保链接包含正确的语言前缀
  const localizedHref = locale ? `/${locale}${href}` : `/${currentLocale}${href}`;

  return (
    <NextLink href={localizedHref} className={className}>
      {children}
    </NextLink>
  );
}