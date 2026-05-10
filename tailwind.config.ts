import type { Config } from 'tailwindcss';

// VoiceArbiter — Koyu lacivert/mor tema renk paleti
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ana arka plan renkleri
        'zemin': {
          DEFAULT: '#0a0e1a',
          'acik': '#0f1526',
          'panel': '#131929',
          'kart': '#1a2035',
        },
        // Birincil vurgu — mor/lacivert
        'vurgu': {
          DEFAULT: '#7c3aed',
          'acik': '#8b5cf6',
          'soluk': '#6d28d9',
          'mat': '#4c1d95',
        },
        // İkincil vurgu — camgöbeği
        'ikincil': {
          DEFAULT: '#0ea5e9',
          'acik': '#38bdf8',
          'soluk': '#0284c7',
        },
        // Durum renkleri
        'basari': '#10b981',
        'uyari': '#f59e0b',
        'hata': '#ef4444',
        'bilgi': '#3b82f6',
        // Metin renkleri
        'yazi': {
          'birincil': '#f1f5f9',
          'ikincil': '#94a3b8',
          'soluk': '#475569',
        },
        // Kenarlık renkleri
        'sinir': {
          DEFAULT: '#1e2d4a',
          'acik': '#2d3f5e',
          'vurgu': '#7c3aed',
        },
      },
      fontFamily: {
        // Sistem yazı tipi yığını
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        // Gradyan arka planlar
        'gradient-zemin': 'linear-gradient(135deg, #0a0e1a 0%, #0f1526 50%, #0a0e1a 100%)',
        'gradient-panel': 'linear-gradient(180deg, #131929 0%, #1a2035 100%)',
        'gradient-vurgu': 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)',
        'gradient-basari': 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
      },
      boxShadow: {
        'panel': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'vurgu': '0 0 20px rgba(124, 58, 237, 0.3)',
        'ikincil': '0 0 20px rgba(14, 165, 233, 0.3)',
        'iç': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'dalga': 'dalga 1.5s ease-in-out infinite',
        'nabiz': 'nabiz 2s ease-in-out infinite',
        'kayma': 'kayma 0.3s ease-out',
        'parlama': 'parlama 3s ease-in-out infinite',
      },
      keyframes: {
        dalga: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        nabiz: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        kayma: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        parlama: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
