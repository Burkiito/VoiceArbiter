'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { muzakereDepoyuKullan } from '@/store/negotiation-store';
import type { TranskriptKaydi } from '@/store/negotiation-store';

const DILLER = [
  { kod: 'en', ad: 'English' },
  { kod: 'es', ad: 'Spanish' },
  { kod: 'pt', ad: 'Portuguese' },
  { kod: 'ko', ad: 'Korean' },
  { kod: 'vi', ad: 'Vietnamese' },
];

function DalgaFormu({ aktif }: { aktif: boolean }) {
  const CUBUK_SAYISI = 14;
  return (
    <div className="flex items-center justify-center gap-0.5 h-10">
      {Array.from({ length: CUBUK_SAYISI }).map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${aktif ? 'bg-hata' : 'bg-sinir-acik'}`}
          style={{
            height: aktif ? `${20 + Math.sin(i * 0.8) * 60 + 20}%` : '20%',
            animation: aktif ? `dalga 0.7s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.06}s`,
            minHeight: '4px',
          }}
        />
      ))}
    </div>
  );
}

function KonusmaBalonuBileseni({ kayit }: { kayit: TranskriptKaydi }) {
  const musteriMi = kayit.taraf === 'MUSTERI';
  const zamanMetni = new Date(kayit.zaman).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex gap-2 ${musteriMi ? 'justify-end' : 'justify-start'}`}>
      {!musteriMi && (
        <div className="w-7 h-7 rounded-full bg-ikincil/20 border border-ikincil/30 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-xs text-ikincil font-bold">F</span>
        </div>
      )}
      <div className={`max-w-[80%] space-y-1 ${musteriMi ? 'items-end' : 'items-start'} flex flex-col`}>
        <span className="text-xs text-yazi-soluk px-1">
          {musteriMi ? 'Client' : 'Freelancer'} · {zamanMetni}
        </span>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            musteriMi
              ? 'bg-vurgu/20 border border-vurgu/30 text-yazi-birincil rounded-tr-sm'
              : 'bg-ikincil/20 border border-ikincil/30 text-yazi-birincil rounded-tl-sm'
          }`}
        >
          {kayit.metin}
          {kayit.translatedText && (
            <p className="text-xs text-yazi-soluk italic mt-1.5 pt-1.5 border-t border-sinir/40">
              (Translated: {kayit.translatedText})
            </p>
          )}
        </div>
      </div>
      {musteriMi && (
        <div className="w-7 h-7 rounded-full bg-vurgu/20 border border-vurgu/30 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-xs text-vurgu-acik font-bold">C</span>
        </div>
      )}
    </div>
  );
}

function YukleniyorBalonu({ taraf }: { taraf: 'MUSTERI' | 'FREELANCER' }) {
  const musteriMi = taraf === 'MUSTERI';
  return (
    <div className={`flex gap-2 ${musteriMi ? 'justify-end' : 'justify-start'}`}>
      {!musteriMi && (
        <div className="w-7 h-7 rounded-full bg-ikincil/20 border border-ikincil/30 flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-ikincil font-bold">F</span>
        </div>
      )}
      <div
        className={`rounded-2xl px-4 py-3 ${
          musteriMi
            ? 'bg-vurgu/10 border border-vurgu/20 rounded-tr-sm'
            : 'bg-ikincil/10 border border-ikincil/20 rounded-tl-sm'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-yazi-soluk animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SesliMuzakerePaneli() {
  const aktifAsama = muzakereDepoyuKullan((d) => d.aktifAsama);
  const transkriptler = muzakereDepoyuKullan((d) => d.transkriptler);
  const transkriptEkle = muzakereDepoyuKullan((d) => d.transkriptEkle);
  const transkriptCevirisiniGuncelle = muzakereDepoyuKullan((d) => d.transkriptCevirisiniGuncelle);
  const sartlariGuncelle = muzakereDepoyuKullan((d) => d.sartlariGuncelle);
  const asamayiGuncelle = muzakereDepoyuKullan((d) => d.asamayiGuncelle);
  const partyALang = muzakereDepoyuKullan((d) => d.partyALang);
  const partyBLang = muzakereDepoyuKullan((d) => d.partyBLang);
  const partyALangAyarla = muzakereDepoyuKullan((d) => d.partyALangAyarla);
  const partyBLangAyarla = muzakereDepoyuKullan((d) => d.partyBLangAyarla);

  const [aktifTaraf, setAktifTaraf] = useState<'MUSTERI' | 'FREELANCER'>('MUSTERI');
  const [kayitAktif, setKayitAktif] = useState(false);
  const [transkripsiyon, setTranskripsiyon] = useState(false);
  const [analizYukleniyor, setAnalizYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [kayitSuresi, setKayitSuresi] = useState(0);

  const sonTtsMesajRef = useRef<string | null>(null);
  const kaydediciRef = useRef<MediaRecorder | null>(null);
  const sesParcalariRef = useRef<Blob[]>([]);
  const sureZamanlayicisiRef = useRef<NodeJS.Timeout | null>(null);
  const sohbetSonuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    sohbetSonuRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transkriptler, transkripsiyon]);

  useEffect(() => {
    return () => {
      if (sureZamanlayicisiRef.current) clearInterval(sureZamanlayicisiRef.current);
      kaydediciRef.current?.stream?.getTracks().forEach((p) => p.stop());
    };
  }, []);

  useEffect(() => {
    if (transkriptler.length === 0) return;
    const sonKayit = transkriptler[transkriptler.length - 1];
    if (sonKayit.kimlik === sonTtsMesajRef.current) return;
    sonTtsMesajRef.current = sonKayit.kimlik;

    const konusanLang = (sonKayit.taraf === 'MUSTERI' ? partyALang : partyBLang) || 'en';
    const dinleyenLang = (sonKayit.taraf === 'MUSTERI' ? partyBLang : partyALang) || 'en';

    const ttsOynat = async (metin: string, oynatilicakDil: string) => {
      if (oynatilicakDil === 'tr') return;
      try {
        const r = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metin }),
        });
        if (!r.ok) throw new Error(`TTS ${r.status}`);
        const blob = await r.blob();
        new Audio(URL.createObjectURL(blob)).play();
      } catch (err) {
        console.error('[SesliMuzakerePaneli] TTS error:', err);
      }
    };

    if (konusanLang !== dinleyenLang) {
      fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sonKayit.metin, targetLang: dinleyenLang }),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((data) => {
          if (data.translatedText) {
            transkriptCevirisiniGuncelle(sonKayit.kimlik, data.translatedText);
            ttsOynat(data.translatedText, dinleyenLang);
          } else {
            ttsOynat(sonKayit.metin, konusanLang);
          }
        })
        .catch((err) => {
          console.error('[SesliMuzakerePaneli] Translation error:', err);
          ttsOynat(sonKayit.metin, konusanLang);
        });
    } else {
      ttsOynat(sonKayit.metin, konusanLang);
    }
  }, [transkriptler, partyALang, partyBLang, transkriptCevirisiniGuncelle]);

  const kaydiBaslat = useCallback(async () => {
    if (kayitAktif || transkripsiyon) return;
    setHata(null);
    setKayitSuresi(0);
    try {
      const akis = await navigator.mediaDevices.getUserMedia({ audio: true });
      const kaydedici = new MediaRecorder(akis, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      sesParcalariRef.current = [];
      kaydedici.ondataavailable = (olay) => {
        if (olay.data.size > 0) sesParcalariRef.current.push(olay.data);
      };
      kaydedici.start(100);
      kaydediciRef.current = kaydedici;
      setKayitAktif(true);
      sureZamanlayicisiRef.current = setInterval(() => {
        setKayitSuresi((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error('[SesliMuzakerePaneli] Microphone error:', err);
      setHata('Microphone access denied. Check browser permissions.');
    }
  }, [kayitAktif, transkripsiyon]);

  const kaydiDurdur = useCallback(() => {
    if (!kayitAktif || !kaydediciRef.current) return;
    if (sureZamanlayicisiRef.current) {
      clearInterval(sureZamanlayicisiRef.current);
      sureZamanlayicisiRef.current = null;
    }
    setKayitAktif(false);
    const kaydedici = kaydediciRef.current;
    const konusanDil = aktifTaraf === 'MUSTERI' ? partyALang : partyBLang;

    kaydedici.onstop = async () => {
      kaydedici.stream.getTracks().forEach((p) => p.stop());
      const sesBlobu = new Blob(sesParcalariRef.current, { type: kaydedici.mimeType });
      if (sesBlobu.size < 500) {
        setHata('Recording too short. Speak for at least 1 second.');
        return;
      }
      setTranskripsiyon(true);
      const suankiTaraf = aktifTaraf;
      try {
        const form = new FormData();
        form.append('ses', sesBlobu, sesBlobu.type.includes('webm') ? 'kayit.webm' : 'kayit.ogg');
        form.append('dil', konusanDil);
        const yanit = await fetch('/api/transcribe', { method: 'POST', body: form });
        if (!yanit.ok) {
          const hataVerisi = await yanit.json().catch(() => ({}));
          throw new Error(hataVerisi.hata ?? 'Transcription failed');
        }
        const { metin, dil } = await yanit.json();
        transkriptEkle({
          kimlik: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          taraf: suankiTaraf,
          metin,
          dil,
          zaman: new Date().toISOString(),
        });
      } catch (err) {
        setHata(err instanceof Error ? err.message : 'Transcription error');
      } finally {
        setTranskripsiyon(false);
      }
    };
    kaydedici.stop();
  }, [kayitAktif, aktifTaraf, partyALang, partyBLang, transkriptEkle]);

  const sureBicimlendir = (sn: number) =>
    `${Math.floor(sn / 60).toString().padStart(2, '0')}:${(sn % 60).toString().padStart(2, '0')}`;

  const kaydToggle = useCallback(() => {
    if (transkripsiyon) return;
    if (kayitAktif) {
      kaydiDurdur();
    } else {
      kaydiBaslat();
    }
  }, [kayitAktif, transkripsiyon, kaydiBaslat, kaydiDurdur]);

  const handleAnaliz = useCallback(async () => {
    if (transkriptler.length === 0 || analizYukleniyor) return;
    setAnalizYukleniyor(true);
    setHata(null);
    try {
      const yanit = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transkript: transkriptler.map((t) => t.metin) }),
      });
      if (!yanit.ok) {
        const hataVerisi = await yanit.json().catch(() => ({}));
        throw new Error(hataVerisi.hata ?? `API error ${yanit.status}`);
      }
      const data = await yanit.json();
      sartlariGuncelle(data.sartlar);
      asamayiGuncelle('CONFIRMING');
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalizYukleniyor(false);
    }
  }, [transkriptler, analizYukleniyor, sartlariGuncelle, asamayiGuncelle]);

  if (aktifAsama !== 'NEGOTIATING') {
    const fazMesajlari: Record<string, { baslik: string; aciklama: string }> = {
      IDLE: {
        baslik: 'Negotiation Not Started',
        aciklama: 'Voice negotiation activates when both parties are connected.',
      },
      CONFIRMING: {
        baslik: 'Awaiting Confirmation',
        aciklama: 'Terms extracted. Waiting for parties to confirm.',
      },
      ESCROW_FUNDED: {
        baslik: 'Escrow Active',
        aciklama: 'Payment locked in escrow. Contract in execution phase.',
      },
      COMPLETED: {
        baslik: 'Contract Completed',
        aciklama: 'This negotiation concluded successfully.',
      },
    };
    const mesaj = fazMesajlari[aktifAsama] ?? {
      baslik: aktifAsama,
      aciklama: 'Voice negotiation unavailable at this stage.',
    };
    return (
      <div className="bg-zemin-kart border border-sinir rounded-xl p-6 shadow-panel flex flex-col items-center justify-center gap-3 min-h-[200px]">
        <div className="w-12 h-12 rounded-full bg-sinir flex items-center justify-center">
          <svg className="w-6 h-6 text-yazi-soluk" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-yazi-ikincil">{mesaj.baslik}</p>
          <p className="text-xs text-yazi-soluk mt-1">{mesaj.aciklama}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zemin-kart border border-sinir rounded-xl shadow-panel flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-sinir">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-hata animate-nabiz" />
          <h3 className="text-sm font-semibold text-yazi-ikincil uppercase tracking-wider">
            Voice Negotiation
          </h3>
        </div>
        <span className="text-xs text-yazi-soluk font-mono">
          {transkriptler.length} messages
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[220px] max-h-[340px]">
        {transkriptler.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-10">
            <div className="w-10 h-10 rounded-full bg-sinir flex items-center justify-center">
              <svg className="w-5 h-5 text-yazi-soluk" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-xs text-yazi-soluk text-center">
              Select a party and click the<br />microphone button to begin.
            </p>
          </div>
        ) : (
          transkriptler.map((kayit) => (
            <KonusmaBalonuBileseni key={kayit.kimlik} kayit={kayit} />
          ))
        )}
        {transkripsiyon && <YukleniyorBalonu taraf={aktifTaraf} />}
        <div ref={sohbetSonuRef} />
      </div>

      {kayitAktif && (
        <div className="px-4 py-2 border-t border-sinir bg-hata/5">
          <DalgaFormu aktif={true} />
          <p className="text-xs text-hata text-center mt-1 animate-nabiz">
            Recording — {sureBicimlendir(kayitSuresi)}
          </p>
        </div>
      )}

      {transkripsiyon && !kayitAktif && (
        <div className="px-4 py-2 border-t border-sinir bg-uyari/5">
          <div className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-uyari/40 border-t-uyari rounded-full animate-spin" />
            <p className="text-xs text-uyari">Transcribing...</p>
          </div>
        </div>
      )}

      <div className="px-4 pb-4 pt-3 border-t border-sinir space-y-3">
        <div className="flex rounded-lg overflow-hidden border border-sinir">
          {(['MUSTERI', 'FREELANCER'] as const).map((taraf) => {
            const isClient = taraf === 'MUSTERI';
            const isActive = aktifTaraf === taraf;
            const currentLang = isClient ? partyALang : partyBLang;
            const setLang = isClient ? partyALangAyarla : partyBLangAyarla;
            return (
              <div
                key={taraf}
                className={`flex-1 flex items-center ${isClient ? 'border-r border-sinir' : ''} ${
                  isActive ? (isClient ? 'bg-vurgu/20' : 'bg-ikincil/20') : 'bg-zemin-acik'
                }`}
              >
                <button
                  onClick={() => !kayitAktif && setAktifTaraf(taraf)}
                  disabled={kayitAktif || transkripsiyon}
                  className={`flex-1 py-2 px-2 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left ${
                    isActive
                      ? isClient
                        ? 'text-vurgu-acik'
                        : 'text-ikincil'
                      : 'text-yazi-soluk hover:text-yazi-ikincil'
                  }`}
                >
                  {isClient ? 'Client (A)' : 'Freelancer (B)'}
                </button>
                <select
                  value={currentLang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-transparent text-xs text-yazi-soluk border-l border-sinir px-1.5 py-2 outline-none cursor-pointer hover:text-yazi-ikincil"
                >
                  {DILLER.map((d) => (
                    <option key={d.kod} value={d.kod} className="bg-zemin text-yazi-birincil">
                      {d.ad}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {hata && (
          <div className="bg-hata/10 border border-hata/30 rounded-lg px-3 py-2">
            <p className="text-xs text-hata">{hata}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={kaydToggle}
            disabled={transkripsiyon}
            className={`
              relative w-16 h-16 rounded-full font-semibold transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed
              ${kayitAktif
                ? 'bg-hata shadow-[0_0_24px_rgba(239,68,68,0.45)] scale-110 text-white'
                : aktifTaraf === 'MUSTERI'
                  ? 'bg-vurgu/80 hover:bg-vurgu text-white hover:scale-105 shadow-vurgu'
                  : 'bg-ikincil/80 hover:bg-ikincil text-white hover:scale-105 shadow-ikincil'
              }
            `}
          >
            {kayitAktif ? (
              <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
          <p className="text-xs text-yazi-soluk text-center">
            {transkripsiyon
              ? 'Processing...'
              : kayitAktif
                ? 'Click to Stop'
                : 'Click to Speak'}
          </p>
        </div>

        {transkriptler.length > 0 && (
          <button
            onClick={handleAnaliz}
            disabled={kayitAktif || transkripsiyon || analizYukleniyor}
            className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all duration-150
              bg-basari/15 border border-basari/30 text-basari
              hover:bg-basari/25 disabled:opacity-40 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {analizYukleniyor ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-basari/40 border-t-basari rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              'Finish Negotiation & Extract Terms'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
