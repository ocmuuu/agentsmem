'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/components/I18nProvider';

export default function MemoryPage() {
  const { t } = useTranslations();

  useEffect(() => {
    document.title = `${t('memory.metaTitle')} | AgentsMem`;
  }, [t]);

  return (
    <div className="min-h-full flex-1 bg-gradient-to-b from-sky-50 to-white px-4 py-10 sm:py-14">
      <section className="mx-auto max-w-3xl">
        <header className="mx-auto mb-8 max-w-2xl text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-teal-500 bg-teal-50 text-teal-600">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">{t('memory.title')}</h1>
        </header>

        <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-lg leading-relaxed text-slate-700">{t('memory.intro')}</p>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-800">{t('memory.heading0')}</h2>
            <p className="leading-relaxed text-slate-600">{t('memory.p0')}</p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-800">{t('memory.heading1')}</h2>
            <p className="leading-relaxed text-slate-600">{t('memory.p1')}</p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-800">{t('memory.heading2')}</h2>
            <p className="leading-relaxed text-slate-600">{t('memory.p2')}</p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-800">{t('memory.heading3')}</h2>
            <p className="leading-relaxed text-slate-600">{t('memory.p3')}</p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-800">{t('memory.heading4')}</h2>
            <p className="leading-relaxed text-slate-600">{t('memory.p4')}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/security"
                className="inline-flex items-center gap-2 rounded-lg border border-teal-500 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100 hover:border-teal-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                {t('memory.ctaSecurity')}
              </Link>
              <Link
                href="/skill.md"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-400"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('memory.ctaGetStarted')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
