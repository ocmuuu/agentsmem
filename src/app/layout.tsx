import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import Script from 'next/script';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { I18nProvider } from '@/components/I18nProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getMessages } from '@/i18n/translations';
import { LOCALE_COOKIE_NAME, localeMetadata, resolveLocale } from '@/i18n/locale';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const SITE_URL = 'https://agentsmem.com';
const SESSION_COOKIE_NAME = 'agentsmem_session';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const cookieStore = await cookies();
  const locale = resolveLocale({
    headerLocale: headersList.get('x-locale'),
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: headersList.get('accept-language'),
  });
  const t = getMessages(locale);
  const localeMeta = localeMetadata[locale];
  const title = t['meta.title'];
  const description = t['meta.description'];
  const ogImageUrl = `${SITE_URL}/og-image.png`;
  return {
    title: { default: title, template: `%s | AgentsMem` },
    description,
    keywords: ['AI', 'agents', 'AgentsMem', 'memory', 'backup'],
    authors: [{ name: 'AgentsMem' }],
    creator: 'AgentsMem',
    metadataBase: new URL(SITE_URL),
    openGraph: {
      type: 'website',
      locale: localeMeta.ogLocale,
      url: SITE_URL,
      siteName: 'AgentsMem',
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'AgentsMem', secureUrl: ogImageUrl }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImageUrl] },
    icons: {
      icon: `${SITE_URL}/favicon.ico`,
      shortcut: `${SITE_URL}/favicon-16x16.png`,
      apple: `${SITE_URL}/apple-touch-icon.png`,
    },
    manifest: `${SITE_URL}/site.webmanifest`,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const cookieStore = await cookies();
  const hasSession = cookieStore.has(SESSION_COOKIE_NAME);
  const locale = resolveLocale({
    headerLocale: headersList.get('x-locale'),
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: headersList.get('accept-language'),
  });
  return (
    <html lang={localeMetadata[locale].htmlLang} suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-FVVYTQ7490" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FVVYTQ7490');
          `}
        </Script>
        <Providers>
          <I18nProvider locale={locale}>
            <Header hasSession={hasSession} />
            <main className="flex min-h-0 flex-1 flex-col">{children}</main>
            <Footer />
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
