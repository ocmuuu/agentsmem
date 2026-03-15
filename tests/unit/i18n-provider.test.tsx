import { render, screen } from '@testing-library/react';
import { I18nProvider, useTranslations } from '@/components/I18nProvider';

function TranslationProbe({ translationKey }: { translationKey: string }) {
  const { t, locale } = useTranslations();

  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="text">{t(translationKey)}</span>
    </div>
  );
}

describe('I18nProvider', () => {
  it('uses the default English fallback outside a provider', () => {
    render(<TranslationProbe translationKey="footer.terms" />);

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('text')).toHaveTextContent('Terms');
  });

  it('provides translated messages inside the provider', () => {
    render(
      <I18nProvider locale="zh">
        <TranslationProbe translationKey="footer.terms" />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('zh');
    expect(screen.getByTestId('text')).toHaveTextContent('条款');
  });

  it('falls back to English when a key is missing in the selected locale', () => {
    render(
      <I18nProvider locale="fr">
        <TranslationProbe translationKey="dashboard.backToList" />
      </I18nProvider>
    );

    expect(screen.getByTestId('text')).toHaveTextContent('Back to conversations');
  });
});
