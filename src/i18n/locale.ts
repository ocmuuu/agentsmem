import type { Locale } from './types';

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE_NAME = 'locale';

export const localeMetadata: Record<
  Locale,
  { label: string; nativeLabel: string; shortLabel: string; htmlLang: string; ogLocale: string }
> = {
  en: { label: 'English', nativeLabel: 'English', shortLabel: 'EN', htmlLang: 'en', ogLocale: 'en_US' },
  zh: { label: 'Chinese', nativeLabel: '简体中文', shortLabel: '中文', htmlLang: 'zh-Hans', ogLocale: 'zh_CN' },
  es: { label: 'Spanish', nativeLabel: 'Espanol', shortLabel: 'ES', htmlLang: 'es', ogLocale: 'es_ES' },
  fr: { label: 'French', nativeLabel: 'Francais', shortLabel: 'FR', htmlLang: 'fr', ogLocale: 'fr_FR' },
  de: { label: 'German', nativeLabel: 'Deutsch', shortLabel: 'DE', htmlLang: 'de', ogLocale: 'de_DE' },
  ja: { label: 'Japanese', nativeLabel: '日本語', shortLabel: 'JA', htmlLang: 'ja', ogLocale: 'ja_JP' },
  ko: { label: 'Korean', nativeLabel: '한국어', shortLabel: 'KO', htmlLang: 'ko', ogLocale: 'ko_KR' },
  pt: { label: 'Portuguese', nativeLabel: 'Portugues', shortLabel: 'PT', htmlLang: 'pt-BR', ogLocale: 'pt_BR' },
  ru: { label: 'Russian', nativeLabel: 'Русский', shortLabel: 'RU', htmlLang: 'ru', ogLocale: 'ru_RU' },
};

export const localeOptions = Object.entries(localeMetadata).map(([value, meta]) => ({
  value: value as Locale,
  ...meta,
}));

/**
 * Parse Accept-Language and return the closest supported locale.
 */
export function getLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const candidates = acceptLanguage
    .split(',')
    .map((entry) => {
      const [tagPart, ...params] = entry.trim().toLowerCase().split(';');
      const qValue = params.find((param) => param.trim().startsWith('q='))?.split('=')[1];
      const quality = Number.parseFloat(qValue ?? '1');
      return {
        tag: tagPart.trim(),
        quality: Number.isFinite(quality) ? quality : 1,
      };
    })
    .filter((entry) => entry.tag)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of candidates) {
    if (tag.startsWith('zh')) return 'zh';
    if (tag.startsWith('es')) return 'es';
    if (tag.startsWith('fr')) return 'fr';
    if (tag.startsWith('de')) return 'de';
    if (tag.startsWith('ja')) return 'ja';
    if (tag.startsWith('ko')) return 'ko';
    if (tag.startsWith('pt')) return 'pt';
    if (tag.startsWith('ru')) return 'ru';
    if (tag.startsWith('en')) return 'en';
  }
  return DEFAULT_LOCALE;
}

export function isLocale(value: string | null | undefined): value is Locale {
  return typeof value === 'string' && value in localeMetadata;
}

/**
 * Read locale from cookie (set by middleware). Returns the default locale if missing or invalid.
 */
export function getLocaleFromCookie(cookieStore: { get: (name: string) => { value: string } | undefined }): Locale {
  const v = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

export function resolveLocale({
  headerLocale,
  cookieLocale,
  acceptLanguage,
}: {
  headerLocale?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (isLocale(headerLocale)) return headerLocale;
  if (isLocale(cookieLocale)) return cookieLocale;
  return getLocaleFromAcceptLanguage(acceptLanguage ?? null);
}
