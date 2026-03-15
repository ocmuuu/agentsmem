'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
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
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ciphertextMd5, setCiphertextMd5] = useState('');
  const [filePath, setFilePath] = useState('');
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'success'; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const effectivePath = useMemo(() => {
    if (filePath.trim()) return filePath.trim();
    return selectedFile ? `/${selectedFile.name}` : '';
  }, [filePath, selectedFile]);

  const canUpload =
    selectedFile != null &&
    /^[a-f0-9]{32}$/i.test(ciphertextMd5.trim()) &&
    effectivePath.length > 0 &&
    !isPending;

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedFile || !canUpload) return;

    setFeedback(null);
    startTransition(async () => {
      try {
        const response = await fetch('/api/v1/upload', {
          method: 'POST',
          headers: {
            'Content-Type': selectedFile.type || 'application/octet-stream',
            'x-ciphertext-md5': ciphertextMd5.trim().toLowerCase(),
            'x-file-path': effectivePath,
            'x-file-name': selectedFile.name,
          },
          body: selectedFile,
        });

        const result = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) {
          setFeedback({ kind: 'error', message: result.error ?? t('backups.uploadError') });
          return;
        }

        setCiphertextMd5('');
        setFilePath('');
        setSelectedFile(null);
        setFeedback({ kind: 'success', message: t('backups.uploadSuccess') });
        router.refresh();
      } catch {
        setFeedback({ kind: 'error', message: t('backups.uploadError') });
      }
    });
  }

  return (
    <div className={embedded ? 'flex flex-col gap-6' : 'flex flex-1 bg-gradient-to-b from-[#1a1a1b] to-[#2d2d2e] px-4 py-6 sm:px-6 sm:py-8'}>
      <div className={`mx-auto flex w-full flex-col gap-6 ${embedded ? '' : 'max-w-6xl'}`}>
        {embedded && (
          <h2 className="text-xl font-semibold text-white">{t('header.backups')}</h2>
        )}
        {!embedded && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-white">{t('backups.title')}</h1>
              <p className="mt-2 text-sm text-[#9ca3af]">{t('backups.subtitle')}</p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-full border border-[#343536] px-4 py-2 text-sm font-medium text-[#d1d5db] transition-colors hover:bg-[#222325]"
            >
              {t('backups.backToDashboard')}
            </Link>
          </div>
        )}

        <section className={embedded ? undefined : 'rounded-2xl border border-[#343536] bg-[#1a1a1b]/95 p-5'}>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-white">{t('backups.uploadTitle')}</h2>
            <p className="text-sm text-[#9ca3af]">{t('backups.uploadHint')}</p>
          </div>

          <form className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_auto]" onSubmit={handleUpload}>
            <label className="flex flex-col gap-2 text-sm text-[#d1d5db]">
              <span>{t('backups.fileLabel')}</span>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                className="rounded-xl border border-[#343536] bg-[#222325] px-3 py-2.5 text-sm text-white file:mr-3 file:rounded-full file:border-0 file:bg-[#e01b24] file:px-3 file:py-1.5 file:font-semibold file:text-white"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#d1d5db]">
              <span>{t('backups.md5Label')}</span>
              <input
                type="text"
                value={ciphertextMd5}
                onChange={(e) => setCiphertextMd5(e.target.value)}
                placeholder={t('backups.md5Placeholder')}
                className="rounded-xl border border-[#343536] bg-[#222325] px-3 py-2.5 text-sm text-white placeholder-[#818384] focus:border-[#e01b24] focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#d1d5db]">
              <span>{t('backups.pathLabel')}</span>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder={selectedFile ? `/${selectedFile.name}` : t('backups.pathPlaceholder')}
                className="rounded-xl border border-[#343536] bg-[#222325] px-3 py-2.5 text-sm text-white placeholder-[#818384] focus:border-[#e01b24] focus:outline-none"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={!canUpload}
                className="w-full rounded-full bg-[#e01b24] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c8151d] disabled:bg-[#333] disabled:text-[#818384]"
              >
                {isPending ? t('backups.uploading') : t('backups.uploadAction')}
              </button>
            </div>
          </form>

          {feedback ? (
            <p
              className={`mt-4 text-sm ${feedback.kind === 'error' ? 'text-[#f87171]' : 'text-[#86efac]'}`}
              role="alert"
            >
              {feedback.message}
            </p>
          ) : null}
        </section>

        <section className={embedded ? undefined : 'rounded-2xl border border-[#343536] bg-[#1a1a1b]/95 p-5'}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">{t('backups.historyTitle')}</h2>
            <span className="text-sm text-[#818384]">
              {initialItems.length} {t('backups.historyCountSuffix')}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            {initialItems.length > 0 ? (
              <table className="min-w-full divide-y divide-[#343536] text-sm">
                <thead>
                  <tr className="text-left text-[#818384]">
                    <th className="py-3 pr-4 font-medium">{t('backups.tableFile')}</th>
                    <th className="py-3 pr-4 font-medium">{t('backups.tablePath')}</th>
                    <th className="py-3 pr-4 font-medium">{t('backups.tableAgent')}</th>
                    <th className="py-3 pr-4 font-medium">{t('backups.tableSize')}</th>
                    <th className="py-3 pr-4 font-medium">MD5</th>
                    <th className="py-3 pr-4 font-medium">{t('backups.tableTime')}</th>
                    <th className="py-3 font-medium">{t('backups.tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2b2d] text-[#e5e7eb]">
                  {initialItems.map((item) => (
                    <tr key={item.file_id}>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-white">{item.file_name}</div>
                        <div className="mt-1 text-xs text-[#818384]">{item.content_type}</div>
                      </td>
                      <td className="py-3 pr-4 text-[#d1d5db]">{item.file_path}</td>
                      <td className="py-3 pr-4 text-[#d1d5db]">{item.agent_name}</td>
                      <td className="py-3 pr-4 text-[#d1d5db]">{formatBytes(item.file_size_bytes)}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-[#9ca3af]">{item.ciphertext_md5}</td>
                      <td className="py-3 pr-4 text-[#d1d5db]">{formatDateTime(item.timestamp, locale)}</td>
                      <td className="py-3">
                        <a
                          href={`/api/v1/download/${encodeURIComponent(item.file_id)}`}
                          className="inline-flex rounded-full border border-[#00d4aa] px-3 py-1.5 text-xs font-semibold text-[#00d4aa] transition-colors hover:bg-[#00d4aa]/10"
                        >
                          {t('backups.downloadAction')}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#343536] px-4 py-8 text-center">
                <p className="text-sm font-medium text-white">{t('backups.emptyTitle')}</p>
                <p className="mt-2 text-sm text-[#818384]">{t('backups.emptyBody')}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
