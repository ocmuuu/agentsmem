import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { getMessages } from '@/i18n/translations';
import { LOCALE_COOKIE_NAME, resolveLocale } from '@/i18n/locale';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const cookieStore = await cookies();
  const locale = resolveLocale({
    headerLocale: headersList.get('x-locale'),
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: headersList.get('accept-language'),
  });

  return {
    title: getMessages(locale)['guide.metaTitle'],
  };
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
