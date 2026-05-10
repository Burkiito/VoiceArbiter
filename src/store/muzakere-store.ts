// VoiceArbiter — Müzakere Zustand Deposu
// Uygulamanın tüm global durumunu yönetir

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  SozlesmeAsamasi,
  SozlesmeSartlari,
  MuzakereKaydi,
  GuvenPuaniDetay,
  Bildirim,
  BildirimTuru,
} from '@/types';

// ─── Depo durumu arayüzü ─────────────────────────────────────────────────────

interface MuzakereDepoDurumu {
  // Taraf bilgileri
  /** Müşterinin bağlı Phantom cüzdan adresi */
  musteriCuzdani: string | null;
  /** Freelancer'ın arka uç genel anahtar adresi */
  freelancerKimlik: string | null;

  // Durum makinesi
  /** Sözleşmenin mevcut aşaması */
  aktifAsama: SozlesmeAsamasi;

  // Müzakere içeriği
  /** Ses kayıtlarının transkriptleri */
  muzakereMesajlari: MuzakereKaydi[];
  /** AI tarafından çıkarılan sözleşme şartları */
  sozlesmeSartlari: SozlesmeSartlari | null;

  // Güven puanları
  /** Müşteri cüzdanı güven puanı raporu */
  musteriGuvenPuani: GuvenPuaniDetay | null;

  // İşlem bilgileri
  /** Escrow işleminin imzası */
  escrowImzasi: string | null;
  /** Escrow PDA adresi */
  escrowAdresi: string | null;

  // UI durumu
  /** Uygulama bildirimleri */
  bildirimler: Bildirim[];
  /** Aktif yükleme durumları */
  yukleniyorDurumlar: Record<string, boolean>;

  // ─── Eylemler ──────────────────────────────────────────────────────────────

  /** Bir sonraki sözleşme aşamasına geç */
  asamaGec: (yeniAsama: SozlesmeAsamasi) => void;
  /** Yeni bir müzakere mesajı ekle */
  mesajEkle: (mesaj: MuzakereKaydi) => void;
  /** Sözleşme şartlarını güncelle */
  sartlariGuncelle: (sartlar: SozlesmeSartlari) => void;
  /** Müşteri cüzdan adresini ayarla */
  musteriCuzdaniniAyarla: (adres: string | null) => void;
  /** Freelancer kimliğini ayarla */
  freelancerKimliginiAyarla: (adres: string) => void;
  /** Müşteri güven puanını ayarla */
  musteriGuvenPuaniniAyarla: (puan: GuvenPuaniDetay) => void;
  /** Escrow bilgilerini ayarla */
  escrowBilgileriniAyarla: (imza: string, adres: string) => void;
  /** Bildirim ekle */
  bildirimEkle: (tur: BildirimTuru, baslik: string, mesaj: string) => void;
  /** Bildirimi kaldır */
  bildirimKaldir: (kimlik: string) => void;
  /** Yükleme durumunu güncelle */
  yukleniyorAyarla: (anahtar: string, durum: boolean) => void;
  /** Tüm durumu sıfırla */
  sifirla: () => void;
}

// ─── Başlangıç durumu ────────────────────────────────────────────────────────

const baslangicDurumu = {
  musteriCuzdani: null,
  freelancerKimlik: null,
  aktifAsama: 'IDLE' as SozlesmeAsamasi,
  muzakereMesajlari: [],
  sozlesmeSartlari: null,
  musteriGuvenPuani: null,
  escrowImzasi: null,
  escrowAdresi: null,
  bildirimler: [],
  yukleniyorDurumlar: {},
};

// ─── Depo oluşturma ──────────────────────────────────────────────────────────

