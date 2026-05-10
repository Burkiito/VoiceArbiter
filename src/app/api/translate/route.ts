import { NextRequest, NextResponse } from 'next/server';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  const apiAnahtari = process.env.GROQ_API_KEY;
  if (!apiAnahtari || apiAnahtari === 'YOUR_GROQ_KEY_HERE') {
    return NextResponse.json({ hata: 'GROQ_API_KEY not configured.' }, { status: 503 });
  }

  let govde: { text?: string; targetLang?: string };
  try {
    govde = await request.json();
  } catch {
    return NextResponse.json({ hata: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!govde.text || !govde.targetLang) {
    return NextResponse.json({ hata: '"text" and "targetLang" are required.' }, { status: 400 });
  }

  try {
    const yanit = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiAnahtari}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are a direct translator. Translate the text to the language code ${govde.targetLang}. Return ONLY the translated text. No quotes, no intro.`,
          },
          {
            role: 'user',
            content: govde.text,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!yanit.ok) {
      const err = await yanit.json().catch(() => ({}));
      console.error('[API/translate] Groq error:', yanit.status, err);
      return NextResponse.json({ hata: `Groq API error: ${yanit.status}` }, { status: yanit.status });
    }

    const veri = await yanit.json();
    const translatedText = (veri.choices?.[0]?.message?.content ?? '').trim();

    return NextResponse.json({ translatedText });
  } catch (hata) {
    console.error('[API/translate] Error:', hata);
    return NextResponse.json(
      { hata: `Translation failed: ${hata instanceof Error ? hata.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
