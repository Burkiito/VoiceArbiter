// VoiceArbiter — Güven Skoru Hesaplama Modülü
// Cüzdan güven puanını 4 kategoride 100 puan üzerinden hesaplar

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { CuzdanVerisi, GuvenPuaniDetay, GuvenKategorisi } from '@/types';

// ─── Puan ağırlıkları ────────────────────────────────────────────────────────

/** Her kategorinin maksimum puanı (toplam: 100) */
const PUAN_AGIRLIKLARI = {
  yas: 30,       // Cüzdan yaşı
  aktivite: 25,  // İşlem sayısı
  bakiye: 20,    // SOL bakiyesi
  koken: 25,     // İlk fon kaynağı kalitesi
} as const;

// ─── Bilinen güvenilir adresler ──────────────────────────────────────────────

/**
 * Tanınmış borsa ve köprü adresleri (güvenli köken göstergesi).
 * Bu listeler genel olarak bilinmektedir, gizli değildir.
 */
const GUVENILIR_ADRESLER = new Set([
  // Binance sıcak cüzdan örnekleri (genel bilgi)
  '5tzFkiKscXHK5irkXDMrMnksAnsBuLFEiPfPHCWaXFuF',
  // Coinbase
  'H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS',
  // FTX (artık aktif değil, ama köken referansı için)
  'FTX6ieL3oPJXWBbhG9LMqrMJeG4UHxD6vNhBhNLEoMvX',
]);

// ─── Helius API yardımcıları ─────────────────────────────────────────────────

/**
 * Helius API üzerinden gelişmiş cüzdan verisi çeker.
 * Başarısız olursa null döndürür (genel RPC'ye düşülür).
 */
async function heliusdanCuzdanVerisiCek(
  adres: string,
  heliusApiAnahtari: string
): Promise<Partial<CuzdanVerisi> | null> {
  try {
    // Helius RPC üzerinden işlem geçmişini çek
    const url = `https://api.helius.xyz/v0/addresses/${adres}/transactions?api-key=${heliusApiAnahtari}&limit=100`;
    const yanit = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!yanit.ok) return null;

    const islemler = await yanit.json();
    const islemSayisi = Array.isArray(islemler) ? islemler.length : 0;

    // En eski işlemin zaman damgasını bul (cüzdan yaşı için)
    let enEskiZaman: number | null = null;
    if (islemSayisi > 0 && Array.isArray(islemler)) {
      const sonIslem = islemler[islemler.length - 1];
      if (sonIslem?.timestamp) {
        enEskiZaman = sonIslem.timestamp;
      }
    }

    // Yaşı gün cinsinden hesapla
    let yasGun = 0;
    if (enEskiZaman) {
      const simdi = Math.floor(Date.now() / 1000);
      yasGun = Math.floor((simdi - enEskiZaman) / 86400);
    }

    return {
      islemSayisi,
      yasGun,
      veriKaynagi: 'helius',
    };
  } catch {
    // Helius başarısız oldu, sessizce devam et
    return null;
  }
}

/**
 * Genel Devnet/Mainnet RPC üzerinden temel cüzdan verisi çeker.
 * Her zaman bir değer döndürür (yedek kaynak).
 */
async function genelRpcdenCuzdanVerisiCek(
  adres: string,
  baglanti: Connection
): Promise<Partial<CuzdanVerisi>> {
  try {
    const acikAnahtar = new PublicKey(adres);

    // Bakiyeyi al
    const bakiyeLamport = await baglanti.getBalance(acikAnahtar);
    const solBakiye = bakiyeLamport / LAMPORTS_PER_SOL;

    // İşlem imzalarını al (son 100)
    const imzalar = await baglanti.getSignaturesForAddress(acikAnahtar, { limit: 100 });
    const islemSayisi = imzalar.length;

    // En eski işlemden yaş hesapla
    let yasGun = 0;
    if (imzalar.length > 0) {
      const sonImza = imzalar[imzalar.length - 1];
      if (sonImza.blockTime) {
        const simdi = Math.floor(Date.now() / 1000);
        yasGun = Math.floor((simdi - sonImza.blockTime) / 86400);
      }
    }

    // İlk fon kaynağını bulmaya çalış
    let ilkFonKaynagi: string | null = null;
    if (imzalar.length > 0) {
      const enEskiImza = imzalar[imzalar.length - 1];
      try {
        const islem = await baglanti.getTransaction(enEskiImza.signature, {
          maxSupportedTransactionVersion: 0,
        });
        if (islem?.transaction?.message) {
          // İlk hesap anahtarı genellikle fon gönderendir
          const hesapAnahtarlari = islem.transaction.message.getAccountKeys
            ? islem.transaction.message.getAccountKeys().staticAccountKeys
            : [];
          if (hesapAnahtarlari.length > 0) {
            const ilkHesap = hesapAnahtarlari[0].toBase58();
            if (ilkHesap !== adres) {
              ilkFonKaynagi = ilkHesap;
            }
          }
        }
      } catch {
        // İlk fon kaynağı alınamadı, null olarak devam et
      }
    }

    return {
      solBakiye,
      islemSayisi,
      yasGun,
      ilkFonKaynagi,
      veriKaynagi: 'genel_rpc',
    };
  } catch (hata) {
    console.error('[GuvenSkoru] Genel RPC verisi alınamadı:', hata);
    // Minimum veri döndür
    return {
      solBakiye: 0,
      islemSayisi: 0,
      yasGun: 0,
      ilkFonKaynagi: null,
      veriKaynagi: 'genel_rpc',
    };
  }
}

