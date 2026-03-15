'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/components/I18nProvider';

function ChatBubble({
  side,
  label,
  children,
}: {
  side: 'agent' | 'owner';
  label: string;
  children: ReactNode;
}) {
  const isAgent = side === 'agent';

  return (
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] sm:max-w-[78%] ${isAgent ? 'items-start' : 'items-end'} flex flex-col gap-1`}>
        <span className={`px-1 text-[11px] font-medium uppercase tracking-[0.18em] ${isAgent ? 'text-slate-500' : 'text-teal-600'}`}>
          {label}
        </span>
        <div
          className={[
            'rounded-[1.4rem] px-4 py-3 text-sm leading-relaxed shadow-sm',
            isAgent
              ? 'rounded-tl-md border border-slate-200 bg-slate-100 text-slate-700'
              : 'rounded-tr-md border border-teal-200 bg-teal-500 text-white',
          ].join(' ')}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function BulletLine({ children }: { children: ReactNode }) {
  return <div className="flex gap-2"><span className="text-teal-600">•</span><span>{children}</span></div>;
}

export default function GuidePage() {
  const { t } = useTranslations();

  useEffect(() => {
    document.title = `${t('guide.metaTitle')} | AgentsMem`;
  }, [t]);

  const backupFiles = [
    t('guide.backupFile1'),
    t('guide.backupFile2'),
    t('guide.backupFile3'),
    t('guide.backupFile4'),
    t('guide.backupFile5'),
  ];
  const backupEncItems = [
    t('guide.backupEnc1'),
    t('guide.backupEnc2'),
    t('guide.backupEnc3'),
    t('guide.backupEnc4'),
    t('guide.backupEnc5'),
  ];

  return (
    <div className="min-h-full flex-1 bg-gradient-to-b from-sky-50 to-white px-4 py-10 sm:py-14">
      <section className="mx-auto max-w-4xl">
        <header className="mx-auto mb-6 max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">{t('guide.title')}</h1>
        </header>

        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-500 text-lg font-bold text-white">
                  AI
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">{t('guide.chatTitle')}</h2>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 px-4 py-5 sm:px-6">
              <ChatBubble side="owner" label={t('guide.ownerLabel')}>
                <p>{t('guide.ownerPrompt')}</p>
              </ChatBubble>

              <ChatBubble side="agent" label={t('guide.agentLabel')}>
                <p className="font-semibold text-slate-800">{t('guide.agentRegistered')}</p>
                <div className="mt-3 space-y-1.5">
                  <BulletLine>{t('guide.agentApiKeySaved')}</BulletLine>
                  <BulletLine>{t('guide.agentSkillInstalled')}</BulletLine>
                  <BulletLine>{t('guide.agentHeartbeatAdded')}</BulletLine>
                  <BulletLine>{t('guide.agentVaultGenerated')}</BulletLine>
                </div>
                <p className="mt-3">{t('guide.firstBackupDone')}</p>
                <div className="mt-2 space-y-1">
                  {backupFiles.map((path, i) => (
                    <div key={i} className="font-mono text-xs text-slate-600">{path}</div>
                  ))}
                </div>
              </ChatBubble>

              <ChatBubble side="owner" label={t('guide.ownerLabel')}>
                <p>{t('guide.ownerQueryBackups')}</p>
              </ChatBubble>

              <ChatBubble side="agent" label={t('guide.agentLabel')}>
                <p>{t('guide.agentBackupListIntro')}</p>
                <div className="mt-3 space-y-1.5">
                  {backupEncItems.map((line, i) => (
                    <BulletLine key={i}>
                      <span className="font-mono text-xs">{line}</span>
                    </BulletLine>
                  ))}
                </div>
              </ChatBubble>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-sm text-slate-600">
          <Link href="/" className="text-teal-600 hover:text-teal-700 hover:underline">
            ← {t('header.homeAria')}
          </Link>
        </p>
      </section>
    </div>
  );
}
