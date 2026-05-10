'use client';

// VoiceArbiter — Language Switcher Component
// Compact dropdown for switching the UI locale

import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from '@/i18n/LocaleContext';
import { SUPPORTED_LOCALES } from '@/i18n';

/**
 * Compact language/locale switcher.
 * Shows the current locale flag + name, drops down a list of all supported locales.
 * Accessible: keyboard navigable, closes on Escape or outside click.
 */
export function DilSecici() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = SUPPORTED_LOCALES.find((l) => l.code === locale) ?? SUPPORTED_LOCALES[0];

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-sinir bg-zemin-panel hover:border-sinir-acik text-yazi-ikincil transition-colors"
      >
        <span aria-hidden="true">{current.flag}</span>
        <span className="font-medium">{current.nativeName}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full mt-1.5 z-50 min-w-[140px] bg-zemin-panel border border-sinir-acik rounded-xl shadow-panel overflow-hidden animate-kayma"
        >
          {SUPPORTED_LOCALES.map((loc) => (
            <button
              key={loc.code}
              role="option"
              aria-selected={locale === loc.code}
              type="button"
              onClick={() => {
                setLocale(loc.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                locale === loc.code
                  ? 'bg-vurgu/20 text-vurgu-acik'
                  : 'text-yazi-ikincil hover:bg-zemin-kart hover:text-yazi-birincil'
              }`}
            >
              <span aria-hidden="true">{loc.flag}</span>
              <span className="font-medium">{loc.nativeName}</span>
              {locale === loc.code && (
                <span className="ml-auto text-vurgu">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
