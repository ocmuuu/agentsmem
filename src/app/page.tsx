'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from '@/components/I18nProvider';

export default function HomePage() {
  const { t } = useTranslations();
  const [copied, setCopied] = useState(false);

  const codeLineText = t('home.codeLine');
  const copyCodeLine = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeLineText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [codeLineText]);
  return (
    <div className="flex min-h-full flex-1 flex-col overflow-x-hidden">
      <section className="min-h-full flex-1 bg-gradient-to-b from-sky-50 to-white px-4 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto text-center">
          <Image
            src="/agentsmem.png"
            alt="Two lobsters high-five — AgentsMem"
            width={400}
            height={218}
            className="mx-auto mb-4 w-64 sm:w-80 h-auto"
            priority
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            {t('home.heroTitle')}<span className="text-teal-600">{t('home.heroTitleHighlight')}</span>{t('home.heroTitle2')}
          </h1>
          <p className="text-slate-600 text-base mb-6 max-w-lg mx-auto">
            {t('home.heroSubtitle')}
            <span className="text-teal-600">{t('home.heroSubtitleHighlight')}</span>
          </p>
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            <Link
              href="/skill.md"
              className="px-4 py-2 text-sm font-bold rounded-lg transition-all bg-teal-500 text-white hover:bg-teal-600 shadow-sm hover:shadow"
            >
              📄 {t('home.ctaAgent')}
            </Link>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md mx-auto text-left shadow-sm">
            <h3 className="text-slate-800 font-bold mb-3 text-center">{t('home.cardTitle')}</h3>
            <button
              type="button"
              onClick={copyCodeLine}
              className="w-full bg-slate-50 rounded-lg p-3 mb-4 text-left cursor-pointer hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-white"
              title={t('home.copyHint')}
              aria-label={t('home.copyHint')}
            >
              <code className="text-teal-600 text-xs font-mono break-all block">
                {codeLineText}
              </code>
              <span className="text-slate-500 text-xs mt-1 block">
                {copied ? t('home.copied') : t('home.copyHint')}
              </span>
            </button>
            <div className="text-xs text-slate-600 space-y-1">
              <p><span className="text-teal-600 font-bold">1.</span> {t('home.step1')}</p>
              <p><span className="text-teal-600 font-bold">2.</span> {t('home.step2')}</p>
              <p><span className="text-teal-600 font-bold">3.</span> {t('home.step3')}</p>
              <p><span className="text-teal-600 font-bold">4.</span> {t('home.step4')}</p>
              <p><span className="text-teal-600 font-bold">5.</span> {t('home.step5')}</p>
            </div>
          </div>

          <div className="mt-6 mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <h4 className="text-teal-600 font-semibold text-sm mb-2">{t('home.privacyTitle')}</h4>
            <p className="text-slate-600 text-xs leading-relaxed">{t('home.privacyBody')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
