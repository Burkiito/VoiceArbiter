// VoiceArbiter — Freelancer (Taraf B) Kalıcı Backend Cüzdanı
// ⚠️  SADECE SUNUCU TARAFI — Bu modül istemci bundle'ına asla dahil edilmemeli!
//
// Yükleme önceliği:
//   1. FREELANCER_SECRET_KEY ortam değişkeni  (JSON dizi veya base58 formatı)
//   2. Proje kök dizinindeki freelancer-keypair.json dosyası
//   3. İkisi de yoksa → açıklayıcı hata

import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import bs58 from 'bs58';

// ─── Güvenlik Denetimi ───────────────────────────────────────────────────────

// Bu modülün yanlışlıkla tarayıcıda çalışmasını engelle
if (typeof window !== 'undefined') {
  throw new Error(
    '[GÜVENLİK HATASI] freelancer-wallet.ts yalnızca sunucu ortamında çalışabilir. ' +
      'İstemci bileşenlerinde kullanmayın!'
  );
}

// ─── Hata Sınıfı ─────────────────────────────────────────────────────────────

export class FreelancerCuzdanHatasi extends Error {
  constructor(mesaj: string) {
    super(mesaj);
    this.name = 'FreelancerCuzdanHatasi';
  }
}

// ─── Tekil Örnek Önbelleği ────────────────────────────────────────────────────

// Keypair her istek için diskten/env'den yeniden okunmaz; bir kez yüklenip saklanır.
// Aynı cüzdanın kalıcılığı bu şekilde garanti edilir.
let onbellekenmisCuzdanKeypair: Keypair | null = null;

// ─── Yardımcı: Ham Bayt Dizisinden Keypair Oluştur ───────────────────────────

function baytDizisindanKeypairOlustur(baytlar: number[]): Keypair {
  if (baytlar.length !== 64) {
    throw new FreelancerCuzdanHatasi(
      `Geçersiz anahtar uzunluğu: ${baytlar.length} bayt alındı, 64 bayt bekleniyor.`
    );
  }
  return Keypair.fromSecretKey(Uint8Array.from(baytlar));
}

// ─── Kaynak 1: Ortam Değişkeni ────────────────────────────────────────────────

/**
 * FREELANCER_SECRET_KEY ortam değişkenini okur.
 * Desteklenen formatlar:
 *   - JSON dizi:  [1, 2, 3, ..., 64]
 *   - Base58 string:  "5J7X..."
 * Değişken tanımlı değilse null döner.
 */
function envdenKeypairOku(): Keypair | null {
  const envDegeri = process.env.FREELANCER_SECRET_KEY;
  if (!envDegeri) return null;

  const temizDeger = envDegeri.trim();

  // JSON dizi formatı: [1,2,...,64]
  if (temizDeger.startsWith('[')) {
    try {
      const baytlar = JSON.parse(temizDeger) as number[];
      const keypair = baytDizisindanKeypairOlustur(baytlar);
      console.log(
        `[VoiceArbiter] Freelancer keypair ENV'den yüklendi: ${keypair.publicKey.toBase58().slice(0, 8)}...`
      );
      return keypair;
    } catch (hata) {
      throw new FreelancerCuzdanHatasi(
        `FREELANCER_SECRET_KEY JSON dizi olarak ayrıştırılamadı: ${
          hata instanceof Error ? hata.message : 'Bilinmeyen hata'
        }`
      );
    }
  }

  // Base58 formatı
  try {
    const baytlar = Array.from(bs58.decode(temizDeger));
    const keypair = baytDizisindanKeypairOlustur(baytlar);
    console.log(
      `[VoiceArbiter] Freelancer keypair ENV (base58)'den yüklendi: ${keypair.publicKey.toBase58().slice(0, 8)}...`
    );
    return keypair;
  } catch (hata) {
    throw new FreelancerCuzdanHatasi(
      `FREELANCER_SECRET_KEY base58 olarak çözümlenemedi: ${
        hata instanceof Error ? hata.message : 'Bilinmeyen hata'
      }\n` +
        `Beklenen format: JSON dizi [1,2,...,64] veya base58 string.`
    );
  }
}

// ─── Kaynak 2: Yerel JSON Dosyası ─────────────────────────────────────────────

