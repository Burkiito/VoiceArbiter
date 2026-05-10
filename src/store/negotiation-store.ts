// VoiceArbiter — Merkezi Müzakere Deposu (Zustand)
// Uygulamanın tüm global durumunu tek yerden yönetir

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Sözleşme Aşamaları ──────────────────────────────────────────────────────

/**
 * Sözleşme sürecinin durum makinesi aşamaları:
 *   IDLE          — Başlangıç; hiçbir taraf kayıtlı değil
 *   NEGOTIATING   — Sesli müzakere aktif
 *   CONFIRMING    — AI şartları çıkardı, taraflar onay veriyor
 *   ESCROW_FUNDED — Müşteri escrow'a SOL kilitledi
 *   COMPLETED     — Sözleşme tamamlandı, ödeme serbest bırakıldı
 */
export type SozlesmeAsamasi =
  | 'IDLE'
  | 'NEGOTIATING'
  | 'CONFIRMING'
  | 'ESCROW_FUNDED'
  | 'COMPLETED';

// ─── Taraf Kayıt Durumları ───────────────────────────────────────────────────

/** Taraf A: Müşteri — Phantom cüzdanı ile bağlanan taraf */
export interface TarafADurumu {
  /** Bağlı Phantom cüzdan adresi; bağlı değilse null */
  cuzdanAdresi: string | null;
  /** Kayıt tamamlandı mı? */
  kayitliMi: boolean;
}

/** Taraf B: Freelancer — Arka uç keypair ile temsil edilen taraf */
export interface TarafBDurumu {
  /** Arka uç keypair'den yüklenen genel anahtar (public key) adresi */
  acikAnahtarAdresi: string | null;
  /** Kimlik doğrulama tamamlandı mı? */
  dogrulandiMi: boolean;
}

// ─── Ses Transkript Kaydı ────────────────────────────────────────────────────

/** Whisper API'den dönen bir ses konuşma kaydı */
export interface TranskriptKaydi {
  kimlik: string;
  taraf: 'MUSTERI' | 'FREELANCER';
  metin: string;
  dil: string;
  zaman: string;
  translatedText?: string;
}

// ─── AI Tarafından Çıkarılan Sözleşme Şartları ──────────────────────────────

/** Müzakereden AI tarafından çıkarılan sözleşme terimleri */
export interface SozlesmeSartlari {
  /** Tutar (SOL cinsinden); belirlenemezse null */
  miktar: number | null;
  /** Teslim tarihi (ISO 8601); belirlenemezse null */
  sonTarih: string | null;
  /** Projenin kapsamı ve açıklaması */
  kapsam: string | null;
  /** Çıkarım güven seviyesi (0–1 arası) */
  guvenSeviyesi: number;
  /** Eksik veya belirsiz kalan bilgiler */
  eksikBilgiler: string[];
}

// ─── Güven Puanı ─────────────────────────────────────────────────────────────

/** Tek bir güven kategorisinin puanı ve gerekçesi */
export interface GuvenKategorisi {
  /** Kazanılan puan */
  puan: number;
  /** Kategorinin maksimum puanı */
  maksimumPuan: number;
  /** Türkçe gerekçe metni — kullanıcıya gösterilen açıklama */
  aciklama: string;
}

/** 100 puanlık kategorik güven skoru raporu */
export interface GuvenPuaniDetay {
  /** Toplam puan (0–100) */
  toplamPuan: number;
  /** Sorgulanan cüzdan adresi */
  adres: string;
  /** Yaş kategorisi — maks. 30 puan */
  yas: GuvenKategorisi;
  /** Aktivite kategorisi — maks. 25 puan */
  aktivite: GuvenKategorisi;
  /** Bakiye kategorisi — maks. 20 puan */
  bakiye: GuvenKategorisi;
  /** Köken kategorisi (ilk fon kaynağı) — maks. 25 puan */
  koken: GuvenKategorisi;
  /** Hesaplama zaman damgası */
  hesaplanmaZamani: string;
}

// ─── Depo Arayüzü ────────────────────────────────────────────────────────────

interface MuzakereDepoDurumu {
  tarafA: TarafADurumu;
  tarafB: TarafBDurumu;
  aktifAsama: SozlesmeAsamasi;
  transkriptler: TranskriptKaydi[];
  sozlesmeSartlari: SozlesmeSartlari | null;
  musteriGuvenPuani: GuvenPuaniDetay | null;
  escrowImzasi: string | null;
  escrowAdresi: string | null;
  yuklenenIslemler: Record<string, boolean>;
  partyALang: string;
  partyBLang: string;

  asamayiGuncelle: (yeniAsama: SozlesmeAsamasi) => void;
  tarafAyiKaydet: (cuzdanAdresi: string | null) => void;
  tarafByiKaydet: (acikAnahtarAdresi: string) => void;
  transkriptEkle: (kayit: TranskriptKaydi) => void;
  transkriptCevirisiniGuncelle: (kimlik: string, ceviri: string) => void;
  sartlariGuncelle: (sartlar: SozlesmeSartlari) => void;
  guvenPuaniniAyarla: (puan: GuvenPuaniDetay) => void;
  escrowuKaydet: (imza: string, pdaAdresi: string) => void;
  yukleniyorAyarla: (islem: string, durum: boolean) => void;
  partyALangAyarla: (lang: string) => void;
  partyBLangAyarla: (lang: string) => void;
  sifirla: () => void;
}

// ─── Başlangıç Durumu ────────────────────────────────────────────────────────

const baslangicTarafA: TarafADurumu = {
  cuzdanAdresi: null,
  kayitliMi: false,
};

