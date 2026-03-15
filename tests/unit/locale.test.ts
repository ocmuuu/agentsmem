import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  getLocaleFromAcceptLanguage,
  getLocaleFromCookie,
  isLocale,
  localeOptions,
  resolveLocale,
} from '@/i18n/locale';

describe('locale helpers', () => {
  it('falls back to the default locale when accept-language is missing', () => {
    expect(getLocaleFromAcceptLanguage(null)).toBe(DEFAULT_LOCALE);
  });

  it('picks the highest priority supported locale from accept-language', () => {
    expect(getLocaleFromAcceptLanguage('fr-CA;q=0.4, zh-CN;q=0.8, en-US;q=0.7')).toBe('zh');
  });

  it('falls back to English when accept-language contains only unsupported locales', () => {
    expect(getLocaleFromAcceptLanguage('it-IT, nl-NL;q=0.9')).toBe(DEFAULT_LOCALE);
  });

  it('validates locale values', () => {
    expect(isLocale('zh')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('it')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it('reads a valid locale from cookies', () => {
    const cookieStore = {
      get: (name: string) => (name === LOCALE_COOKIE_NAME ? { value: 'ja' } : undefined),
    };

    expect(getLocaleFromCookie(cookieStore)).toBe('ja');
  });

  it('falls back when the locale cookie is invalid', () => {
    const cookieStore = {
      get: () => ({ value: 'it' }),
    };

    expect(getLocaleFromCookie(cookieStore)).toBe(DEFAULT_LOCALE);
  });

  it('resolves locale by precedence: header, then cookie, then accept-language', () => {
    expect(
      resolveLocale({
        headerLocale: 'de',
        cookieLocale: 'zh',
        acceptLanguage: 'fr-FR, en;q=0.8',
      })
    ).toBe('de');

    expect(
      resolveLocale({
        headerLocale: 'invalid',
        cookieLocale: 'pt',
        acceptLanguage: 'fr-FR, en;q=0.8',
      })
    ).toBe('pt');

    expect(
      resolveLocale({
        headerLocale: null,
        cookieLocale: null,
        acceptLanguage: 'ru-RU, en;q=0.8',
      })
    ).toBe('ru');
  });

  it('exposes locale metadata as options', () => {
    expect(localeOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: 'zh',
          shortLabel: '中文',
          ogLocale: 'zh_CN',
        }),
      ])
    );
  });
});
