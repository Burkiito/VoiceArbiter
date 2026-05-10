'use client';

// VoiceArbiter — Ana Sayfa
// PartyPanel + SesliMuzakerePaneli + AI Karar Tetikleyici
//
// @solana/web3.js Next.js SSR aşamasında ESM uyumsuzluğu yaratır.
// Bu yüzden Solana bağımlı bileşenler { ssr: false } ile yüklenir;
// yalnızca tarayıcıda render edilirler.

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { muzakereDepoyuKullan } from '@/store/negotiation-store';
import type { SozlesmeSartlari } from '@/store/negotiation-store';


// Tarayıcıya özgü yükleme — SSR devre dışı
const PartyPanel = dynamic(
  () => import('@/components/PartyPanel').then((m) => m.PartyPanel),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zemin-kart border border-sinir rounded-xl h-48 animate-pulse" />
        <div className="bg-zemin-kart border border-sinir rounded-xl h-48 animate-pulse" />
      </div>
    ),
  }
);

const SesliMuzakerePaneli = dynamic(
  () => import('@/components/SesliMuzakerePaneli').then((m) => m.SesliMuzakerePaneli),
  {
    ssr: false,
    loading: () => (
      <div className="bg-zemin-kart border border-sinir rounded-xl h-64 animate-pulse" />
    ),
  }
);


// ─── Yardımcı Bileşenler ──────────────────────────────────────────────────────

