#!/usr/bin/env ts-node
// VoiceArbiter — Senaryo Cüzdanı Üretici
// Freelancer keypair oluşturur ve sentetik aktivite ile yaşlandırır

import {
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
  PublicKey,
} from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ─── Yapılandırma ─────────────────────────────────────────────────────────────

const YAPILANDIRMA = {
  // Kaydedilecek keypair dosyası
  keypairDosyaYolu: './freelancer-keypair.json',
  // Kullanılacak Solana ağı
  rpcUrl: process.env.HELIUS_RPC_URL ?? clusterApiUrl('devnet'),
  // Simülasyon için yapılacak transfer sayısı ("Sentetik Yaş")
  simulasyonTransferSayisi: 30,
  // Her transfer için miktar (0.001 SOL)
  transferMiktar: 0.001,
  // Adım adım bekleme süresi (ms) — rate limiting'den kaçınmak için
  beklemeMs: 500,
};

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

/** Belirtilen süre kadar bekler */
function bekle(ms: number): Promise<void> {
  return new Promise((coz) => setTimeout(coz, ms));
}

/** Bağlantı durumunu loglar */
function bildir(mesaj: string, tur: 'bilgi' | 'basari' | 'uyari' | 'hata' = 'bilgi'): void {
  const renkler = {
    bilgi: '\x1b[36m',    // Camgöbeği
    basari: '\x1b[32m',   // Yeşil
    uyari: '\x1b[33m',    // Sarı
    hata: '\x1b[31m',     // Kırmızı
  };
  const sifirla = '\x1b[0m';
  console.log(`${renkler[tur]}[VoiceArbiter] ${mesaj}${sifirla}`);
}

/** Solana Devnet faucet'ten SOL ister (airdrop) */
async function airdropIste(
  baglanti: Connection,
  adres: PublicKey,
  miktarSol: number
): Promise<void> {
  bildir(`${adres.toBase58().substring(0, 8)}... adresine ${miktarSol} SOL airdrop isteniyor...`);
  try {
    const imza = await baglanti.requestAirdrop(
      adres,
      miktarSol * LAMPORTS_PER_SOL
    );
    await baglanti.confirmTransaction(imza, 'confirmed');
    bildir(`Airdrop onaylandı: ${imza.substring(0, 20)}...`, 'basari');
  } catch (hata) {
    bildir(
      `Airdrop başarısız (rate limit veya ağ sorunu): ${hata instanceof Error ? hata.message : 'Bilinmeyen hata'}`,
      'uyari'
    );
  }
}

/** SOL bakiyesini alır */
async function bakiyeAl(baglanti: Connection, adres: PublicKey): Promise<number> {
  const lamport = await baglanti.getBalance(adres);
  return lamport / LAMPORTS_PER_SOL;
}

/** İki adres arasında SOL transferi gerçekleştirir */
async function solTransferEt(
  baglanti: Connection,
  gonderen: Keypair,
  alici: PublicKey,
  miktarSol: number
): Promise<string> {
  const islem = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: gonderen.publicKey,
      toPubkey: alici,
      lamports: Math.floor(miktarSol * LAMPORTS_PER_SOL),
    })
  );

  const imza = await sendAndConfirmTransaction(baglanti, islem, [gonderen], {
    commitment: 'confirmed',
    skipPreflight: false,
  });

  return imza;
}

// ─── Ana fonksiyon ────────────────────────────────────────────────────────────

