import { NextRequest, NextResponse } from 'next/server';
import type { TranskripsiyonYaniti } from '@/types';

const GROQ_TRANSCRIBE_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

export async function POST(request: NextRequest) {
  const apiAnahtari = process.env.GROQ_API_KEY;
  if (!apiAnahtari || apiAnahtari === 'YOUR_GROQ_KEY_HERE') {
    return NextResponse.json(
      { hata: 'GROQ_API_KEY ayarlanmamış. .env.local dosyasını düzenleyin.' },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { hata: 'İstek gövdesi ayrıştırılamadı. Multipart/form-data gereklidir.' },
      { status: 400 }
    );
  }

  const sesDosyasi = form.get('ses');
  if (!sesDosyasi || !(sesDosyasi instanceof Blob)) {
    return NextResponse.json(
      { hata: '"ses" alanı zorunludur ve bir dosya olmalıdır.' },
      { status: 400 }
    );
  }

  if (sesDosyasi.size > 25 * 1024 * 1024) {
    return NextResponse.json(
      { hata: `Ses dosyası çok büyük (${(sesDosyasi.size / 1024 / 1024).toFixed(1)}MB). Maksimum 25MB.` },
      { status: 400 }
    );
  }

  if (sesDosyasi.size < 500) {
    return NextResponse.json(
      { hata: 'Ses dosyası çok küçük. En az 1 saniye konuşun.' },
      { status: 400 }
    );
  }

  const dilParametresi = form.get('dil');
  const seciliDil =
    typeof dilParametresi === 'string' && dilParametresi !== 'auto'
      ? dilParametresi
      : 'tr';

  const mimeTuru = sesDosyasi.type || 'audio/webm';
  let uzanti = 'webm';
  if (mimeTuru.includes('ogg')) uzanti = 'ogg';
  else if (mimeTuru.includes('mp4')) uzanti = 'mp4';
  else if (mimeTuru.includes('wav')) uzanti = 'wav';
  else if (mimeTuru.includes('mp3') || mimeTuru.includes('mpeg')) uzanti = 'mp3';

  try {
    console.log(
      `[API/transcribe] Groq Whisper başlıyor — boyut: ${(sesDosyasi.size / 1024).toFixed(1)}KB, dil: ${seciliDil}`
    );

    const apiFormData = new FormData();
    apiFormData.append('file', sesDosyasi, `audio.${uzanti}`);
    apiFormData.append('model', 'whisper-large-v3');
    apiFormData.append('language', seciliDil);
    apiFormData.append('response_format', 'verbose_json');
    apiFormData.append('prompt', 'Negotiation about cryptocurrency, autonomous drones, and computer vision. Keywords: Solana, SOL, Two Solana, 2 SOL, Jetson Nano, YOLOv11, smart contract, escrow, payment.');

    const yanit = await fetch(GROQ_TRANSCRIBE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiAnahtari}`,
      },
      body: apiFormData,
    });

    if (!yanit.ok) {
      const hataVerisi = await yanit.json().catch(() => ({}));
      console.error('[API/transcribe] Groq API hatası:', yanit.status, hataVerisi);
      if (yanit.status === 401) {
        return NextResponse.json(
          { hata: 'Geçersiz Groq API anahtarı (401). .env.local dosyasını kontrol edin.' },
          { status: 401 }
        );
      }
      if (yanit.status === 429) {
        return NextResponse.json(
          { hata: 'Groq API istek limiti aşıldı (429). Birkaç saniye bekleyin.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { hata: `Groq API hatası: ${yanit.status}` },
        { status: yanit.status }
      );
    }

    const veri = await yanit.json();
    const metin = (veri.text ?? '').trim();
    const algilanenDil = veri.language ?? seciliDil;

    if (!metin) {
      return NextResponse.json(
        { hata: 'Ses dosyasında konuşma tespit edilemedi. Tekrar deneyin.' },
        { status: 422 }
      );
    }

    console.log(
      `[API/transcribe] Tamamlandı — dil: ${algilanenDil}, metin: "${metin.substring(0, 60)}..."`
    );

    const sonuc: TranskripsiyonYaniti = { metin, dil: algilanenDil };
    return NextResponse.json(sonuc);
  } catch (hata) {
    console.error('[API/transcribe] Bağlantı hatası:', hata);
    return NextResponse.json(
      { hata: `Transkripsiyon başarısız: ${hata instanceof Error ? hata.message : 'Bilinmeyen hata'}` },
      { status: 500 }
    );
  }
}
