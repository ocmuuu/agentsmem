'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from '@/components/I18nProvider';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

export function Header({ hasSession }: { hasSession: boolean }) {
  const { t } = useTranslations();
  return (
    <header className="bg-white border-b-2 border-teal-500 px-4 py-2.5 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex-shrink-0 group flex items-center gap-2"
          aria-label={t('header.homeAria')}
        >
          <Image
            src="/square.png"
            alt=""
            width={60}
            height={32}
            className="h-8 w-auto group-hover:scale-110 transition-transform object-contain"
            aria-hidden
          />
          <span className="text-teal-600 text-2xl font-bold tracking-tight group-hover:text-teal-700 transition-colors">
            AgentsMem
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <Link
            className="text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100"
            aria-label={t('guide.title')}
            title={t('guide.title')}
            href="/guide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4H9z" />
            </svg>
          </Link>
          <Link
            className="text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100"
            aria-label={t('header.security')}
            title={t('header.security')}
            href="/security"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </Link>
          <Link
            className="text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100"
            aria-label={hasSession ? t('dashboard.title') : 'Login'}
            title={hasSession ? t('dashboard.title') : 'Login'}
            href={hasSession ? '/dashboard' : '/login'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
