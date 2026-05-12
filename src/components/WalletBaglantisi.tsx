'use client';

// VoiceArbiter — Müşteri Cüzdan Bağlantısı Bileşeni
// Phantom cüzdanı bağlama/kopma UI'ı

import React, { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { muzakereDepoyuKullan } from '@/store/muzakere-store';
import { adresKisalt } from '@/lib/solana';

/**
 * Müşteri cüzdan bağlantısı ve bilgileri paneli.
 * Phantom cüzdanı bağlanma/kopma durumunu yönetir.
 */
export function WalletBaglantisi() {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();

  const musteriCuzdaniniAyarla = muzakereDepoyuKullan(
    (d) => d.musteriCuzdaniniAyarla
  );
  const bildirimEkle = muzakereDepoyuKullan((d) => d.bildirimEkle);
  const aktifAsama = muzakereDepoyuKullan((d) => d.aktifAsama);

  const [solBakiye, setSolBakiye] = useState<number | null>(null);
  const [bakiyeYukleniyor, setBakiyeYukleniyor] = useState(false);

  // Cüzdan bağlandığında/koptuğunda store'u güncelle
  useEffect(() => {
    if (connected && publicKey) {
      musteriCuzdaniniAyarla(publicKey.toBase58());
      bildirimEkle(
        'basari',
        'Wallet Connected',
        `${adresKisalt(publicKey.toBase58())} address successfully connected.`
      );
      // Bakiyeyi yükle
      bakiyeYukle(publicKey.toBase58());
    } else if (!connected) {
      musteriCuzdaniniAyarla(null);
      setSolBakiye(null);
    }
  }, [connected, publicKey]);

  // SOL bakiyesini yükle
  const bakiyeYukle = async (adres: string) => {
    setBakiyeYukleniyor(true);
    try {
      const { PublicKey } = await import('@solana/web3.js');
      const bakiyeLamport = await connection.getBalance(new PublicKey(adres));
      setSolBakiye(bakiyeLamport / LAMPORTS_PER_SOL);
    } catch (hata) {
      console.error('[WalletBaglantisi] Bakiye yüklenemedi:', hata);
    } finally {
      setBakiyeYukleniyor(false);
    }
  };

  // Bağlantı kes
  const baglantiyiKes = async () => {
    try {
      await disconnect();
      bildirimEkle('bilgi', 'Wallet Disconnected', 'Phantom wallet disconnected.');
    } catch (hata) {
      console.error('[WalletBaglantisi] Bağlantı kesilirken hata:', hata);
    }
  };

  // Aşama badge rengi
  const asamaRengi = {
    IDLE: 'bg-yazi-soluk',
    KAYIT: 'bg-uyari',
    MUZAKERE: 'bg-ikincil',
    ONAY: 'bg-vurgu',
    ESCROW_FUNDED: 'bg-basari',
    TAMAMLANDI: 'bg-basari',
  }[aktifAsama] ?? 'bg-yazi-soluk';

  return (
    <div className="bg-zemin-kart border border-sinir rounded-xl p-4 shadow-panel">
      {/* Panel başlığı */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-vurgu animate-nabiz" />
          <h3 className="text-sm font-semibold text-yazi-ikincil uppercase tracking-wider">
            Client — Party A
          </h3>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${asamaRengi}`}>
          {aktifAsama}
        </span>
      </div>

      {/* Bağlı durum */}
      {connected && publicKey ? (
        <div className="space-y-3">
          {/* Adres */}
          <div className="bg-zemin-acik rounded-lg p-3 border border-sinir">
            <p className="text-xs text-yazi-soluk mb-1">Wallet Address</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-mono text-yazi-birincil truncate">
                {adresKisalt(publicKey.toBase58(), 8, 8)}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publicKey.toBase58());
                  bildirimEkle('bilgi', 'Copied', 'Address copied to clipboard.');
                }}
                className="flex-shrink-0 text-xs text-vurgu-acik hover:text-vurgu transition-colors"
                title="Copy full address"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Bakiye */}
          <div className="bg-zemin-acik rounded-lg p-3 border border-sinir">
            <p className="text-xs text-yazi-soluk mb-1">SOL Balance</p>
            {bakiyeYukleniyor ? (
              <div className="h-5 bg-sinir rounded animate-pulse" />
            ) : (
              <p className="text-base font-semibold text-yazi-birincil">
                {solBakiye !== null ? `${solBakiye.toFixed(4)} SOL` : '— SOL'}
              </p>
            )}
          </div>

          {/* Bağlantı kes butonu */}
          <button
            onClick={baglantiyiKes}
            className="w-full py-2 px-4 rounded-lg border border-sinir-acik text-yazi-ikincil hover:border-hata hover:text-hata transition-colors text-sm"
          >
            Disconnect
          </button>
        </div>
      ) : (
        /* Bağlı değil durumu */
        <div className="space-y-3">
          <p className="text-sm text-yazi-ikincil">
            Connect your Phantom wallet to start negotiating.
          </p>
          <button
            onClick={() => setVisible(true)}
            disabled={connecting}
            className="w-full py-3 px-4 rounded-lg bg-gradient-vurgu text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-vurgu"
          >
            {connecting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              'Connect Phantom'
            )}
          </button>
          <p className="text-xs text-yazi-soluk text-center">
            Devnet only — no real funds used
          </p>
        </div>
      )}
    </div>
  );
}
