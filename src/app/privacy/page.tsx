'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/components/I18nProvider';

export default function PrivacyPage() {
  const { t } = useTranslations();

  useEffect(() => {
    document.title = `${t('privacy.title')} | AgentsMem`;
  }, [t]);

  return (
    <div className="min-h-full flex-1 bg-gradient-to-b from-sky-50 to-white px-4 py-10 sm:py-14">
      <article className="mx-auto max-w-3xl text-slate-700">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">{t('privacy.title')}</h1>
          <p className="mt-2 text-sm text-slate-600">{t('privacy.lastUpdated')}</p>
        </header>

        <p className="mb-6 leading-relaxed">{t('privacy.intro')}</p>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('privacy.s1')}</h2>
          <h3 className="mb-2 text-base font-medium text-slate-700">{t('privacy.s1_1')}</h3>
          <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('privacy.s1_1_account')}</li>
            <li>{t('privacy.s1_1_agent')}</li>
            <li>{t('privacy.s1_1_content')}</li>
          </ul>
          <h3 className="mb-2 text-base font-medium text-slate-700">{t('privacy.s1_2')}</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('privacy.s1_2_usage')}</li>
            <li>{t('privacy.s1_2_device')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('privacy.s2')}</h2>
          <p className="mb-2 text-sm leading-relaxed">{t('privacy.s2_basis')}</p>
          <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('privacy.s2_contract')}</li>
            <li>{t('privacy.s2_interest')}</li>
            <li>{t('privacy.s2_consent')}</li>
          </ul>
          <p className="mb-2 text-sm leading-relaxed">{t('privacy.s2_we')}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('privacy.s2_list1')}</li>
            <li>{t('privacy.s2_list2')}</li>
            <li>{t('privacy.s2_list3')}</li>
            <li>{t('privacy.s2_list4')}</li>
            <li>{t('privacy.s2_list5')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('privacy.s3')}</h2>
          <p className="mb-2 text-sm leading-relaxed">{t('privacy.s3_intro')}</p>
          <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('privacy.s3_vercel')}</li>
            <li>{t('privacy.s3_db')}</li>
            <li>{t('privacy.s3_twitter')}</li>
          </ul>
          <p className="text-sm leading-relaxed">{t('privacy.s3_no_sell')}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('privacy.s4')}</h2>
          <p className="text-sm leading-relaxed">{t('privacy.s4_content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('privacy.s5')}</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('privacy.s5_account')}</li>
            <li>{t('privacy.s5_content')}</li>
            <li>{t('privacy.s5_logs')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('privacy.s6')}</h2>
          <h3 className="mb-2 text-base font-medium text-slate-700">{t('privacy.s6_1')}</h3>
          <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('privacy.s6_1_list1')}</li>
            <li>{t('privacy.s6_1_list2')}</li>
            <li>{t('privacy.s6_1_list3')}</li>
          </ul>
          <h3 className="mb-2 text-base font-medium text-slate-700">{t('privacy.s6_2')}</h3>
          <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('privacy.s6_2_access')}</li>
            <li>{t('privacy.s6_2_rectify')}</li>
            <li>{t('privacy.s6_2_erasure')}</li>
            <li>{t('privacy.s6_2_portability')}</li>
            <li>{t('privacy.s6_2_object')}</li>
            <li>{t('privacy.s6_2_restrict')}</li>
            <li>{t('privacy.s6_2_withdraw')}</li>
            <li>{t('privacy.s6_2_complaint')}</li>
          </ul>
          <h3 className="mb-2 text-base font-medium text-slate-700">{t('privacy.s6_3')}</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('privacy.s6_3_know')}</li>
            <li>{t('privacy.s6_3_delete')}</li>
            <li>{t('privacy.s6_3_optout')}</li>
            <li>{t('privacy.s6_3_nondisc')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('privacy.s7')}</h2>
          <p className="mb-2 text-sm leading-relaxed">{t('privacy.s7_intro')}</p>
          <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('privacy.s7_auth')}</li>
            <li>{t('privacy.s7_security')}</li>
          </ul>
          <p className="text-sm leading-relaxed">{t('privacy.s7_no_ads')}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('privacy.s8')}</h2>
          <p className="text-sm leading-relaxed">{t('privacy.s8_content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('privacy.s9')}</h2>
          <p className="text-sm leading-relaxed">{t('privacy.s9_content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('privacy.s10')}</h2>
          <p className="text-sm leading-relaxed">{t('privacy.s10_content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('privacy.s11')}</h2>
          <p className="mb-2 text-sm leading-relaxed">{t('privacy.s11_intro')}</p>
          <p className="mb-2 text-sm leading-relaxed">
            <a href="mailto:privacy@agentsmem.com" className="text-teal-600 hover:text-teal-700 hover:underline">
              {t('privacy.s11_email')}
            </a>
          </p>
          <p className="mb-2 text-sm leading-relaxed">{t('privacy.s11_response')}</p>
          <p className="text-sm leading-relaxed">{t('privacy.s11_eu')}</p>
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
