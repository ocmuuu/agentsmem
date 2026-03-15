'use client';

import Link from 'next/link';
import { useTranslations } from '@/components/I18nProvider';

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

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDateTime(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function BackupsClient({
  initialItems,
  locale,
  embedded,
}: {
  initialItems: BackupItem[];
  locale: string;
  embedded?: boolean;
}) {
  const { t } = useTranslations();

  return (
    <div className={embedded ? 'flex flex-col gap-6' : 'flex flex-1 bg-gradient-to-b from-sky-50 to-white px-4 py-6 sm:px-6 sm:py-8'}>
      <div className={`mx-auto flex w-full flex-col gap-6 ${embedded ? '' : 'max-w-6xl'}`}>
        {embedded && (
          <h2 className="text-xl font-semibold text-slate-800">{t('header.backups')}</h2>
        )}
        {!embedded && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{t('backups.title')}</h1>
              <p className="mt-2 text-sm text-slate-500">{t('backups.subtitle')}</p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              {t('backups.backToDashboard')}
            </Link>
          </div>
        )}

        <section className={embedded ? undefined : 'rounded-xl border border-slate-200 bg-white p-5 shadow-sm'}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-800">{t('backups.historyTitle')}</h2>
            <span className="text-sm text-slate-500">
              {initialItems.length} {t('backups.historyCountSuffix')}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            {initialItems.length > 0 ? (
              <table className="w-full divide-y divide-slate-200 text-sm" style={{ minWidth: '720px' }}>
                <thead>
                  <tr className="whitespace-nowrap text-left text-slate-500">
                    <th className="py-3 pr-5 font-medium">{t('backups.tableFile')}</th>
                    <th className="py-3 pr-5 font-medium">{t('backups.tablePath')}</th>
                    <th className="py-3 pr-5 font-medium">{t('backups.tableSize')}</th>
                    <th className="py-3 pr-5 font-medium">MD5</th>
                    <th className="py-3 pr-5 font-medium">{t('backups.tableTime')}</th>
                    <th className="py-3 font-medium">{t('backups.tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {initialItems.map((item) => (
                    <tr key={item.file_id} className="whitespace-nowrap">
                      <td className="py-3 pr-5">
                        <div className="max-w-[180px] truncate font-medium text-slate-800" title={item.file_name}>{item.file_name}</div>
                      </td>
                      <td className="py-3 pr-5">
                        <span className="max-w-[200px] block truncate text-slate-600" title={item.file_path}>{item.file_path}</span>
                      </td>
                      <td className="py-3 pr-5 text-slate-600">{formatBytes(item.file_size_bytes)}</td>
                      <td className="py-3 pr-5 font-mono text-xs text-slate-400">{item.ciphertext_md5}</td>
                      <td className="py-3 pr-5 text-slate-600">{formatDateTime(item.timestamp, locale)}</td>
                      <td className="py-3">
                        <a
                          href={`/api/v1/download/${encodeURIComponent(item.file_id)}`}
                          className="inline-flex rounded-full border border-teal-500 px-3 py-1.5 text-xs font-semibold text-teal-600 transition-colors hover:bg-teal-50"
                        >
                          {t('backups.downloadAction')}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-700">{t('backups.emptyTitle')}</p>
                <p className="mt-2 text-sm text-slate-500">{t('backups.emptyBody')}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