async function anaFonksiyon(): Promise<void> {
  console.log('\n' + '═'.repeat(60));
  console.log('  VoiceArbiter — Senaryo Cüzdanı Üretici');
  console.log('  Solana Devnet üzerinde çalışıyor');
  console.log('═'.repeat(60) + '\n');

  // 1. Bağlantı kur
  bildir(`RPC'ye bağlanıyor: ${YAPILANDIRMA.rpcUrl}`);
  const baglanti = new Connection(YAPILANDIRMA.rpcUrl, 'confirmed');

  // Bağlantıyı doğrula
  try {
    const slot = await baglanti.getSlot();
    bildir(`Bağlantı başarılı — mevcut slot: ${slot}`, 'basari');
  } catch {
    bildir('RPC bağlantısı kurulamadı! Ağ bağlantınızı kontrol edin.', 'hata');
    process.exit(1);
  }

  // 2. Mevcut keypair kontrolü
  const dosyaYolu = path.resolve(process.cwd(), YAPILANDIRMA.keypairDosyaYolu);
  let freelancerKeypair: Keypair;

  if (fs.existsSync(dosyaYolu)) {
    bildir(`Mevcut keypair dosyası bulundu: ${dosyaYolu}`, 'uyari');
    bildir('Mevcut keypair kullanılıyor (üzerine yazılmıyor)...');
    const mevcut = JSON.parse(fs.readFileSync(dosyaYolu, 'utf-8'));
    freelancerKeypair = Keypair.fromSecretKey(Uint8Array.from(mevcut));
  } else {
    // 3. Yeni keypair oluştur
    bildir('Yeni Freelancer keypair oluşturuluyor...');
    freelancerKeypair = Keypair.generate();

    // Dizi formatında kaydet
    const anahtarDizisi = Array.from(freelancerKeypair.secretKey);
    fs.writeFileSync(dosyaYolu, JSON.stringify(anahtarDizisi, null, 2), 'utf-8');
    bildir(`Keypair kaydedildi: ${dosyaYolu}`, 'basari');
    bildir('GÜVENLİK: Bu dosyayı asla repoya eklemeyin!', 'uyari');
  }

  console.log('\n' + '─'.repeat(60));
  bildir(`Freelancer Genel Anahtarı: ${freelancerKeypair.publicKey.toBase58()}`);

  // 4. Mevcut bakiye
  let freelancerBakiye = await bakiyeAl(baglanti, freelancerKeypair.publicKey);
  bildir(`Mevcut Bakiye: ${freelancerBakiye.toFixed(4)} SOL`);

  // 5. Freelancer için airdrop (eğer bakiye düşükse)
  if (freelancerBakiye < 0.5) {
    bildir('Düşük bakiye — Devnet airdrop isteniyor...');
    await airdropIste(baglanti, freelancerKeypair.publicKey, 2);
    await bekle(2000);
    freelancerBakiye = await bakiyeAl(baglanti, freelancerKeypair.publicKey);
    bildir(`Airdrop sonrası bakiye: ${freelancerBakiye.toFixed(4)} SOL`);
  }

  // 6. Fon kaynağı keypair kontrolü
  const fonKaynagiGizliAnahtari = process.env.FUNDER_SECRET_KEY;
  let fonKaynagiKeypair: Keypair | null = null;

  if (fonKaynagiGizliAnahtari) {
    try {
      const dizi = JSON.parse(fonKaynagiGizliAnahtari);
      fonKaynagiKeypair = Keypair.fromSecretKey(Uint8Array.from(dizi));
      bildir(`Fon kaynağı yüklendi: ${fonKaynagiKeypair.publicKey.toBase58().substring(0, 8)}...`);
    } catch {
      bildir('FUNDER_SECRET_KEY geçersiz format, atlanıyor...', 'uyari');
    }
  }

  // 7. Sentetik yaşlandırma — çift yönlü transfer simülasyonu
  console.log('\n' + '─'.repeat(60));
  bildir(`Sentetik yaşlandırma başlıyor (${YAPILANDIRMA.simulasyonTransferSayisi} transfer)...`);
  bildir('Bu işlem 1-2 dakika sürebilir...');

  // Geçici cüzdan oluştur (ping-pong transferleri için)
  const geciciKeypair = Keypair.generate();
  bildir(`Geçici cüzdan oluşturuldu: ${geciciKeypair.publicKey.toBase58().substring(0, 8)}...`);

  // Geçici cüzdan için airdrop
  await airdropIste(baglanti, geciciKeypair.publicKey, 1);
  await bekle(2000);

  let basariliTransferler = 0;
  const hedefTransfer = YAPILANDIRMA.simulasyonTransferSayisi;

  for (let i = 0; i < hedefTransfer; i++) {
    // Bakiyeyi kontrol et
    const freelancerBakiyeKontrol = await bakiyeAl(baglanti, freelancerKeypair.publicKey);
    const geciciBakiyeKontrol = await bakiyeAl(baglanti, geciciKeypair.publicKey);

    // Yeterli bakiye yoksa dur
    if (freelancerBakiyeKontrol < 0.01 && geciciBakiyeKontrol < 0.01) {
      bildir('Yetersiz bakiye — simülasyon erken sonlandırılıyor.', 'uyari');
      break;
    }

    try {
      if (i % 2 === 0) {
        // Çift: Freelancer → Geçici
        if (freelancerBakiyeKontrol >= YAPILANDIRMA.transferMiktar + 0.001) {
          const imza = await solTransferEt(
            baglanti,
            freelancerKeypair,
            geciciKeypair.publicKey,
            YAPILANDIRMA.transferMiktar
          );
          basariliTransferler++;
          if (basariliTransferler % 5 === 0) {
            bildir(`${basariliTransferler}/${hedefTransfer} transfer tamamlandı...`);
          }
        }
      } else {
        // Tek: Geçici → Freelancer
        if (geciciBakiyeKontrol >= YAPILANDIRMA.transferMiktar + 0.001) {
          const imza = await solTransferEt(
            baglanti,
            geciciKeypair,
            freelancerKeypair.publicKey,
            YAPILANDIRMA.transferMiktar
          );
          basariliTransferler++;
        }
      }
    } catch (hata) {
      bildir(
        `Transfer ${i + 1} başarısız: ${hata instanceof Error ? hata.message.substring(0, 60) : 'Bilinmeyen hata'}`,
        'uyari'
      );
    }

    await bekle(YAPILANDIRMA.beklemeMs);
  }

  // 8. Son bakiye
  const sonBakiye = await bakiyeAl(baglanti, freelancerKeypair.publicKey);

  // 9. Özet raporu
  console.log('\n' + '═'.repeat(60));
  console.log('  ÖZET RAPOR');
  console.log('═'.repeat(60));
  bildir(`Keypair Dosyası  : ${dosyaYolu}`, 'basari');
  bildir(`Genel Anahtar    : ${freelancerKeypair.publicKey.toBase58()}`, 'basari');
  bildir(`Son Bakiye       : ${sonBakiye.toFixed(4)} SOL`, 'basari');
  bildir(`Tamamlanan Trans : ${basariliTransferler}/${hedefTransfer}`, 'basari');
  bildir(`Ağ               : Devnet`, 'basari');
  console.log('─'.repeat(60));
  bildir('Sonraki Adımlar:', 'bilgi');
  console.log('  1. .env.local dosyasındaki API anahtarlarını girin');
  console.log('  2. npm run dev komutu ile geliştirme sunucusunu başlatın');
  console.log('  3. Tarayıcıda http://localhost:3000 adresini açın');
  console.log('═'.repeat(60) + '\n');
}

// ─── Çalıştır ─────────────────────────────────────────────────────────────────

anaFonksiyon().catch((hata) => {
  bildir(`Beklenmeyen hata: ${hata instanceof Error ? hata.message : hata}`, 'hata');
  process.exit(1);
});
