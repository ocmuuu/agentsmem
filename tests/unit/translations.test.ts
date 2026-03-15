import { getMessages } from '@/i18n/translations';

describe('translation fallbacks', () => {
  it('returns the new dashboard back label in English', () => {
    expect(getMessages('en')['dashboard.backToList']).toBe('Back to conversations');
  });

  it('returns the dashboard back label override in Chinese', () => {
    expect(getMessages('zh')['dashboard.backToList']).toBe('返回会话列表');
  });

  it('falls back to English for locales without the new override', () => {
    expect(getMessages('fr')['dashboard.backToList']).toBe('Back to conversations');
  });
});
