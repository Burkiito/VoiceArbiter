// VoiceArbiter — Solana Bağlantı ve İşlem Yardımcıları

import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from '@solana/web3.js';

// ─── Bağlantı ────────────────────────────────────────────────────────────────

/** Solana ağ bağlantısını döndürür (Helius veya genel RPC) */
export function getConnection(): Connection {
  const rpcUrl =
    process.env.HELIUS_RPC_URL ??
    process.env.NEXT_PUBLIC_SOLANA_RPC ??
    clusterApiUrl('devnet');

  return new Connection(rpcUrl, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });
}

/** İstemci tarafı bağlantısı (tarayıcıdan güvenli RPC) */
export function getIstemciBaglantisi(): Connection {
  const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl('devnet');

  return new Connection(rpcUrl, 'confirmed');
}

// ─── Escrow PDA ───────────────────────────────────────────────────────────────

/**
 * Escrow PDA adresini türetir.
 * Gerçek uygulamada özel bir escrow programı kullanılmalıdır.
 *
 * @param musteriAcikAnahtari — Müşteri cüzdan adresi
 * @param freelancerAcikAnahtari — Freelancer cüzdan adresi
 * @param sozlesmeTohumu — Benzersiz sözleşme tohumu (timestamp tabanlı)
 * @returns [PDA adresi, bump seed]
 */
export async function escrowPdaTuret(
  musteriAcikAnahtari: PublicKey,
  freelancerAcikAnahtari: PublicKey,
  sozlesmeTohumu: Buffer
): Promise<[PublicKey, number]> {
  // SystemProgram.programId burada (çağrı anında) değerlendiriliyor; modül
  // import edildiği anda sunucuda çalışmaması için üst seviyede sabitlenmiyor.
  const escrowProgramId = SystemProgram.programId;

  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('escrow'),
      musteriAcikAnahtari.toBuffer(),
      freelancerAcikAnahtari.toBuffer(),
      sozlesmeTohumu,
    ],
    escrowProgramId
  );
}

// ─── Escrow işlemi ────────────────────────────────────────────────────────────

/**
 * Basit SOL transfer escrow işlemi oluşturur.
 * Not: Bu bir demo implementasyonudur. Gerçek escrow için özel program gerekir.
 *
 * @param musteriAcikAnahtari — Müşteri (gönderen) adresi
 * @param freelancerAcikAnahtari — Freelancer (alıcı) adresi
 * @param miktarSol — Transfer edilecek SOL miktarı
 * @param baglanti — Solana bağlantısı
 * @returns İmzalanmamış Transaction nesnesi
 */
export async function createEscrowTransaction(
  musteriAcikAnahtari: PublicKey,
  freelancerAcikAnahtari: PublicKey,
  miktarSol: number,
  baglanti?: Connection
): Promise<Transaction> {
  const conn = baglanti ?? getConnection();

  // Son blockhash'i al
  const { blockhash, lastValidBlockHeight } =
    await conn.getLatestBlockhash('confirmed');

  // İşlemi oluştur
  const islem = new Transaction({
    recentBlockhash: blockhash,
    lastValidBlockHeight,
    feePayer: musteriAcikAnahtari,
  });

  // Lamport miktarına çevir
  const miktarLamport = Math.floor(miktarSol * LAMPORTS_PER_SOL);

  // SOL transfer talimatı
  // Gerçek bir escrow programında bu talimat escrow PDA'ya gönderilir
  const transferTalimati = SystemProgram.transfer({
    fromPubkey: musteriAcikAnahtari,
    toPubkey: freelancerAcikAnahtari,
    lamports: miktarLamport,
  });

  islem.add(transferTalimati);

  return islem;
}

// ─── İşlem yayımlama ─────────────────────────────────────────────────────────

/**
 * İmzalı ve serileştirilmiş bir işlemi ağa yayımlar.
 *
 * @param serileştirilmisIslem — Base64 kodlu serileştirilmiş işlem
 * @param baglanti — Solana bağlantısı
 * @returns İşlem imzası (Base58)
 */
export async function broadcastTransaction(
  serileştirilmisIslem: string,
  baglanti?: Connection
): Promise<string> {
  const conn = baglanti ?? getConnection();

  // Base64'ten tampon dizisine dönüştür
  const islemTamponu = Buffer.from(serileştirilmisIslem, 'base64');

  // İşlemi ağa gönder
  const imza = await conn.sendRawTransaction(islemTamponu, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
    maxRetries: 3,
  });

  // Onay bekle
  const { blockhash, lastValidBlockHeight } =
    await conn.getLatestBlockhash('confirmed');

  await conn.confirmTransaction(
    {
      signature: imza,
      blockhash,
      lastValidBlockHeight,
    },
    'confirmed'
  );

  console.log(`[Solana] İşlem onaylandı: ${imza}`);
  return imza;
}

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

/**
 * SOL bakiyesini formatlar.
 * @param lamport — Lamport cinsinden bakiye
 * @returns Formatlı string (örn. "1.234 SOL")
 */
export function lamportdanSol(lamport: number): string {
  const sol = lamport / LAMPORTS_PER_SOL;
  return `${sol.toFixed(4)} SOL`;
}

/**
 * Kısaltılmış cüzdan adresi döndürür.
 * @param adres — Tam adres
 * @param basUzunluk — Baştaki karakter sayısı (varsayılan: 4)
 * @param sonUzunluk — Sondaki karakter sayısı (varsayılan: 4)
 */
export function adresKisalt(
  adres: string,
  basUzunluk = 4,
  sonUzunluk = 4
): string {
  if (adres.length <= basUzunluk + sonUzunluk) return adres;
  return `${adres.slice(0, basUzunluk)}...${adres.slice(-sonUzunluk)}`;
}

/**
 * Solana Explorer URL'si oluşturur.
 * @param imzaVeyaAdres — İşlem imzası veya hesap adresi
 * @param tur — 'tx' veya 'address'
 * @param ag — 'devnet' veya 'mainnet-beta'
 */
export function explorerUrl(
  imzaVeyaAdres: string,
  tur: 'tx' | 'address' = 'tx',
  ag = 'devnet'
): string {
  const kume = ag === 'devnet' ? '?cluster=devnet' : '';
  return `https://explorer.solana.com/${tur}/${imzaVeyaAdres}${kume}`;
}
