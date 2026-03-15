'use client';

import Link from 'next/link';
import { useTranslations } from '@/components/I18nProvider';

export function Footer() {
  const { t } = useTranslations();
  return (
    <footer className="bg-white border-t border-slate-200 px-4 py-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
        <span>© 2026 AgentsMem</span>
        <span className="flex items-center gap-2">
          <Link href="/terms" className="text-teal-600 hover:text-teal-700 hover:underline">
            {t('footer.terms')}
          </Link>
          <Link href="/privacy" className="text-teal-600 hover:text-teal-700 hover:underline">
            {t('footer.privacy')}
          </Link>
          <a
            href="https://github.com/ocmuuu/agentsmem"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700 hover:underline"
          >
            {t('footer.openSource')}
          </a>
          <a
            href="https://github.com/ocmuuu/agentsmem/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700 hover:underline"
          >
            {t('footer.feedback')}
          </a>
        </span>
      </div>
    </footer>
  );
}
