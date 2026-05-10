// VoiceArbiter — Hibrit İmzalama API Rotası
// POST /api/contract/sign
//
// Kılavuz "Signing Flow":
//   1. Frontend: Müşteri (Taraf A) işlemi Phantom ile kısmen imzalar → base64 gönderir
//   2. Bu rota: Freelancer (Taraf B) backend keypair'i ile ikinci imzayı atar
//   3. Tam imzalı işlem Solana ağına yayımlanır → txid döner

import { NextRequest, NextResponse } from 'next/server';
import {
  Transaction,
  VersionedTransaction,
  Connection,
  SendTransactionError,
} from '@solana/web3.js';
import { freelancerKeypairAl, FreelancerCuzdanHatasi } from '@/lib/freelancer-wallet';
import type { ImzalamaYaniti } from '@/types';

// ─── Yardımcı: RPC bağlantısı ────────────────────────────────────────────────

function baglantiAl(): Connection {
  const rpcUrl =
    process.env.HELIUS_RPC_URL ??
    process.env.NEXT_PUBLIC_SOLANA_RPC ??
    'https://api.devnet.solana.com';

  return new Connection(rpcUrl, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60_000,
  });
}

// ─── Yardımcı: İşlem türünü otomatik algıla ve deserialize et ────────────────

type AlgilamanSonucu =
  | { tur: 'legacy'; islem: Transaction }
  | { tur: 'versioned'; islem: VersionedTransaction };

/**
 * Base64 buffer'ını önce VersionedTransaction, sonra legacy Transaction
 * olarak deserialize etmeyi dener.
 * Solana'nın versioned tx'leri 0x80 prefix baytıyla başlar; legacy tx'ler
 * farklı bir compact-u16 ile başlar. İkisini de ele almak için try/catch
 * zinciri kullanılır.
 */
function islemAlgila(tampon: Buffer): AlgilamanSonucu {
  // Versioned transaction denemesi (v0 ve üzeri)
  try {
    const versioned = VersionedTransaction.deserialize(tampon);
    return { tur: 'versioned', islem: versioned };
  } catch {
    // Versioned değil — legacy dene
  }

  // Legacy transaction denemesi
  try {
    const legacy = Transaction.from(tampon);
    return { tur: 'legacy', islem: legacy };
  } catch (hata) {
    throw new Error(
      `İşlem deserialize edilemedi: ${
        hata instanceof Error ? hata.message : 'Bilinmeyen format'
      }`
    );
  }
}

// ─── Yardımcı: Türkçe RPC hata mesajı ───────────────────────────────────────

function turkceHataUret(hataMesaji: string): string {
  if (hataMesaji.includes('insufficient funds'))
    return 'Yetersiz bakiye — müşteri cüzdanında yeterli SOL yok.';
  if (hataMesaji.includes('blockhash not found') || hataMesaji.includes('Blockhash'))
    return 'İşlem süresi doldu (blockhash geçersiz). Lütfen tekrar deneyin.';
  if (hataMesaji.includes('already processed'))
    return 'Bu işlem zaten ağda işlendi.';
  if (hataMesaji.includes('Transaction simulation failed'))
    return `Simülasyon başarısız: ${hataMesaji}`;
  if (hataMesaji.includes('signature verification'))
    return 'İmza doğrulaması başarısız — işlem bütünlüğü bozulmuş olabilir.';
  return `İşlem yayımlanamadı: ${hataMesaji}`;
}

// ─── Ana Rota ─────────────────────────────────────────────────────────────────

