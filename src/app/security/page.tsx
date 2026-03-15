'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/components/I18nProvider';

const GITHUB_REPO = 'https://github.com/ocmuuu/agentsmem';

export default function SecurityPage() {
  const { t } = useTranslations();

  useEffect(() => {
    document.title = `${t('security.metaTitle')} | AgentsMem`;
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">{t('security.title')}</h1>
        </header>

        <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-lg leading-relaxed text-slate-700">{t('security.intro')}</p>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-800">{t('security.heading0')}</h2>
            <p className="leading-relaxed text-slate-600">{t('security.p0')}</p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-800">{t('security.heading1')}</h2>
            <p className="leading-relaxed text-slate-600">{t('security.p1')}</p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-800">{t('security.heading2')}</h2>
            <p className="leading-relaxed text-slate-600">{t('security.p2')}</p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-800">{t('security.heading3')}</h2>
            <p className="leading-relaxed text-slate-600">{t('security.p3')}</p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-800">{t('security.heading4')}</h2>
            <p className="leading-relaxed text-slate-600">{t('security.p4')}</p>
            <p className="mt-3">
              <Link
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-teal-500 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100 hover:border-teal-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.22.682-.49 0-.24-.01-.88-.013-1.71-2.782.6-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.588.688.488A10.017 10.017 0 0022 12c0-5.523-4.477-10-10-10z" />
                </svg>
                {t('security.githubLink')}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
