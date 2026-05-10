// VoiceArbiter — i18n core
// Locale registry, type helpers, and interpolation utility

export { en } from './locales/en';
export { tr } from './locales/tr';
export { es } from './locales/es';
export { pt } from './locales/pt';
export type { Translations } from './locales/en';

import { en } from './locales/en';
import { tr } from './locales/tr';
import { es } from './locales/es';
import { pt } from './locales/pt';
import type { Translations } from './locales/en';

// ─── Supported locales ────────────────────────────────────────────────────────

export type LocaleCode = 'en' | 'tr' | 'es' | 'pt';

export interface LocaleMeta {
  code: LocaleCode;
  /** Native name of the language */
  nativeName: string;
  /** English name */
  englishName: string;
  /** Flag emoji */
  flag: string;
  /** RTL language? */
  rtl?: boolean;
}

export const SUPPORTED_LOCALES: LocaleMeta[] = [
  { code: 'en', nativeName: 'English',    englishName: 'English',    flag: '🇬🇧' },
  { code: 'es', nativeName: 'Español',    englishName: 'Spanish',    flag: '🇪🇸' },
  { code: 'pt', nativeName: 'Português',  englishName: 'Portuguese', flag: '🇧🇷' },
  { code: 'tr', nativeName: 'Türkçe',     englishName: 'Turkish',    flag: '🇹🇷' },
];

/** All translation dictionaries keyed by locale code */
export const TRANSLATIONS: Record<LocaleCode, Translations> = {
  en,
  tr,
  es,
  pt,
};

/** Fallback locale used when a key is missing in the active locale */
export const DEFAULT_LOCALE: LocaleCode = 'en';

// ─── Interpolation utility ────────────────────────────────────────────────────

/**
 * Replace {placeholder} tokens in a translation string.
 *
 * Example:
 *   interpolate('Hello, {name}!', { name: 'Alice' }) → 'Hello, Alice!'
 */
export function interpolate(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

// ─── Deep key access helper ───────────────────────────────────────────────────

type DeepValue<T> = T extends object
  ? { [K in keyof T]: DeepValue<T[K]> }[keyof T]
  : T;

/**
 * Safely access a nested key in a translations object.
 * Returns the key path string as fallback if the value is missing.
 */
export function getTranslation(
  t: Translations,
  keyPath: string
): string {
  const keys = keyPath.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = t;
  for (const k of keys) {
    if (current == null || typeof current !== 'object') return keyPath;
    current = current[k];
  }
  return typeof current === 'string' ? current : keyPath;
}

// ─── Browser locale detection ─────────────────────────────────────────────────

/**
 * Detect the best matching locale from the browser's navigator.languages.
 * Falls back to DEFAULT_LOCALE if nothing matches.
 */
export function detectBrowserLocale(): LocaleCode {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;

  const supported = SUPPORTED_LOCALES.map((l) => l.code);
  const browserLangs = navigator.languages ?? [navigator.language];

  for (const lang of browserLangs) {
    const base = lang.split('-')[0].toLowerCase() as LocaleCode;
    if (supported.includes(base)) return base;
  }

  return DEFAULT_LOCALE;
}
