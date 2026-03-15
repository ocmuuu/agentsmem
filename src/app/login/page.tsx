'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/components/I18nProvider';

export default function LoginPage() {
  const { t } = useTranslations();
  useEffect(() => {
    document.title = `${t('login.metaTitle')} | AgentsMem`;
  }, [t]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim() && password && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || t('login.error'));
        setLoading(false);
        return;
      }
      window.location.href = '/dashboard';
    } catch {
      setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex-1 bg-gradient-to-b from-sky-50 to-white px-4 py-10 sm:py-14 flex items-start justify-center">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center" aria-hidden>
            <img src="/square.png" alt="" className="h-14 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{t('login.title')}</h1>
          <p className="text-slate-600">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t('login.placeholderEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              aria-label={t('login.placeholderEmail')}
            />
          </div>
          <div>
            <input
              type="password"
              autoComplete="current-password"
              placeholder={t('login.placeholderPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              aria-label={t('login.placeholderPassword')}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            {loading ? t('login.loading') : t('login.submit')}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <Link
            href="/reset-password"
            className="block text-center text-sm text-teal-600 hover:text-teal-700 hover:underline"
          >
            {t('login.forgotPassword')}
          </Link>
          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              <Link className="text-teal-600 hover:text-teal-700 hover:underline" href="/guide">
                {t('login.noAgent')}{' '}
              </Link>
              {t('login.learnMore')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
