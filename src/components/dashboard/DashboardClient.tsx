'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/components/I18nProvider';
import { BackupsClient } from '@/components/backups/BackupsClient';

type BackupItem = {
  id: string;
  file_id: string;
  user_id: string;
  agent_id: string;
  agent_name: string;
  file_name: string;
  file_path: string;
  ciphertext_md5: string;
  file_size_bytes: number;
  content_type: string;
  timestamp: string;
};

type DashboardData = {
  agent: {
    id: string;
    name: string;
    handle: string;
  };
  account: {
    email: string | null;
    has_password: boolean;
  };
  backups: { items: BackupItem[] };
};

export function DashboardClient({ data, locale }: { data: DashboardData; locale: string }) {
  const { t } = useTranslations();
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [accountFeedback, setAccountFeedback] = useState<{ kind: 'error' | 'success'; message: string } | null>(null);
  const [accountEmail, setAccountEmail] = useState(data.account.email ?? '');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountPasswordConfirm, setAccountPasswordConfirm] = useState('');
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordNewConfirm, setPasswordNewConfirm] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ kind: 'error' | 'success'; message: string } | null>(null);
  const [settingsPanel, setSettingsPanel] = useState<'email' | 'password'>('email');
  const [isPending, startTransition] = useTransition();
  const [isAccountPending, startAccountTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const requiresPasswordSetup = !data.account.has_password;
  const canSubmitAccount =
    accountEmail.trim() &&
    (requiresPasswordSetup
      ? accountPassword.length >= 6 && accountPassword === accountPasswordConfirm
      : accountPassword.length > 0) &&
    !isAccountPending;
  const canSubmitPassword =
    data.account.has_password &&
    passwordCurrent.length > 0 &&
    passwordNew.length >= 6 &&
    passwordNew === passwordNewConfirm &&
    !isPasswordPending;

  useEffect(() => {
    setAccountEmail(data.account.email ?? '');
  }, [data.account.email]);

  function handleLogout() {
    setFeedback(null);
    startTransition(async () => {
      try {
        const response = await fetch('/api/v1/logout', {
          method: 'POST',
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          setFeedback(data.error ?? t('dashboard.logoutError'));
          return;
        }

        router.push('/login');
        router.refresh();
      } catch {
        setFeedback(t('dashboard.logoutError'));
      }
    });
  }

  function handleAccountSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmitAccount) return;

    setAccountFeedback(null);
    startAccountTransition(async () => {
      try {
        const body = requiresPasswordSetup
          ? {
              email: accountEmail.trim(),
              password: accountPassword,
              password_confirm: accountPasswordConfirm,
            }
          : {
              email: accountEmail.trim(),
              current_password: accountPassword,
            };

        const response = await fetch('/api/v1/dashboard/account/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const result = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) {
          setAccountFeedback({ kind: 'error', message: result.error ?? t('dashboard.accountEmailError') });
          return;
        }

        setAccountPassword('');
        setAccountPasswordConfirm('');
        setAccountFeedback({ kind: 'success', message: t('dashboard.accountEmailSuccess') });
        router.refresh();
      } catch {
        setAccountFeedback({ kind: 'error', message: t('dashboard.accountEmailError') });
      }
    });
  }

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmitPassword) return;

    setPasswordFeedback(null);
    startPasswordTransition(async () => {
      try {
        const response = await fetch('/api/v1/dashboard/account/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_password: passwordCurrent,
            password: passwordNew,
            password_confirm: passwordNewConfirm,
          }),
        });

        const result = (await response.json().catch(() => ({}))) as { error?: string; hint?: string };
        if (!response.ok) {
          const msg =
            result.error === 'invalid_password'
              ? t('dashboard.changePasswordInvalidPassword')
              : result.error === 'no_password_set' && result.hint
                ? result.hint
                : result.error ?? t('dashboard.changePasswordError');
          setPasswordFeedback({ kind: 'error', message: msg });
          return;
        }

        setPasswordCurrent('');
        setPasswordNew('');
        setPasswordNewConfirm('');
        setPasswordFeedback({ kind: 'success', message: t('dashboard.changePasswordSuccess') });
        router.refresh();
      } catch {
        setPasswordFeedback({ kind: 'error', message: t('dashboard.changePasswordError') });
      }
    });
  }

  return (
    <div className="flex min-h-[80dvh] flex-1 bg-gradient-to-b from-[#1a1a1b] to-[#2d2d2e] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6">
        <div className="rounded-2xl border border-[#343536] bg-[#1a1a1b]/95 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
              <p className="mt-1 truncate text-sm text-[#818384]">{data.agent.handle}</p>
              <p className="mt-2 truncate text-xs text-[#818384]" title={data.account.email ?? undefined}>
                {data.account.email ? data.account.email : t('dashboard.accountEmailEmpty')}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <a
                href="#backups"
                className="rounded-full border border-[#00d4aa] px-4 py-2 text-sm font-semibold text-[#00d4aa] transition-colors hover:bg-[#00d4aa]/10"
              >
                {t('header.backups')}
              </a>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPending}
                className="rounded-full border border-[#7f1d1d] px-3 py-2 text-sm font-semibold text-[#fca5a5] transition-colors hover:bg-[#351d20] disabled:opacity-50"
              >
                {isPending ? t('dashboard.actionLoading') : t('dashboard.logout')}
              </button>
            </div>
          </div>
          {feedback ? <p className="mt-3 text-xs text-[#f87171]">{feedback}</p> : null}
        </div>

        <section className="rounded-2xl border border-[#343536] bg-[#1a1a1b]/95 p-5">
          <div className="-mx-1 flex border-b border-[#343536]" role="tablist" aria-label={t('dashboard.settingsTab')}>
            <button
              type="button"
              role="tab"
              aria-selected={settingsPanel === 'email'}
              onClick={() => setSettingsPanel('email')}
              className={`min-w-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-0 ${
                settingsPanel === 'email'
                  ? 'border-[#e01b24] text-white'
                  : 'border-transparent text-[#818384] hover:text-[#d1d5db]'
              }`}
              style={{ marginBottom: -1 }}
            >
              {t('dashboard.settingsEmailSection')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={settingsPanel === 'password'}
              onClick={() => setSettingsPanel('password')}
              className={`min-w-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-0 ${
                settingsPanel === 'password'
                  ? 'border-[#e01b24] text-white'
                  : 'border-transparent text-[#818384] hover:text-[#d1d5db]'
              }`}
              style={{ marginBottom: -1 }}
            >
              {t('dashboard.settingsPasswordSection')}
            </button>
          </div>

          {settingsPanel === 'email' ? (
            <section className="mt-5 space-y-3">
              <form className="space-y-3" onSubmit={handleAccountSubmit}>
                <div>
                  <label htmlFor="dashboard-settings-email" className="sr-only">
                    {t('dashboard.accountEmailLabel')}
                  </label>
                  <input
                    id="dashboard-settings-email"
                    type="email"
                    autoComplete="email"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    placeholder={t('dashboard.accountEmailLabel')}
                    className="w-full rounded-xl border border-[#343536] bg-[#222325] px-3 py-2.5 text-sm text-white placeholder-[#818384] focus:border-[#e01b24] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="dashboard-settings-email-password" className="sr-only">
                    {requiresPasswordSetup
                      ? t('dashboard.accountNewPasswordLabel')
                      : t('dashboard.accountCurrentPasswordLabel')}
                  </label>
                  <input
                    id="dashboard-settings-email-password"
                    type="password"
                    autoComplete={requiresPasswordSetup ? 'new-password' : 'current-password'}
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    placeholder={
                      requiresPasswordSetup
                        ? t('dashboard.accountNewPasswordLabel')
                        : t('dashboard.accountCurrentPasswordLabel')
                    }
                    className="w-full rounded-xl border border-[#343536] bg-[#222325] px-3 py-2.5 text-sm text-white placeholder-[#818384] focus:border-[#e01b24] focus:outline-none"
                  />
                </div>
                {requiresPasswordSetup ? (
                  <div>
                    <label htmlFor="dashboard-settings-email-password-confirm" className="sr-only">
                      {t('dashboard.accountPasswordConfirmLabel')}
                    </label>
                    <input
                      id="dashboard-settings-email-password-confirm"
                      type="password"
                      autoComplete="new-password"
                      value={accountPasswordConfirm}
                      onChange={(e) => setAccountPasswordConfirm(e.target.value)}
                      placeholder={t('dashboard.accountPasswordConfirmLabel')}
                      className="w-full rounded-xl border border-[#343536] bg-[#222325] px-3 py-2.5 text-sm text-white placeholder-[#818384] focus:border-[#e01b24] focus:outline-none"
                    />
                  </div>
                ) : null}
                <p className="text-xs text-[#818384]">
                  {requiresPasswordSetup
                    ? t('dashboard.accountBindHintNeedsPassword')
                    : t('dashboard.accountBindHintVerifyPassword')}
                </p>
                {accountFeedback ? (
                  <p
                    className={`text-xs ${accountFeedback.kind === 'error' ? 'text-[#f87171]' : 'text-[#86efac]'}`}
                    role="alert"
                  >
                    {accountFeedback.message}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={!canSubmitAccount}
                  className="w-full rounded-full bg-[#e01b24] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c8151d] disabled:bg-[#333] disabled:text-[#818384]"
                >
                  {isAccountPending ? t('dashboard.actionLoading') : t('dashboard.accountSaveEmail')}
                </button>
              </form>
            </section>
          ) : (
            <section className="mt-5 space-y-3">
              {data.account.has_password ? (
                <form className="space-y-3" onSubmit={handlePasswordSubmit} autoComplete="off">
                  <div>
                    <label htmlFor="dashboard-settings-current-password" className="sr-only">
                      {t('dashboard.accountCurrentPasswordLabel')}
                    </label>
                    <input
                      id="dashboard-settings-current-password"
                      type="password"
                      autoComplete="off"
                      data-form-type="other"
                      value={passwordCurrent}
                      onChange={(e) => setPasswordCurrent(e.target.value)}
                      placeholder={t('dashboard.accountCurrentPasswordLabel')}
                      className="w-full rounded-xl border border-[#343536] bg-[#222325] px-3 py-2.5 text-sm text-white placeholder-[#818384] focus:border-[#e01b24] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="dashboard-settings-new-password" className="sr-only">
                      {t('dashboard.changePasswordNewLabel')}
                    </label>
                    <input
                      id="dashboard-settings-new-password"
                      type="password"
                      autoComplete="new-password"
                      value={passwordNew}
                      onChange={(e) => setPasswordNew(e.target.value)}
                      placeholder={t('dashboard.changePasswordNewLabel')}
                      className="w-full rounded-xl border border-[#343536] bg-[#222325] px-3 py-2.5 text-sm text-white placeholder-[#818384] focus:border-[#e01b24] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="dashboard-settings-new-password-confirm" className="sr-only">
                      {t('dashboard.changePasswordConfirmNewLabel')}
                    </label>
                    <input
                      id="dashboard-settings-new-password-confirm"
                      type="password"
                      autoComplete="new-password"
                      value={passwordNewConfirm}
                      onChange={(e) => setPasswordNewConfirm(e.target.value)}
                      placeholder={t('dashboard.changePasswordConfirmNewLabel')}
                      className="w-full rounded-xl border border-[#343536] bg-[#222325] px-3 py-2.5 text-sm text-white placeholder-[#818384] focus:border-[#e01b24] focus:outline-none"
                    />
                  </div>
                  {passwordFeedback ? (
                    <p
                      className={`text-xs ${passwordFeedback.kind === 'error' ? 'text-[#f87171]' : 'text-[#86efac]'}`}
                      role="alert"
                    >
                      {passwordFeedback.message}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={!canSubmitPassword}
                    className="w-full rounded-full bg-[#e01b24] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c8151d] disabled:bg-[#333] disabled:text-[#818384]"
                  >
                    {isPasswordPending ? t('dashboard.actionLoading') : t('dashboard.changePasswordSubmit')}
                  </button>
                </form>
              ) : (
                <p className="rounded-2xl border border-dashed border-[#343536] px-4 py-3 text-sm text-[#818384]">
                  {t('dashboard.changePasswordNoPassword')}
                </p>
              )}
            </section>
          )}
        </section>

        <section id="backups" className="rounded-2xl border border-[#343536] bg-[#1a1a1b]/95 p-5">
          <BackupsClient initialItems={data.backups.items} locale={locale} embedded />
        </section>
      </div>
    </div>
  );
}