/**
 * POST /api/contract/sign
 *
 * Beklenen gövde (JSON):
 *   { islemBase64: string }   ← tercih edilen alan adı
 *   { serializedTx: string }  ← geriye dönük uyumluluk için desteklenir
 *
 * Her iki alan da Base64 kodlu, kısmen imzalanmış Solana işlemi içermelidir.
 *
 * @returns ImzalamaYaniti — { imza, basarili } veya hata nesnesi
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Gövdeyi ayrıştır ───────────────────────────────────────────────────

  let govde: Record<string, unknown>;
  try {
    govde = await request.json();
  } catch {
    return NextResponse.json(
      { hata: 'Geçersiz JSON gövdesi. Content-Type: application/json olmalıdır.', basarili: false },
      { status: 400 }
    );
  }

  // islemBase64 (tercih) veya serializedTx (eski) alanını kabul et
  const seriHamVeri = govde.islemBase64 ?? govde.serializedTx;

  if (typeof seriHamVeri !== 'string' || !seriHamVeri.trim()) {
    return NextResponse.json(
      {
        hata: '"islemBase64" alanı zorunludur (Base64 kodlu kısmi imzalı işlem).',
        basarili: false,
      },
      { status: 400 }
    );
  }

  const seriBase64 = seriHamVeri.trim();

  // ── 2. Freelancer keypair'ini yükle ──────────────────────────────────────

  let freelancerKeypair;
  try {
    freelancerKeypair = freelancerKeypairAl();
  } catch (hata) {
    console.error('[contract/sign] Keypair yüklenemedi:', hata);

    if (hata instanceof FreelancerCuzdanHatasi) {
      return NextResponse.json(
        { hata: hata.message, basarili: false },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { hata: 'Sunucu keypair hatası.', basarili: false },
      { status: 500 }
    );
  }

  // ── 3. İşlemi deserialize et ve türünü algıla ─────────────────────────────

  let algilama: AlgilamanSonucu;
  try {
    const tampon = Buffer.from(seriBase64, 'base64');
    algilama = islemAlgila(tampon);
  } catch (hata) {
    return NextResponse.json(
      {
        hata: `İşlem okunamadı: ${hata instanceof Error ? hata.message : 'Bilinmeyen hata'}`,
        basarili: false,
      },
      { status: 400 }
    );
  }

  console.log(
    `[contract/sign] İşlem türü: ${algilama.tur} — freelancer: ${freelancerKeypair.publicKey.toBase58().slice(0, 8)}...`
  );

  // ── 4. Freelancer imzasını ekle ───────────────────────────────────────────

  let imzaliTampon: Buffer;

  try {
    if (algilama.tur === 'legacy') {
      // Legacy Transaction: partialSign imzanın eksik olmasına izin verir
      algilama.islem.partialSign(freelancerKeypair);
      imzaliTampon = algilama.islem.serialize({ requireAllSignatures: false });
    } else {
      // VersionedTransaction: sign() mevcut imzaları korur, yenisini ekler
      algilama.islem.sign([freelancerKeypair]);
      imzaliTampon = Buffer.from(algilama.islem.serialize());
    }
  } catch (hata) {
    console.error('[contract/sign] İmzalama hatası:', hata);
    return NextResponse.json(
      {
        hata: `Freelancer imzası eklenemedi: ${
          hata instanceof Error ? hata.message : 'Bilinmeyen hata'
        }`,
        basarili: false,
      },
      { status: 500 }
    );
  }

  // ── 5. İşlemi Solana ağına yayımla ───────────────────────────────────────

  try {
    const baglanti = baglantiAl();

    const txid = await baglanti.sendRawTransaction(imzaliTampon, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 3,
    });

    // Onay bekle
    const { blockhash, lastValidBlockHeight } =
      await baglanti.getLatestBlockhash('confirmed');

    await baglanti.confirmTransaction(
      { signature: txid, blockhash, lastValidBlockHeight },
      'confirmed'
    );

    console.log(`[contract/sign] İşlem onaylandı: ${txid}`);

    const yanit: ImzalamaYaniti = { imza: txid, basarili: true };
    return NextResponse.json(yanit);
  } catch (hata) {
    console.error('[contract/sign] Yayımlama hatası:', hata);

    // SendTransactionError'dan ayrıntılı log çek
    if (hata instanceof SendTransactionError) {
      const loglar = hata.logs ?? [];
      console.error('[contract/sign] Program logları:', loglar);
    }

    const hataMesaji = hata instanceof Error ? hata.message : 'Bilinmeyen hata';

    return NextResponse.json(
      { hata: turkceHataUret(hataMesaji), basarili: false },
      { status: 500 }
    );
  }
}
