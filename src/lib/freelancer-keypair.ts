// VoiceArbiter — Freelancer Keypair Yükleyici
// SADECE SUNUCU TARAFI — Tarayıcıya asla gönderilmemelidir!

import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

// Sunucu tarafında çalıştığımızı doğrula
if (typeof window !== 'undefined') {
  throw new Error(
    '[GÜVENLİK HATASI] freelancer-keypair.ts yalnızca sunucu tarafında kullanılabilir!'
  );
}

/** Freelancer keypair yükleme hatası */
export class KeypairYuklemeHatasi extends Error {
  constructor(mesaj: string) {
    super(mesaj);
    this.name = 'KeypairYuklemeHatasi';
  }
}

/**
 * Freelancer keypair'ini disk'ten yükler.
 * Dosya yolu FREELANCER_KEYPAIR_PATH ortam değişkeninden veya
 * varsayılan ./freelancer-keypair.json yolundan alınır.
 *
 * @returns Yüklenmiş Solana Keypair nesnesi
 * @throws KeypairYuklemeHatasi — Dosya bulunamazsa veya geçersizse
 */
export function getFreelancerKeypair(): Keypair {
  // Dosya yolunu ortam değişkeninden veya varsayılandan al
  const dosyaYolu = process.env.FREELANCER_KEYPAIR_PATH ?? './freelancer-keypair.json';

  // Mutlak yola çevir
  const mutlakYol = path.isAbsolute(dosyaYolu)
    ? dosyaYolu
    : path.resolve(process.cwd(), dosyaYolu);

  // Dosyanın varlığını kontrol et
  if (!fs.existsSync(mutlakYol)) {
    throw new KeypairYuklemeHatasi(
      `Freelancer keypair dosyası bulunamadı: ${mutlakYol}\n` +
        `Lütfen 'npm run generate-wallets' komutunu çalıştırın.`
    );
  }

  // Dosyayı oku ve ayrıştır
  let icerik: string;
  try {
    icerik = fs.readFileSync(mutlakYol, 'utf-8');
  } catch (hata) {
    throw new KeypairYuklemeHatasi(
      `Freelancer keypair dosyası okunamadı: ${mutlakYol}\n` +
        `Hata: ${hata instanceof Error ? hata.message : 'Bilinmeyen hata'}`
    );
  }

  // JSON formatını ayrıştır
  let anahtarDizisi: number[];
  try {
    const veriler = JSON.parse(icerik);
    // Hem düz dizi hem de {secretKey: [...]} formatını destekle
    if (Array.isArray(veriler)) {
      anahtarDizisi = veriler;
    } else if (veriler.secretKey && Array.isArray(veriler.secretKey)) {
      anahtarDizisi = veriler.secretKey;
    } else {
      throw new Error('Geçersiz format: dizi veya {secretKey: [...]} bekleniyor');
    }
  } catch (hata) {
    throw new KeypairYuklemeHatasi(
      `Freelancer keypair JSON ayrıştırılamadı: ${hata instanceof Error ? hata.message : 'Bilinmeyen hata'}`
    );
  }

  // Keypair oluştur ve döndür
  try {
    const keypair = Keypair.fromSecretKey(Uint8Array.from(anahtarDizisi));
    console.log(
      `[VoiceArbiter] Freelancer keypair yüklendi: ${keypair.publicKey.toBase58().substring(0, 8)}...`
    );
    return keypair;
  } catch (hata) {
    throw new KeypairYuklemeHatasi(
      `Geçersiz keypair verisi: ${hata instanceof Error ? hata.message : 'Bilinmeyen hata'}`
    );
  }
}

/**
 * Freelancer'ın genel anahtarını döndürür (özel anahtar olmadan).
 * API rotalarında güvenli şekilde kullanılabilir.
 *
 * @returns Base58 kodlu genel anahtar stringi
 */
export function getFreelancerAcikAnahtari(): string {
  return getFreelancerKeypair().publicKey.toBase58();
}