/**
 * Proje kök dizinindeki freelancer-keypair.json dosyasını okur.
 * Desteklenen formatlar:
 *   - Düz dizi:           [1, 2, 3, ..., 64]
 *   - Nesne formatı:      { "secretKey": [1, 2, ...] }
 * Dosya mevcut değilse null döner; dosya bozuksa hata fırlatır.
 */
function dosyadanKeypairOku(): Keypair | null {
  const dosyaYolu = path.resolve(process.cwd(), 'freelancer-keypair.json');

  if (!fs.existsSync(dosyaYolu)) return null;

  let icerik: string;
  try {
    icerik = fs.readFileSync(dosyaYolu, 'utf-8');
  } catch (hata) {
    throw new FreelancerCuzdanHatasi(
      `freelancer-keypair.json okunamadı (${dosyaYolu}): ${
        hata instanceof Error ? hata.message : 'Bilinmeyen hata'
      }`
    );
  }

  let veri: unknown;
  try {
    veri = JSON.parse(icerik);
  } catch {
    throw new FreelancerCuzdanHatasi(
      `freelancer-keypair.json geçerli JSON değil. Dosyayı kontrol edin: ${dosyaYolu}`
    );
  }

  let baytlar: number[];

  if (Array.isArray(veri)) {
    // Düz dizi formatı — Solana CLI çıktısı
    baytlar = veri as number[];
  } else if (
    veri !== null &&
    typeof veri === 'object' &&
    'secretKey' in veri &&
    Array.isArray((veri as Record<string, unknown>).secretKey)
  ) {
    // Nesne formatı — { secretKey: [...] }
    baytlar = (veri as { secretKey: number[] }).secretKey;
  } else {
    throw new FreelancerCuzdanHatasi(
      `freelancer-keypair.json tanınmayan format. ` +
        `Beklenen: [1,2,...,64] veya { "secretKey": [1,2,...,64] }`
    );
  }

  const keypair = baytDizisindanKeypairOlustur(baytlar);
  console.log(
    `[VoiceArbiter] Freelancer keypair dosyadan yüklendi (${dosyaYolu}): ${keypair.publicKey.toBase58().slice(0, 8)}...`
  );
  return keypair;
}

// ─── Ana Yükleyici ────────────────────────────────────────────────────────────

/**
 * Freelancer (Taraf B) keypair'ini döner.
 * Önbellek doluysa disk/env'e gidilmez — aynı cüzdan örneği her zaman geri gelir.
 *
 * @throws FreelancerCuzdanHatasi — Her iki kaynak da kullanılamazsa
 */
export function freelancerKeypairAl(): Keypair {
  // Önbellekte varsa direkt döndür
  if (onbellekenmisCuzdanKeypair) return onbellekenmisCuzdanKeypair;

  // 1. Önce ortam değişkenini dene
  const envKeypair = envdenKeypairOku();
  if (envKeypair) {
    onbellekenmisCuzdanKeypair = envKeypair;
    return onbellekenmisCuzdanKeypair;
  }

  // 2. Sonra yerel JSON dosyasını dene
  const dosyaKeypair = dosyadanKeypairOku();
  if (dosyaKeypair) {
    onbellekenmisCuzdanKeypair = dosyaKeypair;
    return onbellekenmisCuzdanKeypair;
  }

  // 3. Her iki kaynak da yoksa açıklayıcı hata fırlat
  throw new FreelancerCuzdanHatasi(
    '[VoiceArbiter] Freelancer keypair yüklenemedi!\n\n' +
      'Aşağıdakilerden birini yapın:\n' +
      '  A) .env.local dosyasına ekleyin:\n' +
      '       FREELANCER_SECRET_KEY=[1,2,...,64]   (JSON dizi)\n' +
      '       veya\n' +
      '       FREELANCER_SECRET_KEY=5J7X...        (base58 string)\n\n' +
      '  B) Proje kök dizinine freelancer-keypair.json dosyası oluşturun:\n' +
      '       npm run generate-wallets\n'
  );
}

/**
 * Freelancer'ın genel anahtarını (public key) döner.
 * Özel anahtar içermez — API rotalarında güvenle kullanılabilir.
 *
 * @returns Base58 kodlu genel anahtar string'i
 */
export function freelancerAcikAnahtarAl(): string {
  return freelancerKeypairAl().publicKey.toBase58();
}
