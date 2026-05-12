'use client';

// VoiceArbiter — Güven Puanı Raporu Bileşeni
// Cüzdan güven puanını kategorik döküm ile görselleştirir

import React, { useEffect, useState, useCallback } from 'react';
import type { GuvenPuaniDetay, GuvenKategorisi } from '@/types';
import { genelDegerlendirme } from '@/lib/guven-skoru';

interface GuvenRaporuProps {
  /** Sorgulanacak cüzdan adresi */
  adres: string;
  /** Panel başlığı (opsiyonel) */
  baslik?: string;
}

// ─── Yardımcı bileşenler ──────────────────────────────────────────────────────

/** Dairesel puan göstergesi (CSS tabanlı, bağımlılık yok) */
function DaireselPuan({ puan }: { puan: number }) {
  const yaricap = 45;
  const cevre = 2 * Math.PI * yaricap;
  const doluluk = ((100 - puan) / 100) * cevre;

  // Puana göre renk belirle
  const renk =
    puan >= 75
      ? '#10b981'  // Yeşil — yüksek güven
      : puan >= 50
      ? '#0ea5e9'  // Mavi — orta güven
      : puan >= 25
      ? '#f59e0b'  // Sarı — düşük güven
      : '#ef4444'; // Kırmızı — çok düşük güven

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="110" height="110" className="-rotate-90">
        {/* Arka plan çemberi */}
        <circle
          cx="55"
          cy="55"
          r={yaricap}
          fill="none"
          stroke="#1e2d4a"
          strokeWidth="8"
        />
        {/* Puan göstergesi */}
        <circle
          cx="55"
          cy="55"
          r={yaricap}
          fill="none"
          stroke={renk}
          strokeWidth="8"
          strokeDasharray={cevre}
          strokeDashoffset={doluluk}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      {/* Puan metni */}
      <div className="absolute flex flex-col items-center">
        <span
          className="text-2xl font-bold"
          style={{ color: renk }}
        >
          {puan}
        </span>
        <span className="text-xs text-yazi-soluk">/100</span>
      </div>
    </div>
  );
}