// ─── Ana veri çekme fonksiyonu ────────────────────────────────────────────────

/**
 * Bir cüzdanın güven puanı hesabı için gereken tüm verileri çeker.
 * Önce Helius API'ı dener, başarısız olursa genel RPC'ye düşer.
 *
 * @param adres — Sorgulanacak cüzdan adresi
 * @param heliusApiAnahtari — Opsiyonel Helius API anahtarı
 * @returns CuzdanVerisi nesnesi
 */
export async function fetchWalletData(
  adres: string,
  heliusApiAnahtari?: string
): Promise<CuzdanVerisi> {
  // Adres doğrulama
  let acikAnahtar: PublicKey;
  try {
    acikAnahtar = new PublicKey(adres);
  } catch {
    throw new Error(`Geçersiz cüzdan adresi: ${adres}`);
  }

  // Bağlantı oluştur
  const rpcUrl =
    process.env.HELIUS_RPC_URL ??
    process.env.NEXT_PUBLIC_SOLANA_RPC ??
    'https://api.devnet.solana.com';
  const baglanti = new Connection(rpcUrl, 'confirmed');

  // Genel RPC'den temel veri çek
  const genelVeri = await genelRpcdenCuzdanVerisiCek(adres, baglanti);

  // Helius API'dan ek veri çekmeyi dene
  let heliusVerisi: Partial<CuzdanVerisi> | null = null;
  const efektifHeliusAnahtari = heliusApiAnahtari ?? process.env.HELIUS_API_KEY;
  if (efektifHeliusAnahtari) {
    heliusVerisi = await heliusdanCuzdanVerisiCek(adres, efektifHeliusAnahtari);
  }

  // Verileri birleştir (Helius daha güvenilir ise öncelik ver)
  const birlesikVeri: CuzdanVerisi = {
    adres,
    yasGun: heliusVerisi?.yasGun ?? genelVeri.yasGun ?? 0,
    islemSayisi: heliusVerisi?.islemSayisi ?? genelVeri.islemSayisi ?? 0,
    solBakiye: genelVeri.solBakiye ?? 0,
    ilkFonKaynagi: genelVeri.ilkFonKaynagi ?? null,
    veriKaynagi: heliusVerisi ? 'helius' : 'genel_rpc',
  };

  return birlesikVeri;
}

// ─── Puan hesaplama ───────────────────────────────────────────────────────────

/**
 * Cüzdan yaşına göre puan hesaplar (maks. 30).
 * 0-7 gün: 0-5 puan
 * 7-30 gün: 5-15 puan
 * 30-90 gün: 15-22 puan
 * 90-365 gün: 22-28 puan
 * 365+ gün: 28-30 puan
 */
function yasKategorisiHesapla(yasGun: number): GuvenKategorisi {
  const maks = PUAN_AGIRLIKLARI.yas;
  let puan: number;

  if (yasGun >= 365) {
    puan = 30;
  } else if (yasGun >= 90) {
    puan = 22 + Math.floor(((yasGun - 90) / 275) * 6);
  } else if (yasGun >= 30) {
    puan = 15 + Math.floor(((yasGun - 30) / 60) * 7);
  } else if (yasGun >= 7) {
    puan = 5 + Math.floor(((yasGun - 7) / 23) * 10);
  } else {
    puan = Math.floor((yasGun / 7) * 5);
  }

  puan = Math.min(puan, maks);

  let aciklama: string;
  if (yasGun === 0) {
    aciklama = 'Bu cüzdan çok yeni veya yaşı belirlenemiyor. Güven kaydı bulunmuyor.';
  } else if (yasGun < 7) {
    aciklama = `Bu cüzdan yalnızca ${yasGun} günlüktür. Henüz güven geçmişi oluşmamıştır.`;
  } else if (yasGun < 30) {
    aciklama = `Bu cüzdan ${yasGun} günlüktür. Kısa sürede faaliyete geçmiş, sınırlı geçmişi vardır.`;
  } else if (yasGun < 90) {
    aciklama = `Bu cüzdan ${yasGun} günlüktür. Orta düzeyde güven sağlamaktadır.`;
  } else if (yasGun < 365) {
    aciklama = `Bu cüzdan ${yasGun} günlüktür. İyi düzeyde güven geçmişine sahiptir.`;
  } else {
    const yil = Math.floor(yasGun / 365);
    aciklama = `Bu cüzdan ${yil} yılı aşkın süredir aktiftir. Güçlü bir geçmişe sahiptir.`;
  }

  return {
    kategoriAdi: 'Yaş',
    puan,
    maksimumPuan: maks,
    aciklama,
  };
}

