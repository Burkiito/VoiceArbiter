'use client';

// VoiceArbiter — Yapay Zeka Mediator Bileşeni
// Müzakere transkriptlerini analiz eder ve sözleşme şartlarını çıkarır

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { muzakereDepoyuKullan } from '@/store/muzakere-store';
import type { SozlesmeSartlari, MuzakereKaydi } from '@/types';

// ─── Transkript mesajı bileşeni ────────────────────────────────────────────────

function TranskriptMesaj({ kayit }: { kayit: MuzakereKaydi }) {
  const solMu = kayit.taraf === 'MUSTERI';

  return (
    <div className={`flex ${solMu ? 'justify-start' : 'justify-end'} mb-3`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
          solMu
            ? 'bg-vurgu/15 border border-vurgu/30 rounded-tl-sm'
            : 'bg-ikincil/15 border border-ikincil/30 rounded-tr-sm'
        }`}
      >
        {/* Taraf etiketi */}
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className={`text-xs font-semibold ${
              solMu ? 'text-vurgu-acik' : 'text-ikincil-acik'
            }`}
          >
            {kayit.taraf === 'MUSTERI' ? 'Müşteri' : 'Freelancer'}
          </span>
          <span className="text-xs text-yazi-soluk">
            {new Date(kayit.zaman).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        {/* Metin */}
        <p className="text-sm text-yazi-birincil leading-relaxed">{kayit.metin}</p>
      </div>
    </div>
  );
}

// ─── Çıkarılan şart satırı ─────────────────────────────────────────────────────

function SartSatiri({
  etiket,
  deger,
  eksik,
}: {
  etiket: string;
  deger: string | null;
  eksik?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-sinir last:border-0">
      <span className="text-xs text-yazi-soluk flex-shrink-0 w-24">{etiket}</span>
      {deger ? (
        <span className="text-sm text-yazi-birincil text-right">{deger}</span>
      ) : (
        <span className="text-xs text-uyari italic">
          {eksik ? 'Belirtilmedi' : '—'}
        </span>
      )}
    </div>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────

/**
 * AI Mediator paneli.
 * Müzakere transkriptlerini izler ve sözleşme şartlarını otomatik çıkarır.
 */
export function YapayZekaMediator() {
  const muzakereMesajlari = muzakereDepoyuKullan((d) => d.muzakereMesajlari);
  const sartlariGuncelle = muzakereDepoyuKullan((d) => d.sartlariGuncelle);
  const asamaGec = muzakereDepoyuKullan((d) => d.asamaGec);
  const aktifAsama = muzakereDepoyuKullan((d) => d.aktifAsama);
  const sozlesmeSartlari = muzakereDepoyuKullan((d) => d.sozlesmeSartlari);
  const bildirimEkle = muzakereDepoyuKullan((d) => d.bildirimEkle);

  const [analiz, setAnaliz] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [sonAnalizSayisi, setSonAnalizSayisi] = useState(0);

  const mesajListesiRef = useRef<HTMLDivElement>(null);

  // Yeni mesaj eklendiğinde otomatik kaydır
  useEffect(() => {
    if (mesajListesiRef.current) {
      mesajListesiRef.current.scrollTop = mesajListesiRef.current.scrollHeight;
    }
  }, [muzakereMesajlari]);

  // Yeni mesaj geldiğinde analiz tetikle (3 mesajdan sonra)
  useEffect(() => {
    const yeniMesajlar = muzakereMesajlari.length;

    if (
      yeniMesajlar >= 3 &&
      yeniMesajlar !== sonAnalizSayisi &&
      !analiz &&
      aktifAsama === 'MUZAKERE'
    ) {
      sartlariAnalizEt();
    }
  }, [muzakereMesajlari.length, aktifAsama]);

  // Sözleşme şartlarını analiz et
  const sartlariAnalizEt = useCallback(async () => {
    if (analiz || muzakereMesajlari.length === 0) return;

    setAnaliz(true);
    setHata(null);
    setSonAnalizSayisi(muzakereMesajlari.length);

    try {
      const transkriptler = muzakereMesajlari.map(
        (m) => `${m.taraf === 'MUSTERI' ? 'Müşteri' : 'Freelancer'}: ${m.metin}`
      );

      const yanit = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transkript: transkriptler }),
      });

      if (!yanit.ok) {
        const hataVerisi = await yanit.json().catch(() => ({}));
        throw new Error(hataVerisi.hata ?? 'Analiz başarısız');
      }

      const { sartlar }: { sartlar: SozlesmeSartlari } = await yanit.json();
      sartlariGuncelle(sartlar);

      // Yeterli şart çıkarıldıysa ONAY aşamasına geç
      if (sartlar.miktar !== null && sartlar.kapsam !== null && aktifAsama === 'MUZAKERE') {
        asamaGec('ONAY');
        bildirimEkle(
          'bilgi',
          'Şartlar Çıkarıldı',
          'AI Mediator sözleşme şartlarını belirledi. Lütfen onaylayın.'
        );
      }
    } catch (hata) {
      const hataMesaji = hata instanceof Error ? hata.message : 'Bilinmeyen hata';
      setHata(hataMesaji);
      console.error('[YapayZekaMediator] Analiz hatası:', hata);
    } finally {
      setAnaliz(false);
    }
  }, [analiz, muzakereMesajlari, sartlariGuncelle, asamaGec, aktifAsama, bildirimEkle]);

  // Güven seviyesi rengi
  const guvenRengi =
    (sozlesmeSartlari?.guvenSeviyesi ?? 0) >= 0.8
      ? 'text-basari'
      : (sozlesmeSartlari?.guvenSeviyesi ?? 0) >= 0.5
      ? 'text-uyari'
      : 'text-hata';

  return (
    <div className="bg-zemin-kart border border-sinir rounded-xl shadow-panel flex flex-col h-full min-h-[500px]">
      {/* Başlık */}
      <div className="flex items-center justify-between p-4 border-b border-sinir">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-vurgu to-ikincil animate-nabiz" />
          <h3 className="text-sm font-semibold text-yazi-ikincil uppercase tracking-wider">
            AI Mediator
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {analiz && (
            <span className="text-xs text-vurgu-acik flex items-center gap-1">
              <span className="w-3 h-3 border border-vurgu/30 border-t-vurgu rounded-full animate-spin" />
              Analiz ediliyor...
            </span>
          )}
          <button
            onClick={sartlariAnalizEt}
            disabled={analiz || muzakereMesajlari.length === 0}
            className="text-xs px-2.5 py-1 rounded bg-vurgu/20 text-vurgu-acik hover:bg-vurgu/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Analiz Et
          </button>
        </div>
      </div>

      {/* Transkript akışı */}
      <div
        ref={mesajListesiRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
        style={{ maxHeight: '300px' }}
      >
        {muzakereMesajlari.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <div className="w-12 h-12 rounded-full bg-zemin-acik border border-sinir flex items-center justify-center">
              <span className="text-xl">🎙️</span>
            </div>
            <p className="text-sm text-yazi-soluk text-center max-w-[200px]">
              Müzakere başladığında ses transkriptleri burada görünecek
            </p>
          </div>
        ) : (
          muzakereMesajlari.map((kayit) => (
            <TranskriptMesaj key={kayit.kimlik} kayit={kayit} />
          ))
        )}
      </div>

      {/* Çıkarılan şartlar */}
      {sozlesmeSartlari && (
        <div className="border-t border-sinir p-4 animate-kayma">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-yazi-ikincil uppercase tracking-wider">
              Çıkarılan Sözleşme Şartları
            </h4>
            <span className={`text-xs font-mono ${guvenRengi}`}>
              Güven: %{Math.round((sozlesmeSartlari.guvenSeviyesi ?? 0) * 100)}
            </span>
          </div>

          <div className="bg-zemin-acik rounded-lg border border-sinir p-3">
            <SartSatiri
              etiket="Tutar"
              deger={sozlesmeSartlari.miktar !== null ? `${sozlesmeSartlari.miktar} SOL` : null}
              eksik
            />
            <SartSatiri
              etiket="Son Tarih"
              deger={
                sozlesmeSartlari.sonTarih
                  ? new Date(sozlesmeSartlari.sonTarih).toLocaleDateString('tr-TR')
                  : null
              }
              eksik
            />
            <SartSatiri
              etiket="Kapsam"
              deger={sozlesmeSartlari.kapsam}
              eksik
            />
            <SartSatiri
              etiket="Ödeme"
              deger={sozlesmeSartlari.odemeKosullari}
            />
          </div>

          {/* Eksik bilgiler uyarısı */}
          {sozlesmeSartlari.eksikBilgiler.length > 0 && (
            <div className="mt-2 bg-uyari/10 border border-uyari/30 rounded-lg p-2">
              <p className="text-xs text-uyari font-medium mb-1">Eksik Bilgiler:</p>
              <ul className="text-xs text-yazi-ikincil space-y-0.5">
                {sozlesmeSartlari.eksikBilgiler.map((bilgi, i) => (
                  <li key={i}>• {bilgi}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Hata */}
      {hata && (
        <div className="p-4 border-t border-sinir">
          <div className="bg-hata/10 border border-hata/30 rounded-lg p-3">
            <p className="text-xs text-hata">{hata}</p>
          </div>
        </div>
      )}
    </div>
  );
}
