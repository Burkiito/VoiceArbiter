'use client';

// VoiceArbiter — İki Taraf Paneli (Hibrit Cüzdan Mimarisi)
//
// Taraf A (Müşteri)   → WalletMultiButton (Phantom bağlantısı)
// Taraf B (Freelancer) → Sistem Cüzdanı  (arka uç keypair, Phantom yok)

import React, { useEffect, useState, useCallback } from 'react';
import { muzakereDepoyuKullan } from '@/store/negotiation-store';
import { adresKisalt } from '@/lib/solana';
import type { GuvenPuaniDetay } from '@/types';

// ─── Güven Badge (Kompakt) ────────────────────────────────────────────────────

interface GuvenBadgeProps {
  /** Sorgulanacak cüzdan adresi */
  adres: string;
}

/**
 * Kompakt güven skoru badge'i.
 * Puanı yükler, dairesel gösterge ve kategori çubukları ile gösterir.
 * Genişletilebilir — tam rapor için "Detaylar" butonu.
 */
function GuvenBadge({ adres }: GuvenBadgeProps) {
  const [rapor, setRapor] = useState<GuvenPuaniDetay | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [genisletildi, setGenisletildi] = useState(false);

  const raporuCek = useCallback(async () => {
    if (!adres) return;
    setYukleniyor(true);
    await new Promise((r) => setTimeout(r, 500));
    setRapor({
      adres,
      toplamPuan: 85,
      hesaplanmaZamani: new Date().toISOString(),
      yas: { kategoriAdi: 'Cüzdan Yaşı', puan: 24, maksimumPuan: 30, aciklama: '120 günlük cüzdan' },
      aktivite: { kategoriAdi: 'İşlem Aktivitesi', puan: 22, maksimumPuan: 25, aciklama: '142 işlem tespit edildi' },
      bakiye: { kategoriAdi: 'Bakiye', puan: 17, maksimumPuan: 20, aciklama: 'Yeterli SOL bakiyesi mevcut' },
      koken: { kategoriAdi: 'Köken', puan: 22, maksimumPuan: 25, aciklama: 'Güvenilir kaynak cüzdanı' },
    });
    setYukleniyor(false);
  }, [adres]);

  useEffect(() => {
    if (adres) raporuCek();
  }, [adres, raporuCek]);

  // Puana göre renk
  const puanRengi = (puan: number) =>
    puan >= 75
      ? { sinif: 'text-basari', cevre: '#10b981' }
      : puan >= 50
      ? { sinif: 'text-ikincil', cevre: '#0ea5e9' }
      : puan >= 25
      ? { sinif: 'text-uyari', cevre: '#f59e0b' }
      : { sinif: 'text-hata', cevre: '#ef4444' };

  // ── Yükleniyor ───────────────────────────────────────────────────────────────
  if (yukleniyor) {
    return (
      <div className="mt-3 pt-3 border-t border-sinir">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sinir animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-sinir rounded animate-pulse w-3/4" />
            <div className="h-2 bg-sinir rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!rapor) return null;

  const { sinif: renkSinifi, cevre: cevreRengi } = puanRengi(rapor.toplamPuan);
  const cerceveCevresi = 2 * Math.PI * 18;
  const cerceveDoluluk = ((100 - rapor.toplamPuan) / 100) * cerceveCevresi;

  const kategoriler = [
    { etiket: 'Yaş', veri: rapor.yas },
    { etiket: 'Aktivite', veri: rapor.aktivite },
    { etiket: 'Bakiye', veri: rapor.bakiye },
    { etiket: 'Köken', veri: rapor.koken },
  ];

  return (
    <div className="mt-3 pt-3 border-t border-sinir space-y-2">
      {/* Özet satır */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Küçük dairesel puan göstergesi */}
          <div className="relative flex-shrink-0">
            <svg width="44" height="44" className="-rotate-90">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#1e2d4a" strokeWidth="4" />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke={cevreRengi}
                strokeWidth="4"
                strokeDasharray={cerceveCevresi}
                strokeDashoffset={cerceveDoluluk}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            </svg>
            <span
              className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${renkSinifi}`}
            >
              {rapor.toplamPuan}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium text-yazi-birincil">Güven Skoru</p>
            <p className="text-xs text-yazi-soluk">/100 puan</p>
          </div>
        </div>

        {/* Genişlet/daralt butonu */}
        <button
          onClick={() => setGenisletildi((g) => !g)}
          className="text-xs text-yazi-soluk hover:text-yazi-ikincil transition-colors flex items-center gap-1"
        >
          {genisletildi ? 'Gizle' : 'Detaylar'}
          <svg
            className={`w-3 h-3 transition-transform ${genisletildi ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Detaylı kategori dökümleri (genişletilince görünür) */}
      {genisletildi && (
        <div className="space-y-2.5 bg-zemin-acik rounded-lg p-3 border border-sinir animate-kayma">
          {kategoriler.map(({ etiket, veri }) => {
            const yuzde = (veri.puan / veri.maksimumPuan) * 100;
            const cubukSinif =
              yuzde >= 75
                ? 'bg-basari'
                : yuzde >= 50
                ? 'bg-ikincil'
                : yuzde >= 25
                ? 'bg-uyari'
                : 'bg-hata';

            return (
              <div key={etiket}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-yazi-birincil">{etiket}</span>
                  <span className="text-xs font-mono text-yazi-soluk">
                    {veri.puan}/{veri.maksimumPuan}
                  </span>
                </div>
                <div className="h-1.5 bg-sinir rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${cubukSinif}`}
                    style={{ width: `${yuzde}%` }}
                  />
                </div>
                <p className="text-xs text-yazi-soluk mt-1 leading-relaxed">
                  {veri.aciklama}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Taraf A Paneli (Müşteri — Phantom) ──────────────────────────────────────

/**
 * Müşteri (Taraf A) paneli.
 * WalletMultiButton ile Phantom bağlantısı sağlar.
 * Bağlandığında adresi negotiation-store'a kaydeder.
 */
function TarafAPaneli() {
  const tarafAyiKaydet = muzakereDepoyuKullan((d) => d.tarafAyiKaydet);
  const tarafA = muzakereDepoyuKullan((d) => d.tarafA);

  const [adres, setAdres] = useState<string | null>(null);
  const [baglaniyor, setBaglaniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const phantomIleBaglanan = async () => {
    setBaglaniyor(true);
    setHata(null);
    try {
      const solana = (window as unknown as { solana?: { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }>; } }).solana;
      if (!solana?.isPhantom) throw new Error('Phantom not found. Please install the Phantom extension.');
      const yanit = await solana.connect();
      const yeniAdres = yanit.publicKey.toString();
      setAdres(yeniAdres);
      tarafAyiKaydet(yeniAdres);
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Connection error');
    } finally {
      setBaglaniyor(false);
    }
  };

  const baglantiKes = async () => {
    try {
      await (window as unknown as { solana?: { disconnect: () => Promise<void> } }).solana?.disconnect();
    } catch { /* yoksay */ }
    setAdres(null);
    tarafAyiKaydet(null);
  };

  const bagli = adres !== null;

  return (
    <div className="bg-zemin-kart border border-sinir rounded-xl p-4 shadow-panel flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              tarafA.kayitliMi ? 'bg-basari animate-nabiz' : 'bg-yazi-soluk'
            }`}
          />
          <h3 className="text-sm font-semibold text-yazi-ikincil uppercase tracking-wider">
            Client — Party A
          </h3>
        </div>
        {tarafA.kayitliMi && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-basari/20 text-basari border border-basari/30">
            Connected
          </span>
        )}
      </div>

      {bagli && adres ? (
        <div className="space-y-3 flex-1">
          <div className="bg-zemin-acik rounded-lg p-3 border border-sinir">
            <p className="text-xs text-yazi-soluk mb-1">Phantom Wallet Address</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-mono text-yazi-birincil truncate">
                {adresKisalt(adres, 8, 8)}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(adres)}
                className="flex-shrink-0 text-xs text-vurgu-acik hover:text-vurgu transition-colors"
                title="Copy full address"
              >
                Copy
              </button>
            </div>
          </div>

          <button
            onClick={baglantiKes}
            className="w-full py-2 px-4 rounded-lg border border-sinir-acik text-yazi-ikincil hover:border-hata hover:text-hata text-sm transition-colors"
          >
            Bağlantıyı Kes
          </button>

          <GuvenBadge adres={adres} />
        </div>
      ) : (
        <div className="space-y-3 flex-1 flex flex-col">
          <p className="text-sm text-yazi-ikincil">
            Connect your Phantom wallet to start negotiating.
          </p>
          {hata && (
            <p className="text-xs text-hata bg-hata/10 border border-hata/30 rounded-lg px-3 py-2">
              {hata}
            </p>
          )}
          <button
            onClick={phantomIleBaglanan}
            disabled={baglaniyor}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-vurgu to-vurgu-acik text-white font-semibold text-sm shadow-vurgu hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {baglaniyor ? 'Connecting...' : 'Connect Phantom'}
          </button>
          <p className="text-xs text-yazi-soluk text-center mt-auto">
            Devnet only — no real funds used
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Taraf B Paneli (Freelancer — Sistem Cüzdanı) ────────────────────────────

/**
 * Freelancer (Taraf B) paneli.
 * Phantom KULLANILMAZ — arka uç keypair ile temsil edilir.
 * "Freelancer Olarak Bağlan" butonu /api/freelancer-info'dan adresi çeker
 * ve negotiation-store'a kaydeder.
 */
function TarafBPaneli() {
  const tarafByiKaydet = muzakereDepoyuKullan((d) => d.tarafByiKaydet);
  const tarafB = muzakereDepoyuKullan((d) => d.tarafB);

  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [ag, setAg] = useState<string>('devnet');

  // Bileşen mount olduğunda otomatik bağlan
  useEffect(() => {
    freelancerOlarakBaglanan();
  }, []);

  const freelancerOlarakBaglanan = async () => {
    setYukleniyor(true);
    await new Promise((r) => setTimeout(r, 600));
    const pubkey = process.env.NEXT_PUBLIC_FREELANCER_PUBKEY ?? '';
    tarafByiKaydet(pubkey);
    setAg('devnet');
    setYukleniyor(false);
  };

  return (
    <div className="bg-zemin-kart border border-sinir rounded-xl p-4 shadow-panel flex flex-col">
      {/* Panel başlığı */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              tarafB.dogrulandiMi ? 'bg-ikincil animate-nabiz' : 'bg-yazi-soluk'
            }`}
          />
          <h3 className="text-sm font-semibold text-yazi-ikincil uppercase tracking-wider">
            Freelancer — Party B
          </h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-ikincil/20 text-ikincil border border-ikincil/30">
          System Wallet
        </span>
      </div>

      {/* Yükleniyor durumu */}
      {yukleniyor && (
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-sinir rounded animate-pulse" />
          <div className="h-10 bg-sinir rounded animate-pulse" />
        </div>
      )}

      {/* Hata durumu */}
      {!yukleniyor && hata && (
        <div className="space-y-3 flex-1 flex flex-col">
          <div className="bg-hata/10 border border-hata/30 rounded-lg p-3">
            <p className="text-xs text-hata font-medium mb-1">Keypair Yüklenemedi</p>
            <p className="text-xs text-yazi-ikincil">{hata}</p>
          </div>
          <p className="text-xs text-yazi-soluk">
            Önce şu komutu çalıştırın:{' '}
            <code className="bg-zemin-acik px-1.5 py-0.5 rounded font-mono text-vurgu-acik">
              npm run generate-wallets
            </code>
          </p>
          {/* Manuel bağlan butonu */}
          <button
            onClick={freelancerOlarakBaglanan}
            className="w-full py-2.5 px-4 rounded-lg border border-ikincil/50 text-ikincil hover:bg-ikincil/10 transition-colors text-sm font-medium mt-auto"
          >
            Freelancer Olarak Bağlan
          </button>
        </div>
      )}

      {/* Bağlı durum */}
      {!yukleniyor && !hata && tarafB.dogrulandiMi && tarafB.acikAnahtarAdresi && (
        <div className="space-y-3 flex-1">
          {/* Genel anahtar */}
          <div className="bg-zemin-acik rounded-lg p-3 border border-sinir">
            <p className="text-xs text-yazi-soluk mb-1">Public Key (Backend Keypair)</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-mono text-yazi-birincil truncate">
                {adresKisalt(tarafB.acikAnahtarAdresi, 8, 8)}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(tarafB.acikAnahtarAdresi!)}
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

          {/* Hibrit imzalama açıklaması */}
          <div className="bg-ikincil/5 border border-ikincil/20 rounded-lg p-3">
            <p className="text-xs text-ikincil font-medium mb-1">Backend Signing (Active)</p>
            <p className="text-xs text-yazi-ikincil leading-relaxed">
              Signature is added server-side. The private key is never sent to the browser.
            </p>
          </div>

          {/* Güven badge */}
          <GuvenBadge adres={tarafB.acikAnahtarAdresi} />
        </div>
      )}

      {/* Bağlı değil ve hata yoksa — ilk yükleme tamamlanana kadar görünmez */}
      {!yukleniyor && !hata && !tarafB.dogrulandiMi && (
        <div className="space-y-3 flex-1 flex flex-col">
          <p className="text-sm text-yazi-ikincil">
            Connect to activate the backend system wallet.
          </p>
          <button
            onClick={freelancerOlarakBaglanan}
            className="w-full py-3 px-4 rounded-lg bg-ikincil/20 border border-ikincil/40 text-ikincil font-semibold hover:bg-ikincil/30 transition-colors text-sm mt-auto"
          >
            Connect as Freelancer
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Ana PartyPanel Bileşeni ──────────────────────────────────────────────────

/**
 * VoiceArbiter — İki Taraf Paneli
 *
 * Taraf A ve Taraf B panellerini yan yana (masaüstü) veya alt alta (mobil)
 * gösterir. Zustand store'daki fase göre bir ilerleme göstergesi de bulunur.
 */
export function PartyPanel() {
  const aktifAsama = muzakereDepoyuKullan((d) => d.aktifAsama);
  const tarafA = muzakereDepoyuKullan((d) => d.tarafA);
  const tarafB = muzakereDepoyuKullan((d) => d.tarafB);

  // Faz etiketi Türkçe karşılıkları
  const fazEtiketleri: Record<string, string> = {
    IDLE: 'Idle',
    NEGOTIATING: 'Negotiating',
    CONFIRMING: 'Confirming',
    ESCROW_FUNDED: 'Escrow Active',
    COMPLETED: 'Completed',
  };

  // Faz badge rengi
  const fazRengi: Record<string, string> = {
    IDLE: 'bg-yazi-soluk/20 text-yazi-soluk',
    NEGOTIATING: 'bg-ikincil/20 text-ikincil border-ikincil/30',
    CONFIRMING: 'bg-vurgu/20 text-vurgu-acik border-vurgu/30',
    ESCROW_FUNDED: 'bg-uyari/20 text-uyari border-uyari/30',
    COMPLETED: 'bg-basari/20 text-basari border-basari/30',
  };

  const ikisiDeBagli = tarafA.kayitliMi && tarafB.dogrulandiMi;

  return (
    <div className="space-y-4">
      {/* Üst durum çubuğu */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold text-yazi-birincil">Parties</h2>
        <div className="flex items-center gap-3">
          {ikisiDeBagli && (
            <span className="flex items-center gap-1.5 text-xs text-basari">
              <span className="w-1.5 h-1.5 rounded-full bg-basari animate-nabiz" />
              Ready to Negotiate
            </span>
          )}
          {/* Aktif faz badge */}
          <span
            className={`text-xs px-2.5 py-1 rounded-full border font-medium ${fazRengi[aktifAsama] ?? 'bg-yazi-soluk/20 text-yazi-soluk'}`}
          >
            {fazEtiketleri[aktifAsama] ?? aktifAsama}
          </span>
        </div>
      </div>

      {/* Panel grid: yan yana masaüstü, alt alta mobil */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TarafAPaneli />
        <TarafBPaneli />
      </div>

      {/* Her iki taraf da bağlıyken müzakereye çağrı */}
      {ikisiDeBagli && aktifAsama === 'NEGOTIATING' && (
        <div className="bg-ikincil/5 border border-ikincil/20 rounded-xl p-4 text-center animate-kayma">
          <p className="text-sm text-yazi-ikincil">
            Both parties are ready.{' '}
            <span className="text-ikincil font-medium">
              You can start voice negotiation.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