/**
 * İşlem sayısına göre aktivite puanı hesaplar (maks. 25).
 */
function aktiviteKategorisiHesapla(islemSayisi: number): GuvenKategorisi {
  const maks = PUAN_AGIRLIKLARI.aktivite;
  let puan: number;

  if (islemSayisi >= 500) {
    puan = 25;
  } else if (islemSayisi >= 100) {
    puan = 18 + Math.floor(((islemSayisi - 100) / 400) * 7);
  } else if (islemSayisi >= 20) {
    puan = 10 + Math.floor(((islemSayisi - 20) / 80) * 8);
  } else if (islemSayisi >= 5) {
    puan = 4 + Math.floor(((islemSayisi - 5) / 15) * 6);
  } else {
    puan = islemSayisi;
  }

  puan = Math.min(puan, maks);

  let aciklama: string;
  if (islemSayisi === 0) {
    aciklama = 'Bu cüzdanda hiç işlem tespit edilmedi. Geçmişi yok.';
  } else if (islemSayisi < 5) {
    aciklama = `${islemSayisi} işlem tespit edildi. Çok az aktivite bulunuyor.`;
  } else if (islemSayisi < 20) {
    aciklama = `${islemSayisi} işlem tespit edildi. Düşük düzeyde aktivite bulunuyor.`;
  } else if (islemSayisi < 100) {
    aciklama = `${islemSayisi} işlem tespit edildi. Orta düzeyde aktif bir kullanıcı profili.`;
  } else if (islemSayisi < 500) {
    aciklama = `${islemSayisi} işlem tespit edildi. Aktif kullanıcı profiline uygun.`;
  } else {
    aciklama = `${islemSayisi}+ işlem tespit edildi. Çok aktif ve köklü bir cüzdan.`;
  }

  return {
    kategoriAdi: 'Aktivite',
    puan,
    maksimumPuan: maks,
    aciklama,
  };
}

/**
 * SOL bakiyesine göre puan hesaplar (maks. 20).
 */
function bakiyeKategorisiHesapla(solBakiye: number): GuvenKategorisi {
  const maks = PUAN_AGIRLIKLARI.bakiye;
  let puan: number;

  if (solBakiye >= 10) {
    puan = 20;
  } else if (solBakiye >= 2) {
    puan = 14 + Math.floor(((solBakiye - 2) / 8) * 6);
  } else if (solBakiye >= 0.5) {
    puan = 8 + Math.floor(((solBakiye - 0.5) / 1.5) * 6);
  } else if (solBakiye >= 0.1) {
    puan = 3 + Math.floor(((solBakiye - 0.1) / 0.4) * 5);
  } else {
    puan = Math.floor((solBakiye / 0.1) * 3);
  }

  puan = Math.min(puan, maks);

  let aciklama: string;
  const formatlanmisBakiye = solBakiye.toFixed(3);

  if (solBakiye < 0.1) {
    aciklama = `${formatlanmisBakiye} SOL mevcut. Yetersiz bakiye; sözleşme değerini karşılamak için yetersiz.`;
  } else if (solBakiye < 0.5) {
    aciklama = `${formatlanmisBakiye} SOL mevcut. Düşük bakiye; küçük sözleşmeler için yeterli olabilir.`;
  } else if (solBakiye < 2) {
    aciklama = `${formatlanmisBakiye} SOL mevcut. Orta düzeyde bakiye; standart sözleşmeler için yeterli.`;
  } else if (solBakiye < 10) {
    aciklama = `${formatlanmisBakiye} SOL mevcut. Sözleşme değerini karşılamak için yeterli.`;
  } else {
    aciklama = `${formatlanmisBakiye} SOL mevcut. Güçlü bakiye; büyük sözleşmeler için uygundur.`;
  }

  return {
    kategoriAdi: 'Bakiye',
    puan,
    maksimumPuan: maks,
    aciklama,
  };
}

