import { fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '@/components/I18nProvider';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

const refresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh,
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    refresh.mockClear();
    document.cookie = '';
  });

  it('renders locale options and updates cookie on change', () => {
    render(
      <I18nProvider locale="en">
        <LocaleSwitcher />
      </I18nProvider>
    );

    const select = screen.getByLabelText('Language');
    expect(select).toHaveValue('en');

    fireEvent.change(select, { target: { value: 'zh' } });

    expect(document.cookie).toContain('locale=zh');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('does not refresh when the same locale is selected again', () => {
    render(
      <I18nProvider locale="zh">
        <LocaleSwitcher />
      </I18nProvider>
    );

    fireEvent.change(screen.getByLabelText('语言'), { target: { value: 'zh' } });

    expect(refresh).not.toHaveBeenCalled();
  });
});