export const muzakereDepoyuKullan = create<MuzakereDepoDurumu>()(
  persist(
    (set, get) => ({
      ...baslangicDurumu,

      // Aşama geçişi
      asamaGec: (yeniAsama) => {
        const eskiAsama = get().aktifAsama;
        console.log(`[VoiceArbiter] Aşama geçişi: ${eskiAsama} → ${yeniAsama}`);
        set({ aktifAsama: yeniAsama });
      },

      // Mesaj ekleme
      mesajEkle: (mesaj) =>
        set((durum) => ({
          muzakereMesajlari: [...durum.muzakereMesajlari, mesaj],
        })),

      // Şart güncelleme
      sartlariGuncelle: (sartlar) => set({ sozlesmeSartlari: sartlar }),

      // Müşteri cüzdanı ayarlama
      musteriCuzdaniniAyarla: (adres) => {
        set({ musteriCuzdani: adres });
        if (adres && get().aktifAsama === 'IDLE') {
          get().asamaGec('KAYIT');
        } else if (!adres) {
          get().sifirla();
        }
      },

      // Freelancer kimliği ayarlama
      freelancerKimliginiAyarla: (adres) => set({ freelancerKimlik: adres }),

      // Güven puanı ayarlama
      musteriGuvenPuaniniAyarla: (puan) => set({ musteriGuvenPuani: puan }),

      // Escrow bilgileri ayarlama
      escrowBilgileriniAyarla: (imza, adres) =>
        set({
          escrowImzasi: imza,
          escrowAdresi: adres,
          aktifAsama: 'ESCROW_FUNDED',
        }),

      // Bildirim ekleme
      bildirimEkle: (tur, baslik, mesaj) => {
        const yeniBildirim: Bildirim = {
          kimlik: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tur,
          baslik,
          mesaj,
          zaman: new Date().toISOString(),
        };
        set((durum) => ({
          bildirimler: [...durum.bildirimler, yeniBildirim],
        }));
        // Bildirimler 5 saniye sonra otomatik kapanır
        setTimeout(() => {
          get().bildirimKaldir(yeniBildirim.kimlik);
        }, 5000);
      },

      // Bildirim kaldırma
      bildirimKaldir: (kimlik) =>
        set((durum) => ({
          bildirimler: durum.bildirimler.filter((b) => b.kimlik !== kimlik),
        })),

      // Yükleme durumu ayarlama
      yukleniyorAyarla: (anahtar, durum) =>
        set((mevcut) => ({
          yukleniyorDurumlar: {
            ...mevcut.yukleniyorDurumlar,
            [anahtar]: durum,
          },
        })),

      // Sıfırlama
      sifirla: () => {
        console.log('[VoiceArbiter] Durum sıfırlanıyor...');
        set(baslangicDurumu);
      },
    }),
    {
      // Kalıcı depolama yapılandırması
      name: 'voicearbiter-muzakere',
      storage: createJSONStorage(() => sessionStorage),
      // Yalnızca bu alanları depola
      partialize: (durum) => ({
        aktifAsama: durum.aktifAsama,
        muzakereMesajlari: durum.muzakereMesajlari,
        sozlesmeSartlari: durum.sozlesmeSartlari,
        musteriCuzdani: durum.musteriCuzdani,
        freelancerKimlik: durum.freelancerKimlik,
        escrowImzasi: durum.escrowImzasi,
        escrowAdresi: durum.escrowAdresi,
      }),
    }
  )
);

// ─── Yardımcı seçiciler ───────────────────────────────────────────────────────

/** Belirli bir yükleme durumunu kontrol eder */
export const yukleniyorMu = (anahtar: string) =>
  muzakereDepoyuKullan((durum) => durum.yukleniyorDurumlar[anahtar] ?? false);

/** Sözleşmenin tamamlanıp tamamlanmadığını kontrol eder */
export const sozlesmeTamamlandiMi = () =>
  muzakereDepoyuKullan((durum) => durum.aktifAsama === 'TAMAMLANDI');

/** Müzakerenin aktif olup olmadığını kontrol eder */
export const muzakereAktifMi = () =>
  muzakereDepoyuKullan(
    (durum) => durum.aktifAsama === 'MUZAKERE' || durum.aktifAsama === 'ONAY'
  );
