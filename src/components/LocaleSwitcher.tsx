'use client';

import { useTransition, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/components/I18nProvider';
import { LOCALE_COOKIE_NAME, localeOptions } from '@/i18n/locale';
import type { Locale } from '@/i18n/translations';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function LocaleSwitcher() {
  const router = useRouter();
  const { locale, t } = useTranslations();
  const [isPending, startTransition] = useTransition();

  function handleLocaleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as Locale;
    if (next === locale) return;
    setLocaleCookie(next);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={handleLocaleChange}
        aria-label={t('header.language')}
        disabled={isPending}
        className="w-16 min-w-[4rem] appearance-none rounded-full border border-slate-200 bg-white py-1.5 pl-2.5 pr-5 text-xs text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-wait disabled:opacity-80"
      >
        {localeOptions.map((option) => (
          <option key={option.value} value={option.value} title={option.nativeLabel}>
            {option.shortLabel}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-500">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-3.5 w-3.5">
          <path d="m6 8 4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
