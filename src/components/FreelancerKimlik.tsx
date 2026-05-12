'use client';

// VoiceArbiter — Freelancer Kimlik Bileşeni
// Arka uç keypair'inin genel anahtarını gösterir

import React, { useEffect, useState } from 'react';
import { muzakereDepoyuKullan } from '@/store/muzakere-store';
import { adresKisalt } from '@/lib/solana';
import type { FreelancerBilgisiYaniti } from '@/types';

/**
 * Freelancer (Taraf B) kimlik paneli.
 * Arka uç keypair'inin genel anahtarını /api/freelancer-info'dan çeker.
 * Özel anahtar hiçbir zaman tarayıcıya gönderilmez.
 */
export function FreelancerKimlik() {
  const freelancerKimliginiAyarla = muzakereDepoyuKullan(
    (d) => d.freelancerKimliginiAyarla
  );
  const freelancerKimlik = muzakereDepoyuKullan((d) => d.freelancerKimlik);
  const bildirimEkle = muzakereDepoyuKullan((d) => d.bildirimEkle);

  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [ag, setAg] = useState<string>('devnet');

  // Bileşen yüklendiğinde freelancer bilgisini çek
  useEffect(() => {
    freelancerBilgisiniCek();
  }, []);

  const freelancerBilgisiniCek = async () => {
    setYukleniyor(true);
    setHata(null);

    try {
      const yanit = await fetch('/api/freelancer-info');

      if (!yanit.ok) {
        const hataMetni = await yanit.text();
        throw new Error(hataMetni || 'Failed to load freelancer info');
      }

      const veri: FreelancerBilgisiYaniti = await yanit.json();
      freelancerKimliginiAyarla(veri.acikAnahtar);
      setAg(veri.ag);
    } catch (hata) {
      const hataMesaji =
        hata instanceof Error
          ? hata.message
          : 'Bilinmeyen bir hata oluştu';
      setHata(hataMesaji);
      console.error('[FreelancerKimlik] Bilgi alınamadı:', hata);
      bildirimEkle(
        'uyari',
        'Freelancer Info Failed to Load',
        'Make sure the freelancer-keypair.json file exists.'
      );
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="bg-zemin-kart border border-sinir rounded-xl p-4 shadow-panel">
      {/* Panel başlığı */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-ikincil" />
          <h3 className="text-sm font-semibold text-yazi-ikincil uppercase tracking-wider">
            Freelancer — Party B
          </h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-ikincil/20 text-ikincil border border-ikincil/30">
          Auto-Signer
        </span>
      </div>

      {/* İçerik */}
      {yukleniyor ? (
        <div className="space-y-2">
          <div className="h-4 bg-sinir rounded animate-pulse" />
          <div className="h-10 bg-sinir rounded animate-pulse" />
        </div>
      ) : hata ? (
        /* Hata durumu */
        <div className="space-y-3">
          <div className="bg-hata/10 border border-hata/30 rounded-lg p-3">
            <p className="text-xs text-hata font-medium mb-1">Keypair Failed to Load</p>
            <p className="text-xs text-yazi-ikincil">{hata}</p>
          </div>
          <p className="text-xs text-yazi-soluk">
            Please run:{' '}
            <code className="bg-zemin-acik px-1.5 py-0.5 rounded font-mono text-vurgu-acik">
              npm run generate-wallets
            </code>
          </p>
          <button
            onClick={freelancerBilgisiniCek}
            className="w-full py-2 px-4 rounded-lg border border-sinir-acik text-yazi-ikincil hover:border-ikincil hover:text-ikincil transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      ) : freelancerKimlik ? (
        /* Başarı durumu */
        <div className="space-y-3">
          {/* Genel anahtar */}
          <div className="bg-zemin-acik rounded-lg p-3 border border-sinir">
            <p className="text-xs text-yazi-soluk mb-1">Public Key (Solana)</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-mono text-yazi-birincil truncate">
                {adresKisalt(freelancerKimlik, 8, 8)}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(freelancerKimlik);
                  bildirimEkle('bilgi', 'Copied', 'Freelancer address copied to clipboard.');
                }}
                className="flex-shrink-0 text-xs text-ikincil hover:text-ikincil-acik transition-colors"
                title="Copy full address"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Ağ bilgisi */}
          <div className="bg-zemin-acik rounded-lg p-3 border border-sinir">
            <p className="text-xs text-yazi-soluk mb-1">Network</p>
            <p className="text-sm text-yazi-birincil capitalize">{ag}</p>
          </div>

          {/* Arka uç imzalama açıklaması */}
          <div className="bg-ikincil/5 border border-ikincil/20 rounded-lg p-3">
            <p className="text-xs text-ikincil font-medium mb-1">Backend Signing</p>
            <p className="text-xs text-yazi-ikincil leading-relaxed">
              Freelancer signature is added server-side.
              The private key is never sent to the browser.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
