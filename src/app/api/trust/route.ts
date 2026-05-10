// VoiceArbiter — Güven Puanı API Rotası
// GET /api/trust?adres=... — Cüzdan güven puanı raporu

import { NextRequest, NextResponse } from 'next/server';
import { fetchWalletData, hesaplaGuvenPuani } from '@/lib/guven-skoru';
import type { GuvenPuaniDetay } from '@/types';

/**
 * GET /api/trust?adres={cuzdan_adresi}
 *
 * Verilen cüzdan adresi için güven puanı raporu hesaplar.
 * Helius API'ı dener, başarısız olursa genel Devnet RPC'ye düşer.
 *
 * @param request — adres query parametresi içermelidir
 * @returns GuvenPuaniDetay — kategorik puan dökümü
 */
export async function GET(request: NextRequest) {
  // Adres parametresini al
  const { searchParams } = new URL(request.url);
  const adres = searchParams.get('adres');

  if (!adres) {
    return NextResponse.json(
      { hata: '"adres" parametresi zorunludur (örn. /api/trust?adres=ADRES)' },
      { status: 400 }
    );
  }

  // Temel adres uzunluk doğrulaması
  if (adres.length < 32 || adres.length > 44) {
    return NextResponse.json(
      { hata: 'Geçersiz Solana adresi uzunluğu. Base58 formatında 32-44 karakter olmalıdır.' },
      { status: 400 }
    );
  }

  try {
    // Helius API anahtarı (opsiyonel — olmadan genel RPC kullanılır)
    const heliusApiAnahtari = process.env.HELIUS_API_KEY;

    // Cüzdan verisini çek
    console.log(`[API/trust] ${adres.substring(0, 8)}... için veri çekiliyor`);
    const cuzdanVerisi = await fetchWalletData(adres, heliusApiAnahtari);

    // Güven puanını hesapla
    const guvenPuani: GuvenPuaniDetay = hesaplaGuvenPuani(cuzdanVerisi);

    console.log(
      `[API/trust] ${adres.substring(0, 8)}... → ${guvenPuani.toplamPuan}/100 puan (kaynak: ${cuzdanVerisi.veriKaynagi})`
    );

    return NextResponse.json(guvenPuani, {
      headers: {
        // 5 dakika önbelleğe al (güven puanı sık değişmez)
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (hata) {
    const hataMesaji =
      hata instanceof Error ? hata.message : 'Bilinmeyen bir hata oluştu';

    console.error(`[API/trust] Hata (${adres.substring(0, 8)}...):`, hata);

    return NextResponse.json(
      {
        hata: `Güven puanı hesaplanamadı: ${hataMesaji}`,
        adres,
      },
      { status: 500 }
    );
  }
}
