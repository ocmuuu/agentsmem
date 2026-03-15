'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/components/I18nProvider';

export default function ResetPasswordPage() {
  const { t } = useTranslations();
  useEffect(() => {
    document.title = `${t('resetPassword.metaTitle')} | AgentsMem`;
  }, [t]);

  const [apiKey, setApiKey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canSubmit =
    apiKey.trim() &&
    email.trim() &&
    password.length >= 6 &&
    password === passwordConfirm &&
    !loading;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      setError(null);
      setSuccess(false);
      setLoading(true);
      try {
        const res = await fetch('/api/v1/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: apiKey.trim(),
            email: email.trim(),
            password,
            password_confirm: passwordConfirm,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string; hint?: string };
        if (!res.ok) {
          setError(data.hint || data.error || t('resetPassword.error'));
          setLoading(false);
          return;
        }
        setSuccess(true);
      } catch {
        setError(t('resetPassword.error'));
      } finally {
        setLoading(false);
      }
    },
    [apiKey, email, password, passwordConfirm, canSubmit, t]
  );

  return (
    <div className="min-h-full flex-1 bg-gradient-to-b from-sky-50 to-white px-4 py-10 sm:py-14 flex items-start justify-center">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4" aria-hidden>
            🔑
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{t('resetPassword.title')}</h1>
          <p className="text-slate-600 text-sm">{t('resetPassword.subtitle')}</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">{t('resetPassword.success')}</p>
            </div>
            <Link
              href="/login"
              className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
            >
              {t('resetPassword.loginLink')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-apikey" className="sr-only">
                {t('resetPassword.apiKeyLabel')}
              </label>
              <input
                id="reset-apikey"
                type="password"
                autoComplete="off"
                placeholder={t('resetPassword.apiKeyLabel')}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="text-xs text-slate-500 mt-1">{t('resetPassword.apiKeyHint')}</p>
            </div>
            <div>
              <label htmlFor="reset-email" className="sr-only">
                {t('resetPassword.emailLabel')}
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder={t('resetPassword.emailLabel')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="text-xs text-slate-500 mt-1">{t('resetPassword.emailHint')}</p>
            </div>
            <div>
              <label htmlFor="reset-password" className="sr-only">
                {t('resetPassword.passwordLabel')}
              </label>
              <input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                placeholder={t('resetPassword.passwordLabel')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label htmlFor="reset-password-confirm" className="sr-only">
                {t('resetPassword.passwordConfirmLabel')}
              </label>
              <input
                id="reset-password-confirm"
                type="password"
                autoComplete="new-password"
                placeholder={t('resetPassword.passwordConfirmLabel')}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
              {loading ? t('resetPassword.loading') : t('resetPassword.submit')}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-600">
            {t('resetPassword.rememberPassword')}{' '}
            <Link className="text-teal-600 hover:text-teal-700 hover:underline" href="/login">
              {t('resetPassword.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
