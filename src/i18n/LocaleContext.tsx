'use client';

// VoiceArbiter — Locale Context Provider & Hook
// Provides translation lookup, locale switching, and browser auto-detection

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type { Translations } from './locales/en';
import {
  TRANSLATIONS,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  detectBrowserLocale,
  interpolate,
  type LocaleCode,
} from './index';

// ─── Context shape ────────────────────────────────────────────────────────────

interface LocaleContextValue {
  /** Active locale code, e.g. "en" */
  locale: LocaleCode;
  /** Change the active locale */
  setLocale: (code: LocaleCode) => void;
  /** The full translation dictionary for the active locale */
  t: Translations;
  /**
   * Translate a dot-separated key with optional variable interpolation.
   * Falls back to DEFAULT_LOCALE when the key is missing.
   *
   * Example:
   *   tx('wallet.connect_button')
   *   tx('trust.rationale.age.days_30_89', { days: 45 })
   */
  tx: (keyPath: string, vars?: Record<string, string | number>) => string;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const LocaleContext = createContext<LocaleContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface LocaleProviderProps {
  children: React.ReactNode;
  /** Override auto-detection with a specific locale (optional) */
  defaultLocale?: LocaleCode;
}

const STORAGE_KEY = 'voicearbiter-locale';

export function LocaleProvider({ children, defaultLocale }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<LocaleCode>(() => {
    // Server-side: use provided default or fallback
    return defaultLocale ?? DEFAULT_LOCALE;
  });

  // On mount, resolve from localStorage → browser detection → prop → default
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
      const supported = SUPPORTED_LOCALES.map((l) => l.code);

      if (stored && supported.includes(stored)) {
        setLocaleState(stored);
        return;
      }
    } catch {
      // localStorage unavailable (e.g. private browsing restrictions)
    }

    if (!defaultLocale) {
      const detected = detectBrowserLocale();
      setLocaleState(detected);
    }
  }, [defaultLocale]);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore
    }
  }, []);

  const t = useMemo(() => TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE], [locale]);

  const tx = useCallback(
    (keyPath: string, vars?: Record<string, string | number>): string => {
      const keys = keyPath.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = t;

      for (const k of keys) {
        if (current == null || typeof current !== 'object') {
          current = undefined;
          break;
        }
        current = current[k];
      }

      // Fallback to English if key not found in active locale
      if (typeof current !== 'string') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fallback: any = TRANSLATIONS[DEFAULT_LOCALE];
        for (const k of keys) {
          if (fallback == null || typeof fallback !== 'object') {
            fallback = undefined;
            break;
          }
          fallback = fallback[k];
        }
        current = typeof fallback === 'string' ? fallback : keyPath;
      }

      return vars ? interpolate(current, vars) : current;
    },
    [t]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t, tx }),
    [locale, setLocale, t, tx]
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** Access i18n context anywhere in the component tree. */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used inside <LocaleProvider>');
  }
  return ctx;
}
