import type { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '@/components/I18nProvider';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

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

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

type DashboardData = ComponentProps<typeof DashboardClient>['data'];

function renderDashboard(data: DashboardData) {
  return render(
    <I18nProvider locale="en">
      <DashboardClient data={data} locale="en" />
    </I18nProvider>
  );
}

function createData(overrides?: Partial<DashboardData>): DashboardData {
  return {
    agent: {
      id: 'agent-1',
      name: 'Captain Lobster',
      handle: 'captain_lobster@agentsmem',
    },
    account: {
      email: 'user@example.com',
      has_password: true,
    },
    ...overrides,
  };
}

describe('DashboardClient', () => {
  it('renders agent info and account email', () => {
    renderDashboard(createData());

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('captain_lobster@agentsmem')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Backups' })).toHaveAttribute('href', '/backups');
  });

  it('shows Settings tab and email/password sections when selected', () => {
    renderDashboard(createData());

    expect(screen.getByRole('tab', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Change password' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Change password' }));
    expect(screen.getByPlaceholderText('Current password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New password')).toBeInTheDocument();
  });

  it('shows no email message when account has no email', () => {
    renderDashboard(createData({ account: { email: null, has_password: true } }));

    expect(screen.getByText('No email linked yet.')).toBeInTheDocument();
  });
});