/**
 * İlk fon kaynağına göre köken puanı hesaplar (maks. 25).
 */
function kokenKategorisiHesapla(ilkFonKaynagi: string | null): GuvenKategorisi {
  const maks = PUAN_AGIRLIKLARI.koken;
  let puan: number;
  let aciklama: string;

  if (!ilkFonKaynagi) {
    puan = 8;
    aciklama = 'İlk fon kaynağı tespit edilemedi. Köken belirsiz, orta düzey güven atandı.';
  } else if (GUVENILIR_ADRESLER.has(ilkFonKaynagi)) {
    puan = 25;
    aciklama = 'İlk fon kaynağı tanınmış bir borsa adresidir. Güvenli köken.';
  } else {
    // Adresi kısmen analiz et (basit buluşsal)
    const adresUzunlugu = ilkFonKaynagi.length;
    if (adresUzunlugu === 44 || adresUzunlugu === 43) {
      // Geçerli bir Solana adresi
      puan = 15;
      aciklama = `İlk fon kaynağı bireysel bir cüzdandır (${ilkFonKaynagi.substring(0, 8)}...). Köken doğrulanamadı.`;
    } else {
      puan = 5;
      aciklama = 'İlk fon kaynağı tanımsız veya şüpheli bir adrestir. Dikkatli olunması önerilir.';
    }
  }

  return {
    kategoriAdi: 'Köken',
    puan,
    maksimumPuan: maks,
    aciklama,
  };
}

// ─── Ana hesaplama fonksiyonu ─────────────────────────────────────────────────

/**
 * Cüzdan verilerinden kapsamlı güven puanı raporu oluşturur.
 *
 * @param cuzdanVerisi — fetchWalletData() tarafından döndürülen veri
 * @returns GuvenPuaniDetay — kategorik puan dökümü ve açıklamalar
 */
export function hesaplaGuvenPuani(cuzdanVerisi: CuzdanVerisi): GuvenPuaniDetay {
  // Her kategori için puan hesapla
  const yasKategorisi = yasKategorisiHesapla(cuzdanVerisi.yasGun);
  const aktiviteKategorisi = aktiviteKategorisiHesapla(cuzdanVerisi.islemSayisi);
  const bakiyeKategorisi = bakiyeKategorisiHesapla(cuzdanVerisi.solBakiye);
  const kokenKategorisi = kokenKategorisiHesapla(cuzdanVerisi.ilkFonKaynagi);

  // Toplam puanı hesapla
  const toplamPuan =
    yasKategorisi.puan +
    aktiviteKategorisi.puan +
    bakiyeKategorisi.puan +
    kokenKategorisi.puan;

  return {
    toplamPuan: Math.min(toplamPuan, 100),
    adres: cuzdanVerisi.adres,
    yas: yasKategorisi,
    aktivite: aktiviteKategorisi,
    bakiye: bakiyeKategorisi,
    koken: kokenKategorisi,
    hesaplanmaZamani: new Date().toISOString(),
  };
}

// ─── Türkçe yardımcı metin üretici ───────────────────────────────────────────

/**
 * Güven puanı kategorisi için Türkçe yardımcı metin döndürür.
 *
 * @param kategori — Kategori adı
 * @param puan — Kazanılan puan
 * @returns Türkçe açıklama stringi
 */
export function getHelperText(
  kategori: 'yas' | 'aktivite' | 'bakiye' | 'koken',
  puan: number
): string {
  const maksimumPuanlar = {
    yas: 30,
    aktivite: 25,
    bakiye: 20,
    koken: 25,
  };

  const maks = maksimumPuanlar[kategori];
  const oran = puan / maks;

  if (oran >= 0.9) return 'Mükemmel';
  if (oran >= 0.7) return 'İyi';
  if (oran >= 0.5) return 'Orta';
  if (oran >= 0.3) return 'Zayıf';
  return 'Yetersiz';
}

/**
 * Toplam güven puanına göre genel değerlendirme metni döndürür.
 */
export function genelDegerlendirme(toplamPuan: number): string {
  if (toplamPuan >= 85) return 'Yüksek Güven — Bu cüzdan güvenilir bir geçmişe sahiptir.';
  if (toplamPuan >= 65) return 'Orta-Yüksek Güven — Kabul edilebilir düzeyde güven sağlanmaktadır.';
  if (toplamPuan >= 45) return 'Orta Güven — Dikkatli ilerlenmesi tavsiye edilir.';
  if (toplamPuan >= 25) return 'Düşük Güven — Bu cüzdanla işlem yaparken ihtiyatlı olun.';
  return 'Çok Düşük Güven — Bu cüzdan yeterli geçmişe sahip değil; yüksek risk.';
}
