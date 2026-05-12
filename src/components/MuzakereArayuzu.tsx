'use client';

// VoiceArbiter — Ana Müzakere Arayüzü
// Tüm panelleri bir araya getiren ana düzen bileşeni

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { muzakereDepoyuKullan } from '@/store/muzakere-store';
import { WalletBaglantisi } from './WalletBaglantisi';
import { FreelancerKimlik } from './FreelancerKimlik';
import { GuvenRaporu } from './GuvenRaporu';
import { SesKayit } from './SesKayit';
import { YapayZekaMediator } from './YapayZekaMediator';
import { EscrowYonetimi } from './EscrowYonetimi';

// ─── Bildirim kutusu ──────────────────────────────────────────────────────────

function BildirimKutusu() {
  const bildirimler = muzakereDepoyuKullan((d) => d.bildirimler);
  const bildirimKaldir = muzakereDepoyuKullan((d) => d.bildirimKaldir);

  if (bildirimler.length === 0) return null;

  const bildirimRenkleri = {
    bilgi: 'border-bilgi/40 bg-bilgi/10 text-bilgi',
    basari: 'border-basari/40 bg-basari/10 text-basari',
    uyari: 'border-uyari/40 bg-uyari/10 text-uyari',
    hata: 'border-hata/40 bg-hata/10 text-hata',
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {bildirimler.map((bildirim) => (
        <div
          key={bildirim.kimlik}
          className={`border rounded-lg p-3 shadow-panel animate-kayma flex items-start gap-2 ${
            bildirimRenkleri[bildirim.tur]
          }`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{bildirim.baslik}</p>
            <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{bildirim.mesaj}</p>
          </div>
          <button
            onClick={() => bildirimKaldir(bildirim.kimlik)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity text-sm leading-none mt-0.5"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Hoşgeldiniz ekranı ───────────────────────────────────────────────────────

function HosgeldinizEkrani() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-gradient-vurgu flex items-center justify-center mb-6 shadow-vurgu animate-parlama">
        <span className="text-4xl">⚖️</span>
      </div>
      <h2 className="text-2xl font-bold text-yazi-birincil mb-2">
        Welcome to VoiceArbiter
      </h2>
      <p className="text-yazi-ikincil text-sm max-w-md leading-relaxed mb-6">
        Create smart contracts through voice negotiation.
        The AI mediator automatically determines terms,
        and the Solana escrow system ensures secure payment.
      </p>
      <div className="grid grid-cols-3 gap-4 text-center max-w-sm">
        <div className="bg-zemin-kart border border-sinir rounded-xl p-3">
          <p className="text-2xl mb-1">🎙️</p>
          <p className="text-xs text-yazi-ikincil">Voice Negotiation</p>
        </div>
        <div className="bg-zemin-kart border border-sinir rounded-xl p-3">
          <p className="text-2xl mb-1">🤖</p>
          <p className="text-xs text-yazi-ikincil">AI Mediator</p>
        </div>
        <div className="bg-zemin-kart border border-sinir rounded-xl p-3">
          <p className="text-2xl mb-1">🔐</p>
          <p className="text-xs text-yazi-ikincil">Escrow Security</p>
        </div>
      </div>
    </div>
  );
}

// ─── Ana arayüz ───────────────────────────────────────────────────────────────

/**
 * Ana müzakere arayüzü.
 * Cüzdan bağlantısına göre farklı düzenler gösterir.
 */
export function MuzakereArayuzu() {
  const { connected, publicKey } = useWallet();
  const aktifAsama = muzakereDepoyuKullan((d) => d.aktifAsama);
  const sifirla = muzakereDepoyuKullan((d) => d.sifirla);
  const musteriGuvenPuani = muzakereDepoyuKullan((d) => d.musteriGuvenPuani);

  const muzakereAktif =
    aktifAsama === 'MUZAKERE' || aktifAsama === 'ONAY' || aktifAsama === 'ESCROW_FUNDED';

  return (
    <div className="min-h-screen bg-zemin bg-gradient-zemin">
      {/* Bildirim kutusu */}
      <BildirimKutusu />

      {/* Üst çubuk */}
      <header className="border-b border-sinir bg-zemin-panel/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo ve başlık */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-vurgu flex items-center justify-center shadow-vurgu">
              <span className="text-lg">⚖️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-yazi-birincil leading-none">
                VoiceArbiter
              </h1>
              <p className="text-xs text-yazi-soluk">AI Voice Negotiation Platform</p>
            </div>
          </div>

          {/* Ağ ve sıfırlama */}
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 rounded bg-uyari/20 text-uyari border border-uyari/30">
              Devnet
            </span>
            {aktifAsama !== 'IDLE' && (
              <button
                onClick={sifirla}
                className="text-xs text-yazi-soluk hover:text-hata transition-colors"
                title="Reset session"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Ana içerik */}
      <main className="container mx-auto px-4 py-6">
        {/* Kimlik panelleri — her zaman göster */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Müşteri (Taraf A) */}
          <div className="space-y-4">
            <WalletBaglantisi />
            {/* Güven raporu — cüzdan bağlıysa göster */}
            {connected && publicKey && (
              <GuvenRaporu
                adres={publicKey.toBase58()}
                baslik="Client Trust Report"
              />
            )}
          </div>

          {/* Freelancer (Taraf B) */}
          <div>
            <FreelancerKimlik />
          </div>
        </div>

        {/* Müzakere alanı */}
        {!connected ? (
          <HosgeldinizEkrani />
        ) : (
          <div className="space-y-4">
            {/* Müzakereye başla butonu */}
            {aktifAsama === 'KAYIT' && (
              <div className="bg-zemin-kart border border-sinir rounded-xl p-6 text-center">
                <p className="text-yazi-ikincil mb-4">
                  Identities verified. Ready to start negotiation?
                </p>
                <button
                  onClick={() => {
                    const { asamaGec } = muzakereDepoyuKullan.getState();
                    asamaGec('MUZAKERE');
                  }}
                  className="py-3 px-8 rounded-lg bg-gradient-vurgu text-white font-semibold hover:opacity-90 transition-opacity shadow-vurgu"
                >
                  Start Negotiation
                </button>
              </div>
            )}

            {/* Müzakere panelleri */}
            {muzakereAktif && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Sol — Ses kayıt bölümü */}
                <div className="space-y-4">
                  <SesKayit
                    taraf="MUSTERI"
                    devreDisi={aktifAsama !== 'MUZAKERE'}
                  />
                  <SesKayit
                    taraf="FREELANCER"
                    devreDisi={aktifAsama !== 'MUZAKERE'}
                  />
                </div>

                {/* Orta — AI Mediator */}
                <div>
                  <YapayZekaMediator />
                </div>

                {/* Sağ — Escrow yönetimi */}
                <div>
                  <EscrowYonetimi />
                </div>
              </div>
            )}

            {/* Tamamlandı durumu */}
            {aktifAsama === 'TAMAMLANDI' && (
              <div className="bg-basari/5 border border-basari/30 rounded-xl p-8 text-center animate-kayma">
                <div className="w-16 h-16 rounded-full bg-basari/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-xl font-bold text-basari mb-2">
                  Contract Successfully Completed!
                </h3>
                <p className="text-yazi-ikincil text-sm">
                  Escrow released and payment processed.
                </p>
                <button
                  onClick={sifirla}
                  className="mt-6 py-2 px-6 rounded-lg border border-sinir-acik text-yazi-ikincil hover:border-vurgu hover:text-vurgu transition-colors text-sm"
                >
                  Start New Contract
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
