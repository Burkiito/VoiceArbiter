'use client';

// VoiceArbiter — Ses Kaydı Bileşeni
// Basılı tut - konuş (Push-to-Talk) ses kayıt arayüzü

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { muzakereDepoyuKullan } from '@/store/muzakere-store';
import type { TarafTuru, MuzakereKaydi } from '@/types';

interface SesKayitProps {
  /** Kaydı yapan taraf */
  taraf: TarafTuru;
  /** Kayıt tamamlandığında çağrılır */
  onKayitTamamlandi?: (kayit: MuzakereKaydi) => void;
  /** Devre dışı durumu */
  devreDisi?: boolean;
}

// ─── Yardımcı bileşen — Dalga formu animasyonu ───────────────────────────────

function DalgaFormAnimasyon({ aktif }: { aktif: boolean }) {
  const cubukSayisi = 12;

  return (
    <div className="flex items-end gap-0.5 h-8">
      {Array.from({ length: cubukSayisi }).map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all ${
            aktif ? 'bg-hata' : 'bg-sinir-acik'
          }`}
          style={{
            height: aktif ? `${Math.random() * 100}%` : '20%',
            animationDelay: `${i * 0.08}s`,
            animation: aktif ? `dalga 0.8s ease-in-out infinite ${i * 0.08}s` : 'none',
            minHeight: '4px',
          }}
        />
      ))}
    </div>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────

/**
 * Push-to-Talk ses kayıt bileşeni.
 * Butona basılı tutulduğu süre boyunca ses kaydeder.
 * Bırakıldığında OpenAI Whisper ile transkripsiyon yapar.
 */
export function SesKayit({ taraf, onKayitTamamlandi, devreDisi = false }: SesKayitProps) {
  const [kayitAktif, setKayitAktif] = useState(false);
  const [transkripsiyon, setTranskripsiyon] = useState(false);
  const [sureNetter, setSureNetter] = useState(0);
  const [hata, setHata] = useState<string | null>(null);
  const [seciliDil, setSeciliDil] = useState('tr');
  const [sonTranskript, setSonTranskript] = useState<string | null>(null);

  const mesajEkle = muzakereDepoyuKullan((d) => d.mesajEkle);
  const bildirimEkle = muzakereDepoyuKullan((d) => d.bildirimEkle);
  const yukleniyorAyarla = muzakereDepoyuKullan((d) => d.yukleniyorAyarla);

  const medyaKaydediciRef = useRef<MediaRecorder | null>(null);
  const sesVerileriRef = useRef<Blob[]>([]);
  const sureRef = useRef<NodeJS.Timeout | null>(null);

  // Süre sayacı temizleme
  useEffect(() => {
    return () => {
      if (sureRef.current) clearInterval(sureRef.current);
    };
  }, []);

  // Kayıt başlatma
  const kaydiBaslat = useCallback(async () => {
    if (devreDisi || kayitAktif) return;
    setHata(null);
    setSonTranskript(null);

    try {
      // Mikrofon izni iste
      const akis = await navigator.mediaDevices.getUserMedia({ audio: true });

      // MediaRecorder başlat
      const kaydedici = new MediaRecorder(akis, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      sesVerileriRef.current = [];

      kaydedici.ondataavailable = (olay) => {
        if (olay.data.size > 0) {
          sesVerileriRef.current.push(olay.data);
        }
      };

      kaydedici.start(100); // 100ms aralıklarla veri topla
      medyaKaydediciRef.current = kaydedici;
      setKayitAktif(true);
      setSureNetter(0);

      // Süre sayacı başlat
      sureRef.current = setInterval(() => {
        setSureNetter((s) => s + 1);
      }, 1000);
    } catch (hata) {
      console.error('[SesKayit] Mikrofon erişimi reddedildi:', hata);
      setHata('Mikrofon erişimi reddedildi. Lütfen tarayıcı izinlerini kontrol edin.');
      bildirimEkle(
        'hata',
        'Mikrofon Hatası',
        'Ses kaydı için mikrofon izni gereklidir.'
      );
    }
  }, [devreDisi, kayitAktif, bildirimEkle]);

  // Kayıt durdurma ve gönderme
  const kaydiDurdurVeGonder = useCallback(async () => {
    if (!kayitAktif || !medyaKaydediciRef.current) return;

    // Süre sayacını durdur
    if (sureRef.current) {
      clearInterval(sureRef.current);
      sureRef.current = null;
    }

    setKayitAktif(false);

    // Kaydediciyi durdur
    const kaydedici = medyaKaydediciRef.current;

    kaydedici.onstop = async () => {
      // Mikrofon akışını kapat
      kaydedici.stream.getTracks().forEach((parça) => parça.stop());

      // Ses verilerini birleştir
      const sesBlobu = new Blob(sesVerileriRef.current, {
        type: kaydedici.mimeType,
      });

      if (sesBlobu.size < 1000) {
        setHata('Ses çok kısa veya boş. Lütfen en az 1 saniye konuşun.');
        return;
      }

      // Transkripsiyon için sunucuya gönder
      setTranskripsiyon(true);
      yukleniyorAyarla('transkripsiyon', true);

      try {
        const form = new FormData();
        form.append('ses', sesBlobu, `kayit.${kaydedici.mimeType.includes('webm') ? 'webm' : 'ogg'}`);
        form.append('dil', seciliDil);

        const yanit = await fetch('/api/transcribe', {
          method: 'POST',
          body: form,
        });

        if (!yanit.ok) {
          const hataVerisi = await yanit.json().catch(() => ({}));
          throw new Error(hataVerisi.hata ?? 'Transkripsiyon başarısız');
        }

        const { metin, dil } = await yanit.json();

        setSonTranskript(metin);

        // Müzakere kaydı oluştur
        const yeniKayit: MuzakereKaydi = {
          kimlik: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          taraf,
          metin,
          dil,
          zaman: new Date().toISOString(),
        };

        mesajEkle(yeniKayit);
        onKayitTamamlandi?.(yeniKayit);

        bildirimEkle(
          'basari',
          'Ses Kaydedildi',
          `Transkripsiyon tamamlandı: "${metin.substring(0, 50)}${metin.length > 50 ? '...' : ''}"`
        );
      } catch (hata) {
        const hataMesaji =
          hata instanceof Error ? hata.message : 'Bilinmeyen hata';
        setHata(`Transkripsiyon hatası: ${hataMesaji}`);
        bildirimEkle('hata', 'Transkripsiyon Hatası', hataMesaji);
      } finally {
        setTranskripsiyon(false);
        yukleniyorAyarla('transkripsiyon', false);
      }
    };

    kaydedici.stop();
  }, [kayitAktif, seciliDil, taraf, mesajEkle, onKayitTamamlandi, bildirimEkle, yukleniyorAyarla]);

  // Süreyi biçimlendir
  const sureBicimlendir = (saniye: number): string => {
    const d = Math.floor(saniye / 60).toString().padStart(2, '0');
    const s = (saniye % 60).toString().padStart(2, '0');
    return `${d}:${s}`;
  };

  // Taraf rengi
  const tarafRengi = taraf === 'MUSTERI' ? 'vurgu' : 'ikincil';
  const tarafAdi = taraf === 'MUSTERI' ? 'Müşteri' : 'Freelancer';

  return (
    <div className="bg-zemin-kart border border-sinir rounded-xl p-4 shadow-panel">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-yazi-ikincil uppercase tracking-wider">
          {tarafAdi} — Ses Kaydı
        </h3>
        {/* Dil seçimi */}
        <select
          value={seciliDil}
          onChange={(e) => setSeciliDil(e.target.value)}
          disabled={kayitAktif || transkripsiyon}
          className="text-xs bg-zemin-acik border border-sinir rounded px-2 py-1 text-yazi-ikincil focus:outline-none focus:border-sinir-vurgu disabled:opacity-50"
        >
          <option value="tr">Türkçe</option>
          <option value="en">İngilizce</option>
          <option value="auto">Otomatik</option>
        </select>
      </div>

      {/* Dalga formu animasyonu */}
      <div className="flex justify-center mb-4 h-8">
        <DalgaFormAnimasyon aktif={kayitAktif} />
      </div>

      {/* Kayıt butonu */}
      <div className="flex flex-col items-center gap-3">
        <button
          onMouseDown={kaydiBaslat}
          onMouseUp={kaydiDurdurVeGonder}
          onTouchStart={kaydiBaslat}
          onTouchEnd={kaydiDurdurVeGonder}
          disabled={devreDisi || transkripsiyon}
          className={`
            relative w-20 h-20 rounded-full font-semibold text-sm transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed select-none
            ${kayitAktif
              ? `bg-hata shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-110 text-white`
              : `bg-${tarafRengi} hover:bg-${tarafRengi}-acik shadow-${tarafRengi} text-white hover:scale-105`
            }
          `}
        >
          {kayitAktif ? (
            <>
              <span className="block text-2xl">⬛</span>
              <span className="text-xs mt-0.5 block">{sureBicimlendir(sureNetter)}</span>
            </>
          ) : transkripsiyon ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block mx-auto" />
          ) : (
            <span className="block text-2xl">🎙️</span>
          )}
        </button>

        {/* Durum metni */}
        <p className="text-xs text-yazi-ikincil text-center">
          {kayitAktif
            ? 'Kaydediliyor... Bırakmak için parmağınızı kaldırın'
            : transkripsiyon
            ? 'Transkripsiyon yapılıyor...'
            : 'Kayıt için basılı tutun'}
        </p>
      </div>

      {/* Hata mesajı */}
      {hata && (
        <div className="mt-3 bg-hata/10 border border-hata/30 rounded-lg p-3">
          <p className="text-xs text-hata">{hata}</p>
        </div>
      )}

      {/* Son transkript */}
      {sonTranskript && !kayitAktif && !transkripsiyon && (
        <div className="mt-3 bg-basari/5 border border-basari/20 rounded-lg p-3 animate-kayma">
          <p className="text-xs text-yazi-soluk mb-1">Son Transkript:</p>
          <p className="text-sm text-yazi-birincil leading-relaxed">"{sonTranskript}"</p>
        </div>
      )}
    </div>
  );
}