const baslangicTarafB: TarafBDurumu = {
  acikAnahtarAdresi: null,
  dogrulandiMi: false,
};

const baslangicDurumu = {
  tarafA: baslangicTarafA,
  tarafB: baslangicTarafB,
  aktifAsama: 'IDLE' as SozlesmeAsamasi,
  transkriptler: [] as TranskriptKaydi[],
  sozlesmeSartlari: null,
  musteriGuvenPuani: null,
  escrowImzasi: null,
  escrowAdresi: null,
  yuklenenIslemler: {} as Record<string, boolean>,
  partyALang: 'en',
  partyBLang: 'en',
};

// ─── Depo Oluşturma ──────────────────────────────────────────────────────────

export const muzakereDepoyuKullan = create<MuzakereDepoDurumu>()(
  persist(
    (set, get) => ({
      ...baslangicDurumu,

      // Aşama geçişi — ileriye doğru tek yön; geri dönüş yalnızca sıfırlamayla
      asamayiGuncelle: (yeniAsama) => {
        const onceki = get().aktifAsama;
        console.log(`[VoiceArbiter] Aşama: ${onceki} → ${yeniAsama}`);
        set({ aktifAsama: yeniAsama });
      },

      // Taraf A kaydı
      tarafAyiKaydet: (cuzdanAdresi) => {
        if (!cuzdanAdresi) {
          // Cüzdan bağlantısı kesildi — tüm durumu temizle
          get().sifirla();
          return;
        }
        set({
          tarafA: { cuzdanAdresi, kayitliMi: true },
        });
        // Her iki taraf da kayıtlıysa müzakereye geç
        if (get().tarafB.dogrulandiMi) {
          get().asamayiGuncelle('NEGOTIATING');
        }
      },

      // Taraf B kaydı
      tarafByiKaydet: (acikAnahtarAdresi) => {
        set({
          tarafB: { acikAnahtarAdresi, dogrulandiMi: true },
        });
        // Her iki taraf da kayıtlıysa müzakereye geç
        if (get().tarafA.kayitliMi) {
          get().asamayiGuncelle('NEGOTIATING');
        }
      },

      transkriptEkle: (kayit) =>
        set((durum) => ({
          transkriptler: [...durum.transkriptler, kayit],
        })),

      transkriptCevirisiniGuncelle: (kimlik, ceviri) =>
        set((durum) => ({
          transkriptler: durum.transkriptler.map((k) =>
            k.kimlik === kimlik ? { ...k, translatedText: ceviri } : k
          ),
        })),

      partyALangAyarla: (lang) => set({ partyALang: lang }),
      partyBLangAyarla: (lang) => set({ partyBLang: lang }),

      // Sözleşme şartları güncelleme
      sartlariGuncelle: (sartlar) => set({ sozlesmeSartlari: sartlar }),

      // Güven puanı kaydetme
      guvenPuaniniAyarla: (puan) => set({ musteriGuvenPuani: puan }),

      // Escrow kaydetme — aşamayı otomatik olarak ESCROW_FUNDED yapar
      escrowuKaydet: (imza, pdaAdresi) =>
        set({
          escrowImzasi: imza,
          escrowAdresi: pdaAdresi,
          aktifAsama: 'ESCROW_FUNDED',
        }),

      // Yükleme durumu yönetimi
      yukleniyorAyarla: (islem, durum) =>
        set((mevcut) => ({
          yuklenenIslemler: {
            ...mevcut.yuklenenIslemler,
            [islem]: durum,
          },
        })),

      // Tam sıfırlama — yeni müzakere başlatmak için
      sifirla: () => {
        console.log('[VoiceArbiter] Durum sıfırlanıyor...');
        set(baslangicDurumu);
      },
    }),
    {
      name: 'voicearbiter-muzakere-v2',
      // sessionStorage: sekme kapanınca temizlenir, oturum boyunca kalıcıdır
      storage: createJSONStorage(() => sessionStorage),
      // Yalnızca kritik alanları depola; güven puanı ve yükleme durumları hariç
      partialize: (durum) => ({
        tarafA: durum.tarafA,
        tarafB: durum.tarafB,
        aktifAsama: durum.aktifAsama,
        transkriptler: durum.transkriptler,
        sozlesmeSartlari: durum.sozlesmeSartlari,
        escrowImzasi: durum.escrowImzasi,
        escrowAdresi: durum.escrowAdresi,
        partyALang: durum.partyALang,
        partyBLang: durum.partyBLang,
      }),
    }
  )
);

// ─── Türetilmiş Seçiciler ─────────────────────────────────────────────────────

/** Belirli bir işlemin yüklenme durumunu döner */
export const islemYukleniyor = (islemAdi: string) =>
  muzakereDepoyuKullan((d) => d.yuklenenIslemler[islemAdi] ?? false);

/** Her iki tarafın da kayıtlı olup olmadığını döner */
export const herIkiTarafKayitliMi = () =>
  muzakereDepoyuKullan((d) => d.tarafA.kayitliMi && d.tarafB.dogrulandiMi);

/** Aktif müzakere aşamasında mı olduğumuzu döner */
export const muzakereAktifMi = () =>
  muzakereDepoyuKullan(
    (d) => d.aktifAsama === 'NEGOTIATING' || d.aktifAsama === 'CONFIRMING'
  );

/** Sözleşmenin tamamlanıp tamamlanmadığını döner */
export const sozlesmeTamamlandiMi = () =>
  muzakereDepoyuKullan((d) => d.aktifAsama === 'COMPLETED');
