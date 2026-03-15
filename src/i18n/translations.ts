import type { Locale } from './types';
import { de } from './locales/de';
import { en, type TranslationKey } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { ja } from './locales/ja';
import { ko } from './locales/ko';
import { pt } from './locales/pt';
import { ru } from './locales/ru';
import { zh } from './locales/zh';

export type { Locale } from './types';
export type { TranslationKey } from './locales/en';

type TranslationOverrides = Partial<Record<TranslationKey, string>>;

export const messages: Record<Locale, TranslationOverrides> = {
  en,
  zh,
  es,
  fr,
  de,
  ja,
  ko,
  pt,
  ru,
};

export function getMessages(locale: Locale): Record<TranslationKey, string> {
  return { ...en, ...(messages[locale] ?? {}) } as Record<TranslationKey, string>;
}
