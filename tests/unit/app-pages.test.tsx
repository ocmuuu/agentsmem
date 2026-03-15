import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '@/components/I18nProvider';
import ErrorPage from '@/app/error';
import LoadingPage from '@/app/loading';
import NotFoundPage from '@/app/not-found';
import PrivacyPage from '@/app/privacy/page';
import TermsPage from '@/app/terms/page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function renderWithI18n(node: React.ReactNode) {
  return render(<I18nProvider locale="en">{node}</I18nProvider>);
}

describe('app pages', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the loading page', () => {
    render(<LoadingPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the not found page with a home link', () => {
    render(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go home/i })).toHaveAttribute('href', '/');
  });

  it('renders the error page and allows retrying', () => {
    const reset = jest.fn();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<ErrorPage error={Object.assign(new Error('boom'), { digest: 'digest-1' })} reset={reset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/Error ID: digest-1/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

    expect(reset).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith('Application error:', expect.any(Error));
  });

  it('renders the privacy page and updates the document title', () => {
    renderWithI18n(<PrivacyPage />);

    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /AgentsMem home/i })).toHaveAttribute('href', '/');
    expect(document.title).toBe('Privacy Policy | AgentsMem');
  });

  it('renders the terms page and updates the document title', () => {
    renderWithI18n(<TermsPage />);

    expect(screen.getByRole('heading', { name: 'Terms of Service' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /AgentsMem home/i })).toHaveAttribute('href', '/');
    expect(document.title).toBe('Terms of Service | AgentsMem');
  });
});
