import { NextRequest } from 'next/server';
import { getMessages } from '@/i18n/translations';
import { LOCALE_COOKIE_NAME, resolveLocale } from '@/i18n/locale';

export function GET(request: NextRequest) {
  const locale = resolveLocale({
    cookieLocale: request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: request.headers.get('accept-language'),
  });
  const t = getMessages(locale);

  const manifest = {
    name: t['meta.title'],
    short_name: 'AgentsMem',
    description: t['meta.description'],
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0d9488',
    icons: [
      { src: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { src: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
