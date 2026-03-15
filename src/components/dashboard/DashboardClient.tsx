'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/components/I18nProvider';
import { BackupsClient } from '@/components/backups/BackupsClient';

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim().toLowerCase());
}

function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function DashboardClient({ data, locale }: { data: DashboardData; locale: string }) {
  const { t } = useTranslations();
  const router = useRouter();

  const [feedback, setFeedback] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<'settings' | 'agents'>('agents');
  const [selectedAgent, setSelectedAgent] = useState<DashboardAgent | null>(null);
  const [agentBackups, setAgentBackups] = useState<BackupItem[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);

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
  const emailInvalid = accountEmail.trim() !== '' && !isValidEmail(accountEmail);
  const canSubmitAccount =
    accountEmail.trim() &&
    isValidEmail(accountEmail) &&
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

  const fetchBackupsForAgent = useCallback(async (agentId: string) => {
    setBackupsLoading(true);
    try {
      const res = await fetch(`/api/v1/list?agent_id=${encodeURIComponent(agentId)}&limit=200`);
      if (res.ok) {
        const result = (await res.json()) as { items: BackupItem[] };
        setAgentBackups(result.items);
      }
    } catch {
      /* ignore */
    } finally {
      setBackupsLoading(false);
    }
  }, []);

  function handleSelectAgent(agent: DashboardAgent) {
    setSelectedAgent(agent);
    setAgentBackups([]);
    fetchBackupsForAgent(agent.id);
  }

  function handleBackToAgents() {
    setSelectedAgent(null);
    setAgentBackups([]);
  }

  function handleLogout() {
    setFeedback(null);
    startTransition(async () => {
      try {
        const response = await fetch('/api/v1/logout', { method: 'POST' });
        if (!response.ok) {
          const d = (await response.json().catch(() => ({}))) as { error?: string };
          setFeedback(d.error ?? t('dashboard.logoutError'));
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
          ? { email: accountEmail.trim(), password: accountPassword, password_confirm: accountPasswordConfirm }
          : { email: accountEmail.trim(), current_password: accountPassword };
        const response = await fetch('/api/v1/dashboard/account/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const result = (await response.json().catch(() => ({}))) as { error?: string; hint?: string };
        if (!response.ok) {
          const message =
            result.error === 'email already in use'
              ? t('dashboard.accountEmailAlreadyInUse')
              : (result.hint || result.error) ?? t('dashboard.accountEmailError');
          setAccountFeedback({ kind: 'error', message });
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

  // ---- Agent detail view (backups for one agent) ----
  if (selectedAgent) {
    return (
      <div className="flex min-h-[80dvh] flex-1 bg-gradient-to-b from-sky-50 to-white px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBackToAgents}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
              >
                ← {t('dashboard.backToAgents')}
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold text-slate-800">{selectedAgent.name}</h2>
                <p className="truncate text-xs text-slate-500">{selectedAgent.handle}</p>
              </div>
            </div>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {backupsLoading ? (
              <p className="py-6 text-center text-sm text-slate-500">{t('dashboard.actionLoading')}</p>
            ) : (
              <BackupsClient initialItems={agentBackups} locale={locale} embedded />
            )}
          </section>
        </div>
      </div>
    );
  }

  // ---- Main dashboard view ----
  return (
    <div className="flex min-h-[80dvh] flex-1 bg-gradient-to-b from-sky-50 to-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6">
        {/* Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-slate-800">{t('dashboard.title')}</h1>
              <p className="mt-2 truncate text-xs text-slate-500" title={data.account.email ?? undefined}>
                {data.account.email ? data.account.email : t('dashboard.accountEmailEmpty')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="shrink-0 rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              {isPending ? t('dashboard.actionLoading') : t('dashboard.logout')}
            </button>
          </div>
          {feedback ? <p className="mt-3 text-xs text-red-600">{feedback}</p> : null}
        </div>

        {/* Main tabs */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex border-b border-slate-200" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mainTab === 'agents'}
              onClick={() => setMainTab('agents')}
              className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none ${
                mainTab === 'agents'
                  ? 'border-teal-500 text-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              style={{ marginBottom: -1 }}
            >
              {t('dashboard.tabAgents')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mainTab === 'settings'}
              onClick={() => setMainTab('settings')}
              className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none ${
                mainTab === 'settings'
                  ? 'border-teal-500 text-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              style={{ marginBottom: -1 }}
            >
              {t('dashboard.tabSettings')}
            </button>
          </div>

          <div className="p-5">
            {mainTab === 'agents' ? (
              <AgentsList agents={data.agents} locale={locale} onSelect={handleSelectAgent} t={t} />
            ) : (
              <SettingsPanel
                settingsPanel={settingsPanel}
                setSettingsPanel={setSettingsPanel}
                requiresPasswordSetup={requiresPasswordSetup}
                hasPassword={data.account.has_password}
                accountEmail={accountEmail}
                setAccountEmail={setAccountEmail}
                accountPassword={accountPassword}
                setAccountPassword={setAccountPassword}
                accountPasswordConfirm={accountPasswordConfirm}
                setAccountPasswordConfirm={setAccountPasswordConfirm}
                accountFeedback={accountFeedback}
                emailInvalid={emailInvalid}
                canSubmitAccount={!!canSubmitAccount}
                isAccountPending={isAccountPending}
                onAccountSubmit={handleAccountSubmit}
                passwordCurrent={passwordCurrent}
                setPasswordCurrent={setPasswordCurrent}
                passwordNew={passwordNew}
                setPasswordNew={setPasswordNew}
                passwordNewConfirm={passwordNewConfirm}
                setPasswordNewConfirm={setPasswordNewConfirm}
                passwordFeedback={passwordFeedback}
                canSubmitPassword={canSubmitPassword}
                isPasswordPending={isPasswordPending}
                onPasswordSubmit={handlePasswordSubmit}
                t={t}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------- Agents list ----------- */

function AgentsList({
  agents,
  locale,
  onSelect,
  t,
}: {
  agents: DashboardAgent[];
  locale: string;
  onSelect: (a: DashboardAgent) => void;
  t: (key: string) => string;
}) {
  if (agents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center">
        <p className="text-sm text-slate-500">{t('dashboard.agentsEmpty')}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {agents.map((agent) => (
        <li key={agent.id}>
          <button
            type="button"
            onClick={() => onSelect(agent)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3.5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-600">
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{agent.name}</p>
              <p className="truncate text-xs text-slate-500">{agent.handle}</p>
            </div>
            <div className="shrink-0 text-xs text-slate-400">
              {formatDate(agent.created_at, locale)}
            </div>
            <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ----------- Settings panel ----------- */

function SettingsPanel({
  settingsPanel,
  setSettingsPanel,
  requiresPasswordSetup,
  hasPassword,
  accountEmail,
  setAccountEmail,
  accountPassword,
  setAccountPassword,
  accountPasswordConfirm,
  setAccountPasswordConfirm,
  accountFeedback,
  emailInvalid,
  canSubmitAccount,
  isAccountPending,
  onAccountSubmit,
  passwordCurrent,
  setPasswordCurrent,
  passwordNew,
  setPasswordNew,
  passwordNewConfirm,
  setPasswordNewConfirm,
  passwordFeedback,
  canSubmitPassword,
  isPasswordPending,
  onPasswordSubmit,
  t,
}: {
  settingsPanel: 'email' | 'password';
  setSettingsPanel: (v: 'email' | 'password') => void;
  requiresPasswordSetup: boolean;
  hasPassword: boolean;
  accountEmail: string;
  setAccountEmail: (v: string) => void;
  accountPassword: string;
  setAccountPassword: (v: string) => void;
  accountPasswordConfirm: string;
  setAccountPasswordConfirm: (v: string) => void;
  accountFeedback: { kind: 'error' | 'success'; message: string } | null;
  emailInvalid: boolean;
  canSubmitAccount: boolean;
  isAccountPending: boolean;
  onAccountSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  passwordCurrent: string;
  setPasswordCurrent: (v: string) => void;
  passwordNew: string;
  setPasswordNew: (v: string) => void;
  passwordNewConfirm: string;
  setPasswordNewConfirm: (v: string) => void;
  passwordFeedback: { kind: 'error' | 'success'; message: string } | null;
  canSubmitPassword: boolean;
  isPasswordPending: boolean;
  onPasswordSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  t: (key: string) => string;
}) {
  return (
    <>
      <div className="-mx-1 flex border-b border-slate-200" role="tablist" aria-label={t('dashboard.settingsTab')}>
        <button
          type="button"
          role="tab"
          aria-selected={settingsPanel === 'email'}
          onClick={() => setSettingsPanel('email')}
          className={`min-w-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-0 ${
            settingsPanel === 'email'
              ? 'border-teal-500 text-slate-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
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
              ? 'border-teal-500 text-slate-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          style={{ marginBottom: -1 }}
        >
          {t('dashboard.settingsPasswordSection')}
        </button>
      </div>

      {settingsPanel === 'email' ? (
        <section className="mt-5 space-y-3">
          <form className="space-y-3" onSubmit={onAccountSubmit}>
            <div>
              <label htmlFor="dashboard-settings-email" className="sr-only">{t('dashboard.accountEmailLabel')}</label>
              <input
                id="dashboard-settings-email"
                type="email"
                autoComplete="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder={t('dashboard.accountEmailLabel')}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label htmlFor="dashboard-settings-email-password" className="sr-only">
                {requiresPasswordSetup ? t('dashboard.accountNewPasswordLabel') : t('dashboard.accountCurrentPasswordLabel')}
              </label>
              <input
                id="dashboard-settings-email-password"
                type="password"
                autoComplete={requiresPasswordSetup ? 'new-password' : 'current-password'}
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                placeholder={requiresPasswordSetup ? t('dashboard.accountNewPasswordLabel') : t('dashboard.accountCurrentPasswordLabel')}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            {requiresPasswordSetup ? (
              <div>
                <label htmlFor="dashboard-settings-email-password-confirm" className="sr-only">{t('dashboard.accountPasswordConfirmLabel')}</label>
                <input
                  id="dashboard-settings-email-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={accountPasswordConfirm}
                  onChange={(e) => setAccountPasswordConfirm(e.target.value)}
                  placeholder={t('dashboard.accountPasswordConfirmLabel')}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ) : null}
            <p className="text-xs text-slate-500">
              {requiresPasswordSetup ? t('dashboard.accountBindHintNeedsPassword') : t('dashboard.accountBindHintVerifyPassword')}
            </p>
            {emailInvalid ? (
              <p className="text-xs text-red-600" role="alert">
                {t('dashboard.accountEmailInvalid')}
              </p>
            ) : null}
            {accountFeedback ? (
              <p className={`text-xs ${accountFeedback.kind === 'error' ? 'text-red-600' : 'text-green-600'}`} role="alert">
                {accountFeedback.message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={!canSubmitAccount}
              className="w-full rounded-full bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:bg-slate-200 disabled:text-slate-500"
            >
              {isAccountPending ? t('dashboard.actionLoading') : t('dashboard.accountSaveEmail')}
            </button>
          </form>
        </section>
      ) : (
        <section className="mt-5 space-y-3">
          {hasPassword ? (
            <form className="space-y-3" onSubmit={onPasswordSubmit} autoComplete="off">
              <div>
                <label htmlFor="dashboard-settings-current-password" className="sr-only">{t('dashboard.accountCurrentPasswordLabel')}</label>
                <input
                  id="dashboard-settings-current-password"
                  type="password"
                  autoComplete="off"
                  data-form-type="other"
                  value={passwordCurrent}
                  onChange={(e) => setPasswordCurrent(e.target.value)}
                  placeholder={t('dashboard.accountCurrentPasswordLabel')}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="dashboard-settings-new-password" className="sr-only">{t('dashboard.changePasswordNewLabel')}</label>
                <input
                  id="dashboard-settings-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordNew}
                  onChange={(e) => setPasswordNew(e.target.value)}
                  placeholder={t('dashboard.changePasswordNewLabel')}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="dashboard-settings-new-password-confirm" className="sr-only">{t('dashboard.changePasswordConfirmNewLabel')}</label>
                <input
                  id="dashboard-settings-new-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={passwordNewConfirm}
                  onChange={(e) => setPasswordNewConfirm(e.target.value)}
                  placeholder={t('dashboard.changePasswordConfirmNewLabel')}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              {passwordFeedback ? (
                <p className={`text-xs ${passwordFeedback.kind === 'error' ? 'text-red-600' : 'text-green-600'}`} role="alert">
                  {passwordFeedback.message}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={!canSubmitPassword}
                className="w-full rounded-full bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:bg-slate-200 disabled:text-slate-500"
              >
                {isPasswordPending ? t('dashboard.actionLoading') : t('dashboard.changePasswordSubmit')}
              </button>
            </form>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
              {t('dashboard.changePasswordNoPassword')}
            </p>
          )}
        </section>
      )}
    </>
  );
}