/** Yapışkan üst çubuk */
function UstCubuk() {
  const aktifAsama = muzakereDepoyuKullan((d) => d.aktifAsama);
  const sifirla = muzakereDepoyuKullan((d) => d.sifirla);

  const fazEtiketleri: Record<string, string> = {
    IDLE: 'Idle',
    NEGOTIATING: 'Negotiating',
    CONFIRMING: 'Confirming',
    ESCROW_FUNDED: 'Escrow',
    COMPLETED: 'Completed',
  };

  const fazRengi: Record<string, string> = {
    IDLE: 'bg-yazi-soluk/20 text-yazi-soluk border-yazi-soluk/20',
    NEGOTIATING: 'bg-ikincil/20 text-ikincil border-ikincil/30',
    CONFIRMING: 'bg-vurgu/20 text-vurgu-acik border-vurgu/30',
    ESCROW_FUNDED: 'bg-uyari/20 text-uyari border-uyari/30',
    COMPLETED: 'bg-basari/20 text-basari border-basari/30',
  };

  return (
    <header className="border-b border-sinir bg-zemin-panel/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vurgu to-vurgu-acik flex items-center justify-center shadow-vurgu flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-yazi-birincil leading-none">VoiceArbiter</h1>
            <p className="text-xs text-yazi-soluk">Sesli AI Tahkim Platformu</p>
          </div>
        </div>

        {/* Sağ kısım — faz + ağ + sıfırla */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex text-xs px-2 py-1 rounded border bg-uyari/10 text-uyari border-uyari/30">
            Devnet
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${fazRengi[aktifAsama] ?? 'bg-yazi-soluk/20 text-yazi-soluk border-yazi-soluk/20'}`}>
            {fazEtiketleri[aktifAsama] ?? aktifAsama}
          </span>
          {aktifAsama !== 'IDLE' && (
            <button
              onClick={sifirla}
              className="text-xs text-yazi-soluk hover:text-hata transition-colors px-2 py-1 rounded border border-transparent hover:border-hata/30"
              title="Reset session"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/** Faz ilerleme adımları */
function FazGostergesi() {
  const aktifAsama = muzakereDepoyuKullan((d) => d.aktifAsama);

  const adimlar = [
    { faz: 'IDLE',          etiket: 'Setup'      },
    { faz: 'NEGOTIATING',   etiket: 'Negotiate'  },
    { faz: 'CONFIRMING',    etiket: 'Confirm'    },
    { faz: 'ESCROW_FUNDED', etiket: 'Escrow'     },
    { faz: 'COMPLETED',     etiket: 'Done'       },
  ] as const;

  const aktifIndeks = adimlar.findIndex((a) => a.faz === aktifAsama);

  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {adimlar.map((adim, i) => {
        const tamamlandi = i < aktifIndeks;
        const aktif = i === aktifIndeks;

        return (
          <React.Fragment key={adim.faz}>
            {/* Adım noktası */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  tamamlandi
                    ? 'bg-basari border-basari text-white'
                    : aktif
                    ? 'bg-vurgu border-vurgu text-white shadow-vurgu scale-110'
                    : 'bg-zemin-kart border-sinir text-yazi-soluk'
                }`}
              >
                {tamamlandi ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs hidden sm:block ${aktif ? 'text-yazi-birincil font-medium' : 'text-yazi-soluk'}`}>
                {adim.etiket}
              </span>
            </div>
            {/* Bağlantı çizgisi */}
            {i < adimlar.length - 1 && (
              <div
                className={`h-0.5 w-8 sm:w-12 mx-1 mb-4 rounded-full transition-all ${
                  i < aktifIndeks ? 'bg-basari' : 'bg-sinir'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/** Çıkarılan sözleşme şartları kartı — CONFIRMING fazında gösterilir */
function SozlesmeOnizlemesi({ sartlar }: { sartlar: SozlesmeSartlari }) {
  const asamayiGuncelle = muzakereDepoyuKullan((d) => d.asamayiGuncelle);
  const cuzdanAdresi = muzakereDepoyuKullan((d) => d.tarafA.cuzdanAdresi);
  const [onaylaniyor, setOnaylaniyor] = useState(false);
  const [transferHata, setTransferHata] = useState<string | null>(null);
  const [transferImzasi, setTransferImzasi] = useState<string | null>(null);

  const escrowuBaslat = async () => {
    setTransferHata(null);

    if (!cuzdanAdresi) {
      setTransferHata('Client wallet not connected. Please connect Phantom first.');
      return;
    }
    if (!sartlar.miktar || sartlar.miktar <= 0) {
      setTransferHata('Payment amount is not set. Cannot proceed.');
      return;
    }
    const freelancerPubkeyStr = process.env.NEXT_PUBLIC_FREELANCER_PUBKEY;
    if (!freelancerPubkeyStr) {
      setTransferHata('Freelancer public key not configured (NEXT_PUBLIC_FREELANCER_PUBKEY).');
      return;
    }

    setOnaylaniyor(true);
    try {
      const { Connection, SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } =
        await import('@solana/web3.js');

      const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';
      const connection = new Connection(rpcUrl, 'confirmed');

      const fromPubkey = new PublicKey(cuzdanAdresi);
      const toPubkey = new PublicKey(freelancerPubkeyStr);
      const lamports = Math.round(sartlar.miktar * LAMPORTS_PER_SOL);

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: fromPubkey,
      }).add(
        SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
      );

      const solana = (window as unknown as { solana: { signAndSendTransaction: (tx: unknown) => Promise<{ signature: string }> } }).solana;
      const { signature } = await solana.signAndSendTransaction(transaction);
      setTransferImzasi(signature);

      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

      asamayiGuncelle('COMPLETED');
    } catch (err) {
      const mesaj = err instanceof Error ? err.message : String(err);
      if (mesaj.toLowerCase().includes('rejected') || mesaj.toLowerCase().includes('cancel') || mesaj.toLowerCase().includes('user denied')) {
        setTransferHata('Transaction rejected by user.');
      } else if (mesaj.toLowerCase().includes('insufficient')) {
        setTransferHata('Insufficient SOL balance. Please fund your Devnet wallet.');
      } else {
        setTransferHata(`Transfer failed: ${mesaj}`);
      }
    } finally {
      setOnaylaniyor(false);
    }
  };

  return (
    <div className="bg-zemin-kart border border-vurgu/30 rounded-2xl p-5 shadow-panel animate-kayma space-y-4">
      {/* Başlık */}
      <div className="flex items-center gap-2 pb-3 border-b border-sinir">
        <div className="w-8 h-8 rounded-lg bg-vurgu/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-vurgu-acik" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-yazi-birincil">AI Extracted Contract Terms</h3>
          <p className="text-xs text-yazi-soluk">Confidence: {Math.round(sartlar.guvenSeviyesi * 100)}%</p>
        </div>
      </div>

      {/* Şart satırları */}
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-4">
          <span className="text-xs text-yazi-soluk w-24 flex-shrink-0">Amount</span>
          <span className="text-sm font-semibold text-yazi-birincil text-right">
            {sartlar.miktar !== null ? `${sartlar.miktar} SOL` : '—'}
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-xs text-yazi-soluk w-24 flex-shrink-0">Deadline</span>
          <span className="text-sm font-medium text-yazi-birincil text-right">
            {sartlar.sonTarih
              ? new Date(sartlar.sonTarih).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—'}
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-xs text-yazi-soluk w-24 flex-shrink-0 mt-0.5">Scope</span>
          <span className="text-sm text-yazi-ikincil text-right leading-relaxed flex-1">
            {sartlar.kapsam ?? '—'}
          </span>
        </div>
      </div>

      {/* Transfer hata mesajı */}
      {transferHata && (
        <div className="bg-hata/10 border border-hata/30 rounded-lg px-3 py-2">
          <p className="text-xs text-hata">{transferHata}</p>
        </div>
      )}

      {/* İşlem imzası bağlantısı */}
      {transferImzasi && (
        <div className="bg-basari/10 border border-basari/30 rounded-lg px-3 py-2">
          <p className="text-xs text-basari font-mono truncate">
            Tx: {transferImzasi.slice(0, 20)}...{transferImzasi.slice(-8)}
          </p>
        </div>
      )}

      {/* Escrow başlatma butonu */}
      <button
        onClick={escrowuBaslat}
        disabled={onaylaniyor}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-basari to-basari/80 text-white font-semibold text-sm shadow-basari hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
      >
        {onaylaniyor ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {transferImzasi ? 'Confirming on-chain...' : 'Waiting for Phantom...'}
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Confirm Terms &amp; Send {sartlar.miktar ?? '?'} SOL
          </>
        )}
      </button>
    </div>
  );
}

/** Escrow aktif — tamamlama butonu ile */
function EscrowAktifEkrani() {
  const asamayiGuncelle = muzakereDepoyuKullan((d) => d.asamayiGuncelle);
  const sozlesmeSartlari = muzakereDepoyuKullan((d) => d.sozlesmeSartlari);
  const [tamamlaniyor, setTamamlaniyor] = useState(false);

  const sozlesmeiBitir = async () => {
    setTamamlaniyor(true);
    await new Promise<void>((r) => setTimeout(r, 1500));
    asamayiGuncelle('COMPLETED');
    setTamamlaniyor(false);
  };

  return (
    <div className="bg-uyari/5 border border-uyari/30 rounded-2xl p-5 shadow-panel animate-kayma space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-uyari/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-uyari" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-uyari">Escrow Active</h3>
          <p className="text-xs text-yazi-ikincil">
            {sozlesmeSartlari?.miktar ? `${sozlesmeSartlari.miktar} SOL locked in escrow` : 'SOL locked in Solana escrow account'}
          </p>
        </div>
      </div>
      <button
        onClick={sozlesmeiBitir}
        disabled={tamamlaniyor}
        className="w-full py-2.5 rounded-xl bg-basari/20 border border-basari/40 text-basari font-semibold text-sm hover:bg-basari/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {tamamlaniyor ? (
          <>
            <span className="w-4 h-4 border-2 border-basari/30 border-t-basari rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          'Delivered — Release Payment'
        )}
      </button>
    </div>
  );
}

