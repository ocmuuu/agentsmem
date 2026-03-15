import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nProvider } from '@/components/I18nProvider';
import HomePage from '@/app/page';

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

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} {...props} />,
}));

function renderHome() {
  return render(
    <I18nProvider locale="en">
      <HomePage />
    </I18nProvider>
  );
}

describe('home page', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('copies the skill prompt to the clipboard', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderHome();

    fireEvent.click(screen.getByRole('button', { name: 'Click to copy' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });

    expect(screen.getByText('Copied')).toBeInTheDocument();
  });

});
