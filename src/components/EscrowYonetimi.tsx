'use client';

// VoiceArbiter — Escrow Yönetim Bileşeni
// Sözleşme onayı ve escrow fonlama arayüzü

import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey } from '@solana/web3.js';
import { muzakereDepoyuKullan } from '@/store/muzakere-store';
import { createEscrowTransaction, explorerUrl, adresKisalt } from '@/lib/solana';
import type { ImzalamaYaniti } from '@/types';

// ─── Aşama göstergesi ──────────────────────────────────────────────────────────

const SOZLESME_ASAMALARI = [
  { kod: 'IDLE', etiket: 'Start' },
  { kod: 'KAYIT', etiket: 'Setup' },
  { kod: 'MUZAKERE', etiket: 'Negotiate' },
  { kod: 'ONAY', etiket: 'Confirm' },
  { kod: 'ESCROW_FUNDED', etiket: 'Escrow' },
  { kod: 'TAMAMLANDI', etiket: 'Done' },
] as const;

function AsamaGostergesi({ aktifAsama }: { aktifAsama: string }) {
  const aktifIndeks = SOZLESME_ASAMALARI.findIndex((a) => a.kod === aktifAsama);

  return (
    <div className="flex items-center gap-1 mb-4">
      {SOZLESME_ASAMALARI.map((asama, indeks) => {
        const tamamlandi = indeks < aktifIndeks;
        const aktif = indeks === aktifIndeks;

        return (
          <React.Fragment key={asama.kod}>
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  tamamlandi
                    ? 'bg-basari text-white'
                    : aktif
                    ? 'bg-vurgu text-white ring-2 ring-vurgu/30'
                    : 'bg-zemin-acik border border-sinir text-yazi-soluk'
                }`}
              >
                {tamamlandi ? '✓' : indeks + 1}
              </div>
              <span
                className={`text-[10px] mt-1 ${
                  aktif ? 'text-vurgu-acik' : tamamlandi ? 'text-basari' : 'text-yazi-soluk'
                }`}
              >
                {asama.etiket}
              </span>
            </div>
            {/* Bağlantı çizgisi */}
            {indeks < SOZLESME_ASAMALARI.length - 1 && (
              <div
                className={`flex-1 h-0.5 mb-4 transition-all ${
                  indeks < aktifIndeks ? 'bg-basari' : 'bg-sinir'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────

/**
 * Escrow yönetim paneli.
 * Sözleşme şartlarını gösterir, müşteri imzasını alır ve escrow'u fonlar.
 */
export function EscrowYonetimi() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const sozlesmeSartlari = muzakereDepoyuKullan((d) => d.sozlesmeSartlari);
  const aktifAsama = muzakereDepoyuKullan((d) => d.aktifAsama);
  const freelancerKimlik = muzakereDepoyuKullan((d) => d.freelancerKimlik);
  const escrowImzasi = muzakereDepoyuKullan((d) => d.escrowImzasi);
  const escrowBilgileriniAyarla = muzakereDepoyuKullan((d) => d.escrowBilgileriniAyarla);
  const asamaGec = muzakereDepoyuKullan((d) => d.asamaGec);
  const bildirimEkle = muzakereDepoyuKullan((d) => d.bildirimEkle);

  const [fonlamaYukleniyor, setFonlamaYukleniyor] = useState(false);
  const [tamamlamaYukleniyor, setTamamlamaYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  // Escrow'u fonla — müşteri imzalar, sunucu freelancer imzası ekler
  const escrowFonla = async () => {
    if (!publicKey || !signTransaction || !sozlesmeSartlari || !freelancerKimlik) {
      bildirimEkle('hata', 'Missing Information', 'All information is required to fund escrow.');
      return;
    }

    if (!sozlesmeSartlari.miktar || sozlesmeSartlari.miktar <= 0) {
      bildirimEkle('hata', 'Invalid Amount', 'Contract amount is not specified or invalid.');
      return;
    }

    setFonlamaYukleniyor(true);
    setHata(null);

    try {
      // İşlemi oluştur
      const freelancerAnahtari = new PublicKey(freelancerKimlik);
      const islem = await createEscrowTransaction(
        publicKey,
        freelancerAnahtari,
        sozlesmeSartlari.miktar,
        connection
      );

      // Müşteri tarafında kısmi imzala
      const imzaliIslem = await signTransaction(islem);

      // Seri hale getir ve sunucuya gönder
      const serileştirilmisIslem = Buffer.from(
        imzaliIslem.serialize({ requireAllSignatures: false })
      ).toString('base64');

      // Sunucuya gönder — freelancer imzası eklenecek ve yayımlanacak
      const yanit = await fetch('/api/contract/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serializedTx: serileştirilmisIslem }),
      });

      if (!yanit.ok) {
        const hataVerisi = await yanit.json().catch(() => ({}));
        throw new Error(hataVerisi.hata ?? 'Signing server could not be reached');
      }

      const sonuc: ImzalamaYaniti = await yanit.json();

      if (!sonuc.basarili) {
        throw new Error(sonuc.hata ?? 'Signing failed');
      }

      // Escrow bilgilerini güncelle
      escrowBilgileriniAyarla(sonuc.imza, freelancerKimlik);

      bildirimEkle(
        'basari',
        'Escrow Funded!',
        `${sozlesmeSartlari.miktar} SOL successfully transferred to escrow.`
      );
    } catch (hata) {
      const hataMesaji = hata instanceof Error ? hata.message : 'Bilinmeyen hata';
      setHata(hataMesaji);
      bildirimEkle('hata', 'Escrow Hatası', hataMesaji);
      console.error('[EscrowYonetimi] Fonlama hatası:', hata);
    } finally {
      setFonlamaYukleniyor(false);
    }
  };

  // Sözleşmeyi tamamla — freelancer onaylar
  const sozlesmeyiTamamla = async () => {
    setTamamlamaYukleniyor(true);
    try {
      // Demo: Gerçek uygulamada freelancer onay işlemi burada yapılır
      await new Promise((r) => setTimeout(r, 1500));
      asamaGec('TAMAMLANDI');
      bildirimEkle(
        'basari',
        'Contract Completed!',
        'Escrow released and contract successfully completed.'
      );
    } finally {
      setTamamlamaYukleniyor(false);
    }
  };

  return (
    <div className="bg-zemin-kart border border-sinir rounded-xl p-4 shadow-panel">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-yazi-ikincil uppercase tracking-wider">
          Escrow Management
        </h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            aktifAsama === 'TAMAMLANDI'
              ? 'bg-basari/20 text-basari border border-basari/30'
              : aktifAsama === 'ESCROW_FUNDED'
              ? 'bg-ikincil/20 text-ikincil border border-ikincil/30'
              : 'bg-vurgu/20 text-vurgu-acik border border-vurgu/30'
          }`}
        >
          {aktifAsama}
        </span>
      </div>

      {/* Aşama göstergesi */}
      <AsamaGostergesi aktifAsama={aktifAsama} />

      {/* Sözleşme şartları özeti */}
      {sozlesmeSartlari ? (
        <div className="bg-zemin-acik rounded-lg border border-sinir p-3 mb-4 space-y-2">
          <h4 className="text-xs font-semibold text-yazi-ikincil uppercase tracking-wider mb-2">
            Contract Summary
          </h4>

          <div className="flex items-center justify-between">
            <span className="text-xs text-yazi-soluk">Amount</span>
            <span className="text-sm font-semibold text-yazi-birincil">
              {sozlesmeSartlari.miktar !== null
                ? `${sozlesmeSartlari.miktar} SOL`
                : '—'}
            </span>
          </div>

          {sozlesmeSartlari.sonTarih && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-yazi-soluk">Deadline</span>
              <span className="text-sm text-yazi-birincil">
                {new Date(sozlesmeSartlari.sonTarih).toLocaleDateString('en-US')}
              </span>
            </div>
          )}

          {sozlesmeSartlari.kapsam && (
            <div className="pt-1 border-t border-sinir">
              <span className="text-xs text-yazi-soluk block mb-1">Scope</span>
              <p className="text-sm text-yazi-birincil leading-relaxed">
                {sozlesmeSartlari.kapsam}
              </p>
            </div>
          )}

          {sozlesmeSartlari.odemeKosullari && (
            <div className="pt-1 border-t border-sinir">
              <span className="text-xs text-yazi-soluk block mb-1">Payment Terms</span>
              <p className="text-sm text-yazi-birincil">{sozlesmeSartlari.odemeKosullari}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-zemin-acik rounded-lg border border-sinir-acik p-4 mb-4 text-center">
          <p className="text-sm text-yazi-soluk">
            Contract terms have not been set yet.
            <br />
            They will appear here when negotiation is complete.
          </p>
        </div>
      )}

      {/* Escrow imzası göstergesi */}
      {escrowImzasi && (
        <div className="bg-basari/5 border border-basari/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-basari font-medium mb-1">Transaction Confirmed</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-yazi-ikincil truncate">
              {adresKisalt(escrowImzasi, 8, 8)}
            </span>
            <a
              href={explorerUrl(escrowImzasi, 'tx', 'devnet')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ikincil hover:text-ikincil-acik transition-colors flex-shrink-0"
            >
              View on Explorer
            </a>
          </div>
        </div>
      )}

      {/* Eylem butonları */}
      <div className="space-y-2">
        {/* Escrow fonla butonu */}
        {aktifAsama === 'ONAY' && (
          <button
            onClick={escrowFonla}
            disabled={
              fonlamaYukleniyor ||
              !publicKey ||
              !sozlesmeSartlari?.miktar ||
              !freelancerKimlik
            }
            className="w-full py-3 px-4 rounded-lg bg-gradient-vurgu text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-vurgu"
          >
            {fonlamaYukleniyor ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Funding Escrow...
              </span>
            ) : (
              `Fund Escrow — ${sozlesmeSartlari?.miktar ?? 0} SOL`
            )}
          </button>
        )}

        {/* Tamamla butonu (freelancer) */}
        {aktifAsama === 'ESCROW_FUNDED' && (
          <button
            onClick={sozlesmeyiTamamla}
            disabled={tamamlamaYukleniyor}
            className="w-full py-3 px-4 rounded-lg bg-gradient-basari text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {tamamlamaYukleniyor ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              'Release Escrow (Freelancer)'
            )}
          </button>
        )}

        {/* Tamamlandı durumu */}
        {aktifAsama === 'TAMAMLANDI' && (
          <div className="w-full py-3 px-4 rounded-lg bg-basari/10 border border-basari/30 text-center">
            <p className="text-basari font-semibold">Contract Completed!</p>
          </div>
        )}
      </div>

      {/* Hata mesajı */}
      {hata && (
        <div className="mt-3 bg-hata/10 border border-hata/30 rounded-lg p-3">
          <p className="text-xs text-hata">{hata}</p>
        </div>
      )}
    </div>
  );
}