/** Sözleşme tamamlandı ekranı */
function TamamlandiEkrani() {
  const sifirla = muzakereDepoyuKullan((d) => d.sifirla);

  return (
    <div className="bg-basari/5 border border-basari/30 rounded-2xl p-8 text-center animate-kayma shadow-panel">
      <div className="w-16 h-16 rounded-full bg-basari/20 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-basari" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-basari mb-2">Contract Completed!</h3>
      <p className="text-yazi-ikincil text-sm mb-6">
        Escrow released. Payment successfully transferred.
      </p>
      <button
        onClick={sifirla}
        className="py-2.5 px-6 rounded-xl border border-sinir-acik text-yazi-ikincil hover:border-vurgu hover:text-vurgu transition-colors text-sm"
      >
        Start New Contract
      </button>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function AnaSayfa() {
  const aktifAsama = muzakereDepoyuKullan((d) => d.aktifAsama);
  const transkriptler = muzakereDepoyuKullan((d) => d.transkriptler);
  const sozlesmeSartlari = muzakereDepoyuKullan((d) => d.sozlesmeSartlari);
  const asamayiGuncelle = muzakereDepoyuKullan((d) => d.asamayiGuncelle);
  const sartlariGuncelle = muzakereDepoyuKullan((d) => d.sartlariGuncelle);

  const [aiAnalizYukleniyor, setAiAnalizYukleniyor] = useState(false);
  const [aiHata, setAiHata] = useState<string | null>(null);

  const aiSartlariCikar = async () => {
    if (aiAnalizYukleniyor || transkriptler.length === 0) return;
    setAiAnalizYukleniyor(true);
    setAiHata(null);
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
      setAiHata(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAiAnalizYukleniyor(false);
    }
  };

  // AI butonu görünüm koşulu: NEGOTIATING + en az 1 transkript
  const aiButonuGorunur =
    aktifAsama === 'NEGOTIATING' && transkriptler.length >= 1;

  return (
    <div className="min-h-screen bg-zemin">
      {/* Yapışkan üst çubuk */}
      <UstCubuk />

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {/* Faz ilerleme göstergesi */}
        <FazGostergesi />

        {/* ── Taraf Panelleri (her zaman görünür) ──────────────────────────── */}
        <PartyPanel />

        {/* ── Sesli Müzakere Paneli ─────────────────────────────────────── */}
        <SesliMuzakerePaneli />

        {/* ── AI Karar Tetikleyici Butonu ───────────────────────────────── */}
        {aiButonuGorunur && (
          <div className="animate-kayma">
            <button
              onClick={aiSartlariCikar}
              disabled={aiAnalizYukleniyor}
              className="
                relative w-full py-4 rounded-2xl overflow-hidden
                bg-gradient-to-r from-vurgu via-purple-600 to-ikincil
                text-white font-semibold text-sm
                shadow-[0_0_32px_rgba(99,102,241,0.35)]
                hover:shadow-[0_0_48px_rgba(99,102,241,0.5)]
                hover:scale-[1.01]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
                transition-all duration-300
                flex items-center justify-center gap-3
              "
            >
              {/* Parlayan arka plan animasyonu */}
              {!aiAnalizYukleniyor && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-parlama pointer-events-none" />
              )}

              {aiAnalizYukleniyor ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AI Analyzing Negotiation...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  <span>Finish Negotiation &amp; Extract Terms with AI</span>
                  <span className="ml-auto text-xs text-white/60 font-normal">
                    {transkriptler.length} messages
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {aiHata && (
          <div className="bg-hata/10 border border-hata/30 rounded-xl px-4 py-3">
            <p className="text-xs text-hata">{aiHata}</p>
          </div>
        )}

        {/* ── CONFIRMING — Contract preview ─────────────────────────────── */}
        {aktifAsama === 'CONFIRMING' && sozlesmeSartlari && (
          <SozlesmeOnizlemesi sartlar={sozlesmeSartlari} />
        )}

        {/* ── ESCROW_FUNDED — Teslim ve ödeme bırakma ──────────────────── */}
        {aktifAsama === 'ESCROW_FUNDED' && <EscrowAktifEkrani />}

        {/* ── COMPLETED — Başarı ekranı ─────────────────────────────────── */}
        {aktifAsama === 'COMPLETED' && <TamamlandiEkrani />}
      </main>
    </div>
  );
}
