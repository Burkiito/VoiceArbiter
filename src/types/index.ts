// VoiceArbiter — TypeScript tip tanımlamaları
// Tüm tipler Türkçe yorumlarla belgelenmiştir

// ─── Taraf türleri ───────────────────────────────────────────────────────────

/** Müzakeredeki tarafın rolünü belirler */
export type TarafTuru = 'MUSTERI' | 'FREELANCER';

// ─── Sözleşme aşamaları (durum makinesi) ────────────────────────────────────

/**
 * Sözleşme sürecinin aşamaları
 * IDLE          → Başlangıç durumu, hiçbir taraf bağlı değil
 * KAYIT         → Taraflar kimliklerini doğruluyor
 * MUZAKERE      → Sesli müzakere aktif
 * ONAY          → Şartlar çıkarıldı, onay bekleniyor
 * ESCROW_FUNDED → Escrow hesabı fonlandı
 * TAMAMLANDI    → Sözleşme tamamlandı
 */
export type SozlesmeAsamasi =
  | 'IDLE'
  | 'KAYIT'
  | 'MUZAKERE'
  | 'ONAY'
  | 'ESCROW_FUNDED'
  | 'TAMAMLANDI';

// ─── Güven puanı tipleri ─────────────────────────────────────────────────────

/** Tek bir güven puanı kategorisi */
export interface GuvenKategorisi {
  /** Kategorinin Türkçe adı (örn. "Yaş", "Aktivite") */
  kategoriAdi: string;
  /** Kazanılan puan */
  puan: number;
  /** Bu kategoriden alınabilecek maksimum puan */
  maksimumPuan: number;
  /** Türkçe açıklama metni */
  aciklama: string;
}

/** Tam güven puanı raporu */
export interface GuvenPuaniDetay {
  /** Toplam puan (0–100) */
  toplamPuan: number;
  /** Cüzdan adresi */
  adres: string;
  /** Yaş kategorisi (maks. 30 puan) — cüzdan oluşturulma tarihi */
  yas: GuvenKategorisi;
  /** Aktivite kategorisi (maks. 25 puan) — işlem sayısı */
  aktivite: GuvenKategorisi;
  /** Bakiye kategorisi (maks. 20 puan) — SOL miktarı */
  bakiye: GuvenKategorisi;
  /** Köken kategorisi (maks. 25 puan) — ilk fon kaynağı kalitesi */
  koken: GuvenKategorisi;
  /** Hesaplama zaman damgası */
  hesaplanmaZamani: string;
  /** Veri kaynağı (opsiyonel) */
  veriKaynagi?: string;
}

// ─── Ham cüzdan verisi ───────────────────────────────────────────────────────

/** Güven puanı hesabı için ham cüzdan verisi */
export interface CuzdanVerisi {
  /** Cüzdan adresi */
  adres: string;
  /** Cüzdanın kaç günlük olduğu */
  yasGun: number;
  /** Toplam işlem sayısı */
  islemSayisi: number;
  /** Mevcut SOL bakiyesi */
  solBakiye: number;
  /** İlk fon kaynağının adresi (bilinmiyorsa null) */
  ilkFonKaynagi: string | null;
  /** Veri kaynağı: Helius API veya genel RPC */
  veriKaynagi: 'helius' | 'genel_rpc';
}

// ─── Sözleşme şartları ───────────────────────────────────────────────────────

/** AI Mediator tarafından çıkarılan sözleşme şartları */
export interface SozlesmeSartlari {
  /** Sözleşme tutarı (SOL cinsinden) */
  miktar: number | null;
  /** Teslim tarihi (ISO 8601 formatında) */
  sonTarih: string | null;
  /** Projenin kapsamı ve açıklaması */
  kapsam: string | null;
  /** Ödeme koşulları */
  odemeKosullari: string | null;
  /** Şartların doğruluk güven seviyesi (0–1 arası) */
  guvenSeviyesi: number;
  /** Eksik veya belirsiz şartlar */
  eksikBilgiler: string[];
}

// ─── Müzakere kaydı ──────────────────────────────────────────────────────────

/** Bir müzakere konuşmasının kaydı */
export interface MuzakereKaydi {
  /** Benzersiz kayıt kimliği */
  kimlik: string;
  /** Konuşmayı yapan taraf */
  taraf: TarafTuru;
  /** Transkript metni */
  metin: string;
  /** Ses kaydının dilil */
  dil: string;
  /** Kayıt zaman damgası */
  zaman: string;
  /** Ses dosyasının URL'si (opsiyonel) */
  sesUrl?: string;
}

// ─── API yanıt tipleri ────────────────────────────────────────────────────────

/** Transkripsiyon API yanıtı */
export interface TranskripsiyonYaniti {
  metin: string;
  dil: string;
}

/** Analiz API yanıtı */
export interface AnalizYaniti {
  sartlar: SozlesmeSartlari;
  ozet: string;
}

/** Freelancer bilgisi API yanıtı */
export interface FreelancerBilgisiYaniti {
  acikAnahtar: string;
  ag: string;
}

/** Sözleşme imzalama API yanıtı */
export interface ImzalamaYaniti {
  imza: string;
  basarili: boolean;
  hata?: string;
}

// ─── Genel UI tipleri ─────────────────────────────────────────────────────────

/** Yükleme durumu */
export type YuklenmeDurumu = 'bosta' | 'yukleniyor' | 'basarili' | 'hata';

/** Bildirim türleri */
export type BildirimTuru = 'bilgi' | 'basari' | 'uyari' | 'hata';

/** Uygulama bildirimi */
export interface Bildirim {
  kimlik: string;
  tur: BildirimTuru;
  baslik: string;
  mesaj: string;
  zaman: string;
}
