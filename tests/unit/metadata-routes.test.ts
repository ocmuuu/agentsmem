import { LOCALE_COOKIE_NAME } from '@/i18n/locale';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
  cookies: jest.fn(),
}));

import { cookies, headers } from 'next/headers';
import { generateMetadata as generatePrivacyMetadata } from '@/app/privacy/layout';
import { generateMetadata as generateTermsMetadata } from '@/app/terms/layout';

describe('metadata and manifest routes', () => {
  beforeEach(() => {
    jest.resetModules();
    (headers as jest.Mock).mockResolvedValue({
      get: (name: string) => {
        if (name === 'x-locale') return null;
        if (name === 'accept-language') return 'zh-CN,zh;q=0.9,en;q=0.8';
        return null;
      },
    });
    (cookies as jest.Mock).mockResolvedValue({
      get: (name: string) => (name === LOCALE_COOKIE_NAME ? { value: 'zh' } : undefined),
    });
  });

  it('generates localized metadata for the privacy page', async () => {
    await expect(generatePrivacyMetadata()).resolves.toEqual({
      title: '隐私政策',
    });
  });

  it('generates localized metadata for the terms page', async () => {
    await expect(generateTermsMetadata()).resolves.toEqual({
      title: '服务条款',
    });
  });

  it('builds the web manifest with localized content', async () => {
    (globalThis as { Response?: typeof Response }).Response =
      globalThis.Response ??
      (class {
        bodyValue: string;
        headers: Headers;

        constructor(body: string, init: { headers?: HeadersInit } = {}) {
          this.bodyValue = body;
          this.headers = new Headers(init.headers);
        }

        async text() {
          return this.bodyValue;
        }
      } as unknown as typeof Response);

    const { GET } = require('@/app/site.webmanifest/route') as typeof import('@/app/site.webmanifest/route');

    const response = GET({
      cookies: {
        get: (name: string) => (name === LOCALE_COOKIE_NAME ? { value: 'zh' } : undefined),
      },
      headers: new Headers({ 'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8' }),
    } as never);

    const manifest = JSON.parse(await response.text()) as { name: string; description: string };

    expect(response.headers.get('Content-Type')).toBe('application/manifest+json');
    expect(manifest.name).toContain('AgentsMem');
    expect(manifest.description).toContain('智能体');
  });
});