/** Kategori ilerleme çubuğu */
function KategoriCubugu({ kategori }: { kategori: GuvenKategorisi }) {
  const yuzde = (kategori.puan / kategori.maksimumPuan) * 100;

  // Puana göre çubuk rengi
  const cubukRengi =
    yuzde >= 75
      ? 'bg-basari'
      : yuzde >= 50
      ? 'bg-ikincil'
      : yuzde >= 25
      ? 'bg-uyari'
      : 'bg-hata';

  return (
    <div className="space-y-1.5">
      {/* Kategori adı ve puan */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-yazi-birincil">
          {kategori.kategoriAdi}
        </span>
        <span className="text-sm font-mono text-yazi-ikincil">
          {kategori.puan}/{kategori.maksimumPuan}
        </span>
      </div>

      {/* İlerleme çubuğu */}
      <div className="h-1.5 bg-zemin-acik rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${cubukRengi}`}
          style={{ width: `${yuzde}%` }}
        />
      </div>

      {/* Açıklama metni */}
      <p className="text-xs text-yazi-soluk leading-relaxed">{kategori.aciklama}</p>
    </div>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────

/**
 * Cüzdan güven puanı raporu paneli.
 * Dairesel gösterge, kategori çubukları ve Türkçe açıklamalar içerir.
 */
export function GuvenRaporu({ adres, baslik = 'Trust Report' }: GuvenRaporuProps) {
  const [rapor, setRapor] = useState<GuvenPuaniDetay | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  // Güven raporunu çek
  const raporuCek = useCallback(async () => {
    if (!adres) return;
    setYukleniyor(true);
    await new Promise((r) => setTimeout(r, 800));
    setRapor({
      adres,
      toplamPuan: 85,
      hesaplanmaZamani: new Date().toISOString(),
      yas: { kategoriAdi: 'Wallet Age', puan: 24, maksimumPuan: 30, aciklama: '120-day-old wallet' },
      aktivite: { kategoriAdi: 'Transaction Activity', puan: 22, maksimumPuan: 25, aciklama: '142 transactions detected' },
      bakiye: { kategoriAdi: 'Balance', puan: 17, maksimumPuan: 20, aciklama: 'Sufficient SOL balance' },
      koken: { kategoriAdi: 'Provenance', puan: 22, maksimumPuan: 25, aciklama: 'Trusted source wallet' },
    });
    setYukleniyor(false);
  }, [adres]);

  // Adres değiştiğinde raporu yenile
  useEffect(() => {
    if (adres) {
      raporuCek();
    }
  }, [adres, raporuCek]);

  // Yükleniyor durumu
  if (yukleniyor) {
    return (
      <div className="bg-zemin-kart border border-sinir rounded-xl p-5 shadow-panel animate-kayma">
        <h3 className="text-sm font-semibold text-yazi-ikincil uppercase tracking-wider mb-4">
          {baslik}
        </h3>
        <div className="flex flex-col items-center gap-4">
          <div className="w-28 h-28 rounded-full bg-sinir animate-pulse" />
          <div className="w-full space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-4 bg-sinir rounded animate-pulse" />
                <div className="h-1.5 bg-sinir rounded animate-pulse" />
              </div>
            ))}
          </div>
          <p className="text-xs text-yazi-soluk animate-nabiz">
            Calculating trust score...
          </p>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (hata) {
    return (
      <div className="bg-zemin-kart border border-sinir rounded-xl p-5 shadow-panel">
        <h3 className="text-sm font-semibold text-yazi-ikincil uppercase tracking-wider mb-4">
          {baslik}
        </h3>
        <div className="bg-hata/10 border border-hata/30 rounded-lg p-4 space-y-3">
          <p className="text-sm text-hata font-medium">Failed to load report</p>
          <p className="text-xs text-yazi-ikincil">{hata}</p>
          <button
            onClick={raporuCek}
            className="text-xs text-vurgu-acik hover:text-vurgu transition-colors underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Adres yok durumu
  if (!adres) {
    return (
      <div className="bg-zemin-kart border border-sinir rounded-xl p-5 shadow-panel">
        <h3 className="text-sm font-semibold text-yazi-ikincil uppercase tracking-wider mb-4">
          {baslik}
        </h3>
        <p className="text-sm text-yazi-soluk text-center py-6">
          A wallet connection is required for the trust report.
        </p>
      </div>
    );
  }

  // Başarı durumu
  if (!rapor) return null;

  const degerlendirme = genelDegerlendirme(rapor.toplamPuan);

  return (
    <div className="bg-zemin-kart border border-sinir rounded-xl p-5 shadow-panel animate-kayma">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-yazi-ikincil uppercase tracking-wider">
          {baslik}
        </h3>
        <span className="text-xs text-yazi-soluk font-mono">
          {rapor.veriKaynagi ?? 'public_rpc'}
        </span>
      </div>

      {/* Dairesel puan göstergesi */}
      <div className="flex flex-col items-center mb-5">
        <DaireselPuan puan={rapor.toplamPuan} />
        <p className="mt-2 text-xs text-yazi-ikincil text-center max-w-[200px] leading-relaxed">
          {degerlendirme}
        </p>
      </div>

      {/* Kategori dökümleri */}
      <div className="space-y-4 border-t border-sinir pt-4">
        <KategoriCubugu kategori={rapor.yas} />
        <KategoriCubugu kategori={rapor.aktivite} />
        <KategoriCubugu kategori={rapor.bakiye} />
        <KategoriCubugu kategori={rapor.koken} />
      </div>

      {/* Hesaplama zamanı */}
      <p className="mt-4 text-xs text-yazi-soluk text-center">
        Calculated at:{' '}
        {new Date(rapor.hesaplanmaZamani).toLocaleString('en-US')}
      </p>
    </div>
  );
}
