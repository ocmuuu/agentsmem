import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Providers } from '@/components/providers';
import { I18nProvider } from '@/components/I18nProvider';

jest.mock('next/link', () => {
  return {
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
  };
});

jest.mock('next/image', () => {
  return {
    __esModule: true,
    default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} {...props} />,
  };
});

jest.mock('@/components/LocaleSwitcher', () => ({
  LocaleSwitcher: () => <div data-testid="locale-switcher">locale-switcher</div>,
}));

jest.mock('sonner', () => ({
  Toaster: () => <div data-testid="toaster">toaster</div>,
}));

function renderWithI18n(node: React.ReactNode) {
  return render(<I18nProvider locale="en">{node}</I18nProvider>);
}

describe('layout components', () => {
  it('renders footer navigation links', () => {
    renderWithI18n(<Footer />);

    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: 'Feedback' })).toHaveAttribute(
      'href',
      'https://github.com/AgentsMem/AgentsMem/issues'
    );
  });

  it('renders header actions for an authenticated user', () => {
    renderWithI18n(<Header hasSession />);

    expect(screen.getByLabelText('AgentsMem home')).toHaveAttribute('href', '/');
    expect(screen.getByLabelText('Backups')).toHaveAttribute('href', '/backups');
    expect(screen.getByLabelText('Typical AgentsMem Usage')).toHaveAttribute('href', '/guide');
    expect(screen.getByLabelText('Dashboard')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByTestId('locale-switcher')).toBeInTheDocument();
  });

  it('renders the login action when there is no session', () => {
    renderWithI18n(<Header hasSession={false} />);

    expect(screen.getByLabelText('Login')).toHaveAttribute('href', '/login');
  });

  it('renders providers children and toaster', () => {
    render(
      <Providers>
        <div>provider child</div>
      </Providers>
    );

    expect(screen.getByText('provider child')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});
