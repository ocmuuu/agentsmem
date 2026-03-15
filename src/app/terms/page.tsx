'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/components/I18nProvider';

export default function TermsPage() {
  const { t } = useTranslations();

  useEffect(() => {
    document.title = `${t('terms.title')} | AgentsMem`;
  }, [t]);

  return (
    <div className="min-h-full flex-1 bg-gradient-to-b from-sky-50 to-white px-4 py-10 sm:py-14">
      <article className="mx-auto max-w-3xl text-slate-700">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">{t('terms.title')}</h1>
          <p className="mt-2 text-sm text-slate-600">{t('terms.lastUpdated')}</p>
        </header>

        <p className="mb-6 leading-relaxed">{t('terms.intro')}</p>

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('terms.s1')}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{t('terms.s1_body')}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('terms.s2')}</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('terms.s2_list1')}</li>
            <li>{t('terms.s2_list2')}</li>
            <li>{t('terms.s2_list3')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('terms.s3')}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{t('terms.s3_body')}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('terms.s4')}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{t('terms.s4_body')}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('terms.s5')}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{t('terms.s5_body')}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">{t('terms.s6')}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{t('terms.s6_body')}</p>
        </section>

        <p className="border-t border-slate-200 pt-6 text-sm text-slate-600">
          <Link href="/" className="text-teal-600 hover:text-teal-700 hover:underline">
            ← {t('header.homeAria')}
          </Link>
        </p>
      </article>
    </div>
  );
}
