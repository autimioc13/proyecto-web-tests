import { defineRouting } from 'next-intl/routing';

/**
 * i18n routing config.
 *
 * To add a language later (e.g. Portuguese), just:
 *   1. add its code to `locales` below (e.g. 'pt')
 *   2. create messages/pt.json
 * Spanish is the default and uses unprefixed URLs ('as-needed'); other locales
 * are prefixed (e.g. /en, /en/auth/login).
 */
export const locales = ['es', 'en', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'es',
  localePrefix: 'as-needed',
});
