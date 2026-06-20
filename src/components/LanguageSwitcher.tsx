'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { Globe } from 'lucide-react';

const LABELS: Record<string, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-600">
      <Globe size={16} />
      <select
        value={locale}
        onChange={(e) =>
          router.replace(pathname, { locale: e.target.value as (typeof routing.locales)[number] })
        }
        className="bg-transparent border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
        aria-label="Language"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {LABELS[l] ?? l}
          </option>
        ))}
      </select>
    </label>
  );
}
