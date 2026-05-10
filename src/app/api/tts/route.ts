import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const VARSAYILAN_SES_ID = 'pNInz6obpgDQGcFmaJgB';

export async function POST(request: NextRequest) {
  const apiAnahtari = process.env.ELEVENLABS_API_KEY;

  if (!apiAnahtari || apiAnahtari === 'senin_elevenlabs_anahtarin') {
    return NextResponse.json(
      { hata: 'ELEVENLABS_API_KEY ayarlanmamış. .env.local dosyasını düzenleyin.' },
      { status: 503 }
    );
  }

  let govde: { metin?: string; sesId?: string };
  try {
    govde = await request.json();
  } catch {
    return NextResponse.json({ hata: 'Geçersiz JSON gövdesi.' }, { status: 400 });
  }

  if (!govde.metin || typeof govde.metin !== 'string' || !govde.metin.trim()) {
    return NextResponse.json({ hata: '"metin" alanı zorunludur.' }, { status: 400 });
  }

  const sesId = govde.sesId ?? VARSAYILAN_SES_ID;

  try {
    const yanit = await fetch(`${ELEVENLABS_TTS_URL}/${sesId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiAnahtari,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: govde.metin,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!yanit.ok) {
      const hataMetni = await yanit.text().catch(() => '');
      console.error(`[API/tts] ElevenLabs ${yanit.status}:`, hataMetni);

      if (yanit.status === 401) {
        return NextResponse.json(
          { hata: 'Geçersiz ElevenLabs API anahtarı (401). ELEVENLABS_API_KEY değerini kontrol edin.' },
          { status: 401 }
        );
      }
      if (yanit.status === 429) {
        return NextResponse.json(
          { hata: 'ElevenLabs API istek limiti aşıldı (429). Kısa süre bekleyin.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { hata: `ElevenLabs API hatası: ${yanit.status}` },
        { status: yanit.status }
      );
    }

    const sesVerisi = await yanit.arrayBuffer();

    return new NextResponse(sesVerisi, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': sesVerisi.byteLength.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (hata) {
    console.error('[API/tts] Bağlantı hatası:', hata);
    return NextResponse.json(
      { hata: `TTS başarısız: ${hata instanceof Error ? hata.message : 'Bilinmeyen hata'}` },
      { status: 500 }
    );
  }
}
