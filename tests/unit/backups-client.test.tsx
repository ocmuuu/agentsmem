import { fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '@/components/I18nProvider';
import { BackupsClient } from '@/components/backups/BackupsClient';

const refresh = jest.fn();

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
    refresh,
  }),
}));

describe('BackupsClient', () => {
  it('renders backup history and upload form', () => {
    render(
      <I18nProvider locale="en">
        <BackupsClient
          locale="en"
          initialItems={[
            {
              id: 'backup-1',
              file_id: 'file-1',
              user_id: 'user-1',
              agent_id: 'agent-1',
              agent_name: 'captain_lobster',
              file_name: 'state.bin',
              file_path: '/memories/state.bin',
              ciphertext_md5: '0123456789abcdef0123456789abcdef',
              file_size_bytes: 2048,
              content_type: 'application/octet-stream',
              timestamp: '2026-03-15T10:00:00.000Z',
            },
          ]}
        />
      </I18nProvider>
    );

    expect(screen.getByRole('heading', { name: 'Encrypted Backups' })).toBeInTheDocument();
    expect(screen.getByText('state.bin')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('href', '/api/v1/download/file-1');
    expect(screen.getByRole('button', { name: 'Upload backup' })).toBeDisabled();
  });

  it('enables upload when file and md5 are present', () => {
    render(
      <I18nProvider locale="en">
        <BackupsClient locale="en" initialItems={[]} />
      </I18nProvider>
    );

    const file = new File(['ciphertext'], 'cipher.bin', { type: 'application/octet-stream' });
    fireEvent.change(screen.getByLabelText('Encrypted file'), {
      target: { files: [file] },
    });
    fireEvent.change(screen.getByLabelText('Ciphertext MD5'), {
      target: { value: '0123456789abcdef0123456789abcdef' },
    });

    expect(screen.getByRole('button', { name: 'Upload backup' })).toBeEnabled();
  });
});
