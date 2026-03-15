import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { getMessages } from '@/i18n/translations';
import { LOCALE_COOKIE_NAME, resolveLocale } from '@/i18n/locale';

const BACKEND =
  process.env.AGENTSMEM_API_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3011' : 'http://127.0.0.1:3011');

type DashboardAgent = {
  id: string;
  name: string;
  handle: string;
  created_at: string;
};

type DashboardData = {
  agents: DashboardAgent[];
  account: {
    email: string | null;
    has_password: boolean;
  };
};

function buildCookieHeader(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join('; ');
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const cookieStore = await cookies();
  const locale = resolveLocale({
    headerLocale: headersList.get('x-locale'),
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: headersList.get('accept-language'),
  });

  return {
    title: getMessages(locale)['dashboard.metaTitle'],
  };
}

export default async function DashboardPage() {
  const headersList = await headers();
  const cookieStore = await cookies();
  const locale = resolveLocale({
    headerLocale: headersList.get('x-locale'),
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: headersList.get('accept-language'),
  });

  const cookieHeader = buildCookieHeader(cookieStore);
  if (!cookieHeader) {
    redirect('/login');
  }

  const response = await fetch(`${BACKEND}/api/v1/dashboard`, {
    headers: {
      cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  if (response.status === 401) {
    redirect('/login');
  }

  if (!response.ok) {
    throw new Error('Failed to load dashboard');
  }

  const data = (await response.json()) as DashboardData;

  return <DashboardClient data={data} locale={locale} />;
}
